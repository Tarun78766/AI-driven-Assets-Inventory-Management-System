const softwareService = require("../../service-layer/services/SoftwareService");

/**
 * SoftwareController
 * This file handles HTTP requests from the frontend or Postman.
 * It intercepts the request, grabs any data (req.body or req.params.id),
 * passes it into our service logic, and responds with a neat JSON object.
 */

// 1. CREATE a new Software (POST /api/software)
const createSoftware = async (req, res) => {
  try {
    // We expect the frontend to send the software details in req.body
    const newSoftware = await softwareService.createSoftware(req.body);
    
    // Status 201: Created
    res.status(201).json({ 
      success: true, 
      message: "Software added successfully!", 
      data: newSoftware 
    });
  } catch (error) {
    // If the service throws an error (e.g. it was a duplicate), we catch it here.
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. READ all Software (GET /api/software)
const getAllSoftware = async (req, res) => {
  try {
    // Use req.query to capture frontend filtering later (e.g. ?vendor=Microsoft)
    const filters = req.query || {};
    
    const softwareList = await softwareService.getAllSoftware(filters);
    
    res.status(200).json({ 
      success: true, 
      count: softwareList.length, 
      data: softwareList 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch software licenses." });
  }
};

// 3. READ single Software by ID (GET /api/software/:id)
const getSoftwareById = async (req, res) => {
  try {
    // Extract the exact ID from the URL params
    const softwareId = req.params.id;
    
    const software = await softwareService.getSoftwareById(softwareId);
    
    res.status(200).json({ success: true, data: software });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// 4. UPDATE a Software (PUT /api/software/:id)
const updateSoftware = async (req, res) => {
  try {
    const softwareId = req.params.id;
    const updateData = req.body;
    
    // Call our service to do the heavy lifting of updating MongoDB
    const updatedSoftware = await softwareService.updateSoftware(softwareId, updateData);
    
    res.status(200).json({ 
      success: true, 
      message: "Software updated successfully!", 
      data: updatedSoftware 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. DELETE a Software (DELETE /api/software/:id)
const deleteSoftware = async (req, res) => {
  try {
    const softwareId = req.params.id;
    
    await softwareService.deleteSoftware(softwareId);
    
    res.status(200).json({ success: true, message: "Software deleted successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSoftware,
  getAllSoftware,
  getSoftwareById,
  updateSoftware,
  deleteSoftware
};
