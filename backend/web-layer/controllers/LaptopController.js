const laptopService = require("../../service-layer/services/LaptopService");

/**
 * LaptopController
 * This file handles all HTTP requests originating from the frontend.
 * It does NOT interact directly with the DB. Instead, it captures the 
 * Request (req) body/parameters, asks the LaptopService to do the work, 
 * and then sends back a formatted JSON Response (res).
 */

// 1. CREATE a new Laptop
const createLaptop = async (req, res) => {
  try {
    // Call the Service Layer, passing the data sent in the HTTP Request Body
    const newLaptop = await laptopService.createLaptop(req.body);
    
    // HTTP 201 means "Created"
    res.status(201).json({ 
      success: true, 
      message: "Laptop created successfully!", 
      data: newLaptop 
    });
  } catch (error) {
    // If the Service throws an error (e.g., Duplicate Name), we catch it here
    // HTTP 400 means "Bad Request" (user error)
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. READ all Laptops
const getAllLaptops = async (req, res) => {
  try {
    // We can extract search filters from the URL query later if needed
    // e.g., /api/laptops?brand=Dell -> req.query.brand
    const filters = req.query || {};
    
    // Call the Service Layer to fetch data
    const laptops = await laptopService.getAllLaptops(filters);
    
    // HTTP 200 means "OK"
    res.status(200).json({ success: true, count: laptops.length, data: laptops });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error: Could not fetch laptops." });
  }
};

// 3. READ a single Laptop by its ID
const getLaptopById = async (req, res) => {
  try {
    // Express extracts the dynamic part of the URL (e.g., /api/laptops/12345)
    // and stores it in req.params
    const laptopId = req.params.id;
    
    const laptop = await laptopService.getLaptopById(laptopId);
    res.status(200).json({ success: true, data: laptop });
  } catch (error) {
    // HTTP 404 means "Not Found"
    res.status(404).json({ success: false, message: error.message });
  }
};

// 4. UPDATE a Laptop by ID
const updateLaptop = async (req, res) => {
  try {
    const laptopId = req.params.id; // Get the ID from URL
    const updateData = req.body;    // Get the new data from the Request Body
    
    const updatedLaptop = await laptopService.updateLaptop(laptopId, updateData);
    res.status(200).json({ 
      success: true, 
      message: "Laptop updated successfully!", 
      data: updatedLaptop 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. DELETE a Laptop by ID
const deleteLaptop = async (req, res) => {
  try {
    const laptopId = req.params.id; // Get the ID from URL
    
    await laptopService.deleteLaptop(laptopId);
    
    res.status(200).json({ 
      success: true, 
      message: "Laptop deleted successfully!" 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLaptop,
  getAllLaptops,
  getLaptopById,
  updateLaptop,
  deleteLaptop
};
