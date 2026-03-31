const EmployeeModel = require("../models/EmployeeModel");

/**
 * EmployeeService
 * Directly handles Database logic for adding, reading, editing, and deleting 
 * Employee records within MongoDB. Independent of any HTTP logic.
 */

// 1. CREATE a new Employee
const createEmployee = async (employeeData) => {
  // Check to prevent creating duplicate employees using the same unique email address
  const existingEmployee = await EmployeeModel.findOne({ email: employeeData.email });
  if (existingEmployee) {
    throw new Error("An employee with this email address already exists.");
  }
  
  // Create mapping object
  const employee = new EmployeeModel(employeeData);
  
  // Save permanently
  await employee.save();
  return employee;
};

// 2. READ All Employees
const getAllEmployees = async (filters = {}) => {
  // Returns all the employees, newest joined first
  const employees = await EmployeeModel.find(filters).sort({ createdAt: -1 });
  return employees;
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
  const updatedEmployee = await EmployeeModel.findByIdAndUpdate(id, updateData, {
    new: true, // we want the newly modified employee details returned
    runValidators: true, // ensure we don't accidentally save an invalid enum like Status="SuperFakeActive"
  });

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
  deleteEmployee
};
