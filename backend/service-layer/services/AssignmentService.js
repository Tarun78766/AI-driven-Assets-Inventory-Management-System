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
    if (!employee) throw new Error("Employee not found in database.");

    let assetName = "";

    if (data.assetType === "Laptop") {
      const laptop = await IndividualLaptopModel.findById(data.laptopAssetId).session(session);
      if (!laptop) throw new Error("Physical Laptop Asset not found.");
      if (laptop.status !== "Available") {
        throw new Error(`This laptop is currently ${laptop.status} and cannot be assigned.`);
      }

      laptop.status = "Assigned";
      laptop.assignedTo = employee._id;
      await laptop.save({ session });

      const parentCatalog = await LaptopModel.findById(laptop.laptopModelId).session(session);
      if (parentCatalog) {
        parentCatalog.inUse += 1;
        await parentCatalog.save({ session });
      }

      assetName = `${laptop.modelName} (SN: ${laptop.serialNumber})`;
      employee.assignedLaptops += 1;

    } else if (data.assetType === "Software") {
      // DUAL PATH LOGIC: Check if data.assetId is an exact tracked seat, or a generic software parent
      let seat = await IndividualSoftwareLicenseModel.findById(data.assetId).session(session);
      
      if (seat) {
        // [PATH A] Tracked Specific Seat
        if (seat.status !== "Available") throw new Error("This specific license seat is already assigned.");
        seat.status = "Assigned";
        seat.assignedTo = employee._id;
        await seat.save({ session });

        const parent = await SoftwareModel.findById(seat.softwareModelId).session(session);
        if (parent) {
          parent.usedLicenses += 1;
          await parent.save({ session });
        }
        assetName = `${seat.softwareName} (Key: ${seat.licenseKeyOrSeatName})`;

      } else {
        // [PATH B] Untracked / Unlimited Software (e.g., Open Source)
        const parentSoftware = await SoftwareModel.findById(data.assetId).session(session);
        if (!parentSoftware) throw new Error("Software asset or seat not found.");

        const trackedTypes = ["Subscription", "Licensed", "Per Seat"];
        if (trackedTypes.includes(parentSoftware.licenseType)) {
          throw new Error(`This software (${parentSoftware.licenseType}) requires you to assign a specific tracked Seat/License Key, rather than the generic catalog entry.`);
        }

        // Technically unlimited, but we still increment the used counter just to see how many people use it
        parentSoftware.usedLicenses += 1;
        await parentSoftware.save({ session });
        assetName = parentSoftware.name;
      }

      employee.assignedSoftware += 1;

    } else {
      throw new Error("Invalid Asset Type. Must be 'Laptop' or 'Software'.");
    }

    await employee.save({ session });

    const assignment = new AssignmentModel({
      employeeId: employee._id,
      employeeName: employee.name,
      assetType: data.assetType,
      laptopAssetId: data.laptopAssetId,
      softwareAssetId: data.softwareAssetId,
      assetName: assetName,
      assignDate: data.assignDate,
      assignedBy: assignedByAdmin,
    });
    console.log(assignment);

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
      let seat = await IndividualSoftwareLicenseModel.findById(assignment.softwareAssetId).session(session);
      
      if (seat) {
        // Restoring a specific tracked seat
        seat.status = "Available";
        seat.assignedTo = null;
        await seat.save({ session });

        const parent = await SoftwareModel.findById(seat.softwareModelId).session(session);
        if (parent) {
          parent.usedLicenses = Math.max(0, parent.usedLicenses - 1);
          await parent.save({ session });
        }
      } else {
        // Restoring an untracked generic software assignment
        const parentSoftware = await SoftwareModel.findById(assignment.softwareAssetId).session(session);
        if (parentSoftware) {
          parentSoftware.usedLicenses = Math.max(0, parentSoftware.usedLicenses - 1);
          await parentSoftware.save({ session });
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
