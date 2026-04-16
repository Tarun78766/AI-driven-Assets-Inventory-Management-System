const assignmentService = require("../../service-layer/services/AssignmentService");

/**
 * AssignmentController
 * Responsible for handling incoming API requests for Assignments.
 */

// 1. CREATE Assignment
const createAssignment = async (req, res) => {
  try {
    // In a full production app, you can extract the Admin's name from `req.user`
    // (set by AuthMiddleware) to record exactly who handed out the equipment!
    // For now, we will default it to "System Admin" or whatever role is in the JWT.
    const assignedByAdmin = req.user ? req.user.role : "System Admin";

    const newAssignment = await assignmentService.createAssignment(req.body, assignedByAdmin);
    res.status(201).json({ 
      success: true, 
      message: "Asset successfully assigned to the employee!", 
      data: newAssignment 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. READ All Assignments
const getAllAssignments = async (req, res) => {
  try {
    const result = await assignmentService.getAllAssignments(req.query);
    res.status(200).json({ 
      success: true, 
      data: result.data,
      totalCount: result.totalCount,
      stats: result.stats 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching assignments." });
  }
};

// 3. READ Single Assignment
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// 4. RETURN an Assignment
const returnAssignment = async (req, res) => {
  try {
    // Notice this uses the specialized `returnAssignment` logic from our Service
    const returnedAssignment = await assignmentService.returnAssignment(req.params.id);
    res.status(200).json({ 
      success: true, 
      message: "Asset returned to inventory successfully!", 
      data: returnedAssignment 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. DELETE an Assignment (Wipes the history completely)
const deleteAssignment = async (req, res) => {
  try {
    await assignmentService.deleteAssignment(req.params.id);
    res.status(200).json({ success: true, message: "Assignment record deleted successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 6. GET My Assignments (Filtered by logged in User ID)
const getMyAssignments = async (req, res) => {
  try {
    // Inject the authenticated employeeId into the query filters
    const query = { employeeId: req.user.id, ...req.query };
    const result = await assignmentService.getAllAssignments(query);
    res.status(200).json({ 
      success: true, 
      data: result.data,
      totalCount: result.totalCount,
      stats: result.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching assignments." });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  returnAssignment,
  deleteAssignment,
  getMyAssignments
};
