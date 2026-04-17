const mongoose = require("mongoose");
const AssignmentModel = require("../models/AssignmentModel");
const EmployeeModel = require("../models/EmployeeModel");
const LaptopModel = require("../models/LaptopModel");
const IndividualLaptopModel = require("../models/IndividualLaptopModel");
const SoftwareModel = require("../models/SoftwareModel");
const IndividualSoftwareLicenseModel = require("../models/IndividualSoftwareLicenseModel");

/**
 * AssignmentService
 * Handles multi-database interactions.
 * Now smartly routes "Software" based on whether it is tracked (seats) or untracked (perpetual).
 */

const createAssignment = async (data, assignedByAdmin) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employee = await EmployeeModel.findById(data.employeeId).session(session);
    if (!employee) throw new Error("Employee not found");

    let assetName = "";
    let purchaseDate = null;
    // ================= LAPTOP =================
    if (data.assetType === "Laptop") {
      const existingLaptop = await AssignmentModel.findOne({
    employeeId: new mongoose.Types.ObjectId(data.employeeId),
    assetType: "Laptop",
    status: "Assigned",
  }).session(session);

  if (existingLaptop) {
    throw new Error("Employee already has a laptop assigned");
  }

  // 🔥 2. Validate input
  if (!data.laptopAssetId) {
    throw new Error("Laptop asset ID is required");
  }
      const laptop = await IndividualLaptopModel.findById(data.laptopAssetId).session(session);

      if (!laptop) throw new Error("Laptop not found");
      if (laptop.status !== "Available") {
        throw new Error(`Laptop is ${laptop.status}`);
      }

      laptop.status = "Assigned";
      laptop.assignedTo = employee._id;
      await laptop.save({ session });

      const parent = await LaptopModel.findById(laptop.laptopModelId).session(session);
      if (parent) {
        parent.inUse += 1;
        await parent.save({ session });
      }

      assetName = `${laptop.modelName} (SN: ${laptop.serialNumber})`;
      purchaseDate = laptop.purchaseDate; // 🔥 FIX

      employee.assignedLaptops += 1;
    }

    // ================= SOFTWARE =================
    else if (data.assetType === "Software") {
  const seat = await IndividualSoftwareLicenseModel
    .findById(data.softwareId)
    .session(session);

  if (!seat) throw new Error("Software seat not found");

  if (seat.status !== "Available") {
    throw new Error("License already assigned");
  }

  // Assign seat
  seat.status = "Assigned";
  seat.assignedTo = employee._id;
  await seat.save({ session });

  // Update parent
  const parent = await SoftwareModel
    .findById(seat.softwareModelId)
    .session(session);

  if (parent) {
    parent.usedLicenses += 1;
    await parent.save({ session });
  }

  assetName = `${seat.softwareName} (${seat.licenseKeyOrSeatName})`;

  employee.assignedSoftware += 1;
}
    else {
      throw new Error("Invalid asset type");
    }

    await employee.save({ session });

    // ================= CREATE ASSIGNMENT =================
    const assignment = new AssignmentModel({
      employeeId: employee._id,
      employeeName: employee.name,
      assetType: data.assetType,

      laptopModelId: data.laptopModelId || null,
      laptopAssetId: data.laptopAssetId || null,
      softwareId: data.softwareId || null,

      assetName,
      assignDate: data.assignDate,
      assignedBy: assignedByAdmin,
      purchaseDate, // 🔥 FIX
    });

    await assignment.save({ session });

    await session.commitTransaction();
    return assignment;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllAssignments = async (query = {}) => {
  const { page = 1, limit = 10, search, status, type, employeeId } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { employeeName: { $regex: search, $options: "i" } },
      { assetName: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "All") {
    filter.status = status;
  }

  if (type && type !== "All") {
    filter.assetType = type;
  }

  if (employeeId) {
    filter.employeeId = employeeId;
  }

  const skip = (page - 1) * limit;

  const data = await AssignmentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalCount = await AssignmentModel.countDocuments(filter);

  // Stats calculation via aggregate (we only filter by employeeId if requested, e.g. for "My Assignments")
  const aggregateQuery = {};
  if (employeeId) {
    aggregateQuery.employeeId = new mongoose.Types.ObjectId(employeeId);
  }

  const statsArray = await AssignmentModel.aggregate([
    { $match: aggregateQuery },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        assigned: { $sum: { $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0] } },
        returned: { $sum: { $cond: [{ $eq: ["$status", "Returned"] }, 1, 0] } },
        laptops: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$assetType", "Laptop"] }, { $eq: ["$status", "Assigned"] }] },
              1,
              0,
            ],
          },
        },
        software: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$assetType", "Software"] }, { $eq: ["$status", "Assigned"] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const stats = statsArray.length > 0 ? {
    total: statsArray[0].total,
    assigned: statsArray[0].assigned,
    returned: statsArray[0].returned,
    laptops: statsArray[0].laptops,
    software: statsArray[0].software,
  } : {
    total: 0,
    assigned: 0,
    returned: 0,
    laptops: 0,
    software: 0,
  };

  return { data, totalCount, stats };
};

const getAssignmentById = async (id) => {
  const assignment = await AssignmentModel.findById(id);
  if (!assignment) throw new Error("Assignment not found");
  return assignment;
};

const returnAssignment = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const assignment = await AssignmentModel.findById(id).session(session);
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.status === "Returned") {
      throw new Error("This asset was already returned!");
    }
    const employee = await EmployeeModel.findById(assignment.employeeId).session(session);

    if (assignment.assetType === "Laptop") {
      const laptop = await IndividualLaptopModel.findById(assignment.laptopAssetId).session(session);
      if (laptop) {
        laptop.status = "Available";
        laptop.assignedTo = null;
        await laptop.save({ session });

        const parentCatalog = await LaptopModel.findById(laptop.laptopModelId).session(session);
        if (parentCatalog) {
          parentCatalog.inUse = Math.max(0, parentCatalog.inUse - 1);
          await parentCatalog.save({ session });
        }
      }
      if (employee) {
        employee.assignedLaptops = Math.max(0, employee.assignedLaptops - 1);
      }

    } else if (assignment.assetType === "Software") {
      let seat = await IndividualSoftwareLicenseModel.findById(assignment.softwareId).session(session);
      
      if (seat) {
        seat.status = "Available";
        seat.assignedTo = null;
        await seat.save({ session });

        const parent = await SoftwareModel.findById(seat.softwareModelId).session(session);
        if (parent) {
          parent.usedLicenses = Math.max(0, parent.usedLicenses - 1);
          await parent.save({ session });
        }
      }

      if (employee) {
        employee.assignedSoftware = Math.max(0, employee.assignedSoftware - 1);
      }
    }

    if (employee) await employee.save({ session });

    assignment.status = "Returned";
    assignment.returnDate = new Date().toISOString().split("T")[0];

    await assignment.save({ session });
    await session.commitTransaction(); // CRITICAL BUG FIX PRESERVED!
    return assignment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  returnAssignment,
};
