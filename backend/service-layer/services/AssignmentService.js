const AssignmentModel = require("../models/AssignmentModel");
const EmployeeModel = require("../models/EmployeeModel");
const LaptopModel = require("../models/LaptopModel");
const SoftwareModel = require("../models/SoftwareModel");

/**
 * AssignmentService
 * This is our most advanced service!
 * When handing out equipment, we must update 3 different databases at the exact same time:
 * 1. Create the Assignment record.
 * 2. Decrease the Laptop/Software "available" count.
 * 3. Increase the Employee's "assignedLaptops/Software" counter.
 */

// 1. CREATE a new Assignment (Hand out equipment)
const createAssignment = async (data, assignedByAdmin) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // A. Verify Employee exists
    const employee = await EmployeeModel.findById(data.employeeId).session(
      session,
    );
    if (!employee) throw new Error("Employee not found in database.");

    let assetName = "";

    // B. Verification & Deduction based on Asset Type
    if (data.assetType === "Laptop") {
      const laptop = await LaptopModel.findById(data.assetId).session(session);
      if (!laptop) throw new Error("Laptop not found.");
      if (laptop.available <= 0)
        throw new Error("Out of stock! No laptops available to assign.");

      // Deduct from Inventory
      laptop.available -= 1;
      laptop.inUse += 1;
      await laptop.save({ session });

      // Add to Employee tracking
      assetName = laptop.modelName;
      employee.assignedLaptops += 1;
    } else if (data.assetType === "Software") {
      const software = await SoftwareModel.findById(data.assetId).session(
        session,
      );
      if (!software) throw new Error("Software not found.");
      if (software.usedLicenses >= software.totalLicenses)
        throw new Error("All software licenses are currently in use!");

      // Deduct from Inventory
      software.usedLicenses += 1;
      await software.save({ session });

      // Add to Employee tracking
      assetName = software.name;
      employee.assignedSoftware += 1;
    } else {
      throw new Error("Invalid Asset Type. Must be 'Laptop' or 'Software'.");
    }

    // C. Save the Employee's new counters
    await employee.save({ session });

    // D. Create and save the actual Assignment receipt
    const assignment = new AssignmentModel({
      employeeId: employee._id,
      employeeName: employee.name,
      assetType: data.assetType,
      assetId: data.assetId,
      assetName: assetName,
      assignDate: data.assignDate,
      assignedBy: assignedByAdmin, // The name of the Admin extracting this token
    });

    await assignment.save({ session });
    return assignment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
// 2. READ All Assignments
const getAllAssignments = async (filters = {}) => {
  return await AssignmentModel.find(filters).sort({ createdAt: -1 });
};

// 3. READ Single Assignment
const getAssignmentById = async (id) => {
  const assignment = await AssignmentModel.findById(id);
  if (!assignment) throw new Error("Assignment not found");
  return assignment;
};

// 4. RETURN an Assignment (The opposite of Create!)
const returnAssignment = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const assignment = await AssignmentModel.findById(id).session(session);
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.status === "Returned")
      throw new Error("This asset was already returned!");

    // A. Fetch the Employee
    const employee = await EmployeeModel.findById(assignment.employeeId).session(session);

    // B. Restore Inventory counts
    if (assignment.assetType === "Laptop") {
      const laptop = await LaptopModel.findById(assignment.assetId).session(session);
      if (laptop) {
        laptop.available += 1;
        laptop.inUse -= 1;
        await laptop.save({ session });
      }
      if (employee)
        employee.assignedLaptops = Math.max(0, employee.assignedLaptops - 1);
    } else if (assignment.assetType === "Software") {
      const software = await SoftwareModel.findById(assignment.assetId).session(session);
      if (software) {
        software.usedLicenses = Math.max(0, software.usedLicenses - 1);
        await software.save({session});
      }
      if (employee)
        employee.assignedSoftware = Math.max(0, employee.assignedSoftware - 1);
    }

    if (employee) await employee.save({session});

    // C. Mark Assignment as Returned
    assignment.status = "Returned";
    // Get today's date in YYYY-MM-DD format
    assignment.returnDate = new Date().toISOString().split("T")[0];

    await assignment.save({session});
    return assignment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}


module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  returnAssignment,
};
