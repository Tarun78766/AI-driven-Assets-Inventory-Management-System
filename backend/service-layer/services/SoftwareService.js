const SoftwareModel = require("../models/SoftwareModel");

/**
 * SoftwareService
 * This file handles all the Business Logic for Software Licenses.
 * Just like LaptopService, it interacts directly with MongoDB.
 */

// 1. CREATE a new Software License entry
const createSoftware = async (softwareData) => {
  // Prevent exact duplicates of the same Software + Vendor combination
  const existingSoftware = await SoftwareModel.findOne({ 
    name: softwareData.name, 
    vendor: softwareData.vendor 
  });
  
  if (existingSoftware) {
    throw new Error("This software product from this vendor already exists in your inventory.");
  }
  
  const software = new SoftwareModel(softwareData);
  await software.save();
  
  return software;
};

// 2. READ (Get) all Software Licenses
const getAllSoftware = async (filters = {}) => {
  // Retrieve all software from the DB, sorted from newest to oldest
  const softwareList = await SoftwareModel.find(filters).sort({ createdAt: -1 });
  return softwareList;
};

// 3. READ (Get) a single Software License by ID
const getSoftwareById = async (softwareId) => {
  const software = await SoftwareModel.findById(softwareId);
  if (!software) {
    throw new Error("Software not found");
  }
  return software;
};

// 4. UPDATE a Software License
const updateSoftware = async (softwareId, updateData) => {
  const updatedSoftware = await SoftwareModel.findByIdAndUpdate(softwareId, updateData, {
    new: true, // Returns the newly updated document instead of the old one
    runValidators: true, // Re-runs schema checks (like ensuring cost is a number)
  });

  if (!updatedSoftware) {
    throw new Error("Software not found or could not be updated");
  }

  return updatedSoftware;
};

// 5. DELETE a Software License
const deleteSoftware = async (softwareId) => {
  const deletedSoftware = await SoftwareModel.findByIdAndDelete(softwareId);
  if (!deletedSoftware) {
    throw new Error("Software not found or already deleted");
  }
  return true;
};

module.exports = {
  createSoftware,
  getAllSoftware,
  getSoftwareById,
  updateSoftware,
  deleteSoftware
};
