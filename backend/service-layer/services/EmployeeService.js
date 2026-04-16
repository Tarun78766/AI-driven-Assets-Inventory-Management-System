const EmployeeModel = require("../models/EmployeeModel");
/**
 * EmployeeService
 * Directly handles Database logic for adding, reading, editing, and deleting
 * Employee records within MongoDB. Independent of any HTTP logic.
 */

// 1. CREATE a new Employee
const createEmployee = async (employeeData) => {
  // Check to prevent creating duplicate employees using the same unique email address
  const existingEmployee = await EmployeeModel.findOne({
    _id: employeeData._id,
  });
  if (existingEmployee) {
    throw new Error("An employee with this ID already exists.");
  }

  // Create mapping object
  const employee = new EmployeeModel(employeeData);

  // Save permanently
  await employee.save();
  return employee;
};

// 2. READ All Employees
const getAllEmployees = async (page, limit, filter) => {
  const skip = (page - 1) * limit;
  const totalEmployees = await EmployeeModel.countDocuments();

  const activeEmployees = await EmployeeModel.countDocuments({
    status: "Active",
  });
  const inactiveEmployees = await EmployeeModel.countDocuments({
    status: "Inactive",
  });

  const assetStats = await EmployeeModel.aggregate([
    {
      $group: {
        _id: null,
        totalLaptops: { $sum: "$assignedLaptops" },
        totalSoftwares: { $sum: "$assignedSoftware" },
      },
    },
  ]);
  // Returns all the employees, newest joined first
  const employees = await EmployeeModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return {
    totalEmployees,
    stats: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees,
      totalLaptops: assetStats[0]?.totalLaptops || 0,
      totalSoftware: assetStats[0]?.totalSoftware || 0,
    },
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(totalEmployees / limit),
    data: employees,
  };
};

// 3. READ Single Employee by ID
const getEmployeeById = async (id) => {
  const employee = await EmployeeModel.findById(id);
  if (!employee) {
    throw new Error("Employee not found in the database");
  }
  return employee;
};

// 4. UPDATE an Employee
const updateEmployee = async (id, updateData) => {
  const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
    id,
    updateData,
    {
      returnDocument: "after", // we want the newly modified employee details returned
      runValidators: true, // ensure we don't accidentally save an invalid enum like Status="SuperFakeActive"
    },
  );

  if (!updatedEmployee) {
    throw new Error("Employee not found or could not be updated");
  }

  return updatedEmployee;
};

// 5. DELETE an Employee
const deleteEmployee = async (id) => {
  const deletedEmployee = await EmployeeModel.findByIdAndDelete(id);
  if (!deletedEmployee) {
    throw new Error("Employee not found or already deleted");
  }
  return true;
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
