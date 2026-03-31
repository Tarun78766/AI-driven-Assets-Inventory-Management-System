const employeeService = require("../../service-layer/services/EmployeeService");

/**
 * EmployeeController
 * This file intercepts HTTP requests for Employee data.
 * It grabs parameters from the Request (`req`), asks `EmployeeService`
 * to perform the database operations, and replies with a JSON Response (`res`).
 */

// 1. CREATE an Employee (POST /api/employees)
const createEmployee = async (req, res) => {
  try {
    // Send form data from the React frontend to the Service
    const newEmployee = await employeeService.createEmployee(req.body);
    
    // HTTP 201 Created
    res.status(201).json({ 
      success: true, 
      message: "Employee registered successfully!", 
      data: newEmployee 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. READ All Employees (GET /api/employees)
const getAllEmployees = async (req, res) => {
  try {
    // Collect dropdown filters like ?department=HR if the user passes them
    const filters = req.query || {};
    
    const employees = await employeeService.getAllEmployees(filters);
    
    res.status(200).json({ 
      success: true, 
      count: employees.length, 
      data: employees 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employees." });
  }
};

// 3. READ Single Employee by ID (GET /api/employees/:id)
const getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await employeeService.getEmployeeById(id);
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// 4. UPDATE an Employee (PUT /api/employees/:id)
const updateEmployee = async (req, res) => {
  try {
    const id = req.params.id; // From the URL
    const updateData = req.body; // From the frontend form
    
    const updatedEmployee = await employeeService.updateEmployee(id, updateData);
    res.status(200).json({ 
      success: true, 
      message: "Employee details updated successfully!", 
      data: updatedEmployee 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. DELETE an Employee (DELETE /api/employees/:id)
const deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    await employeeService.deleteEmployee(id);
    res.status(200).json({ success: true, message: "Employee deleted successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
