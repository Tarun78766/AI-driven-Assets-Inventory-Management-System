const LaptopModel = require("../models/LaptopModel");

/**
 * LaptopService
 * This file contains the "Business Logic" for Laptops.
 * It is solely responsible for directly interacting with our MongoDB database.
 * No HTTP/Express stuff here (no req, res)! Just pure data manipulation.
 */

// 1. CREATE a new Laptop
const createLaptop = async (laptopData) => {
  // First, check if a laptop with the exact same Model Name already exists to prevent duplicates
  const existingLaptop = await LaptopModel.findOne({ modelName: laptopData.modelName });
  if (existingLaptop) {
    // If it exists, throw an error. The Controller will catch this and send a 400 Bad Request
    throw new Error("A laptop model with this name already exists in the inventory.");
  }
  
  // Create a new memory instance of LaptopModel populated with the frontend data
  const laptop = new LaptopModel(laptopData);
  
  // Save it permanently to MongoDB
  await laptop.save();
  
  // Return the newly created asset
  return laptop;
};

// 2. READ (Get) all Laptops
const getAllLaptops = async (filters = {}) => {
  // Mongoose's .find() gets everything. 
  // We pass `filters` so later we can easily add search by brand or features.
  // .sort({ createdAt: -1 }) returns the newest added laptops first.
  const laptops = await LaptopModel.find(filters).sort({ createdAt: -1 });
  return laptops;
};

// 3. READ (Get) a single Laptop by its specific MongoDB ID
const getLaptopById = async (laptopId) => {
  // findById is a handy Mongoose shortcut for findOne({ _id: laptopId })
  const laptop = await LaptopModel.findById(laptopId);
  if (!laptop) {
    throw new Error("Laptop not found");
  }
  return laptop;
};

// 4. UPDATE a Laptop
const updateLaptop = async (laptopId, updateData) => {
  // findByIdAndUpdate takes the ID, the new data payload, and an options object
  // { new: true } = Return the newly updated document (otherwise it returns the old pre-update version)
  // { runValidators: true } = Make sure the update still respects our Schema rules (like price being a Number)
  const updatedLaptop = await LaptopModel.findByIdAndUpdate(laptopId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedLaptop) {
    throw new Error("Laptop not found or could not be updated");
  }

  return updatedLaptop;
};

// 5. DELETE a Laptop
const deleteLaptop = async (laptopId) => {
  const deletedLaptop = await LaptopModel.findByIdAndDelete(laptopId);
  if (!deletedLaptop) {
    throw new Error("Laptop not found or already deleted");
  }
  // We don't really need to return the deleted object, just a success indicator
  return true;
};

module.exports = {
  createLaptop,
  getAllLaptops,
  getLaptopById,
  updateLaptop,
  deleteLaptop
};
