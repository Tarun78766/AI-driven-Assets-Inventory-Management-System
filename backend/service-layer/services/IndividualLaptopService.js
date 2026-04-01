const mongoose = require("mongoose");
const IndividualLaptopModel = require("../models/IndividualLaptopModel");
const LaptopModel = require("../models/LaptopModel");

/**
 * IndividualLaptopService
 * Handles operations specifically for physical laptops (with serial numbers).
 */

// 1. ADD a new physical laptop
const addPhysicalLaptop = async (data) => {
  // Start a transaction because we need to safely update both the Individual list AND the Parent catalog
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // A. Verify the Parent Model (e.g., "Dell XPS 15") exists in our catalog
    const parentLaptop = await LaptopModel.findById(data.laptopModelId).session(session);
    if (!parentLaptop) {
      throw new Error("Parent Laptop Model not found. Cannot attach physical laptop.");
    }

    // B. Ensure Serial Number doesn't already exist
    const existingHardware = await IndividualLaptopModel.findOne({ serialNumber: data.serialNumber }).session(session);
    if (existingHardware) {
      throw new Error(`A laptop with Serial Number ${data.serialNumber} already exists!`);
    }

    // C. Create the physical laptop record
    const newHardware = new IndividualLaptopModel({
      laptopModelId: parentLaptop._id,
      modelName: parentLaptop.modelName, // Denormalized for easy viewing
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      conditionNotes: data.conditionNotes || "",
      status: "Available" // Defaults to available for immediate sign-out
    });
    
    await newHardware.save({ session });

    // D. Update the Parent Catalog's total asset count
    parentLaptop.totalAssets += 1;
    await parentLaptop.save({ session });

    // E. Commit the transaction
    await session.commitTransaction();
    return newHardware;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 2. READ All physical laptops
const getAllPhysicalLaptops = async (filters = {}) => {
  // Can filter by { status: "Available" } or by specific serial number
  return await IndividualLaptopModel.find(filters).sort({ createdAt: -1 });
};

// 3. READ Single physical laptop by ID
const getPhysicalLaptopById = async (id) => {
  const laptop = await IndividualLaptopModel.findById(id);
  if (!laptop) throw new Error("Physical laptop not found.");
  return laptop;
};

// 4. UPDATE a physical laptop (e.g. mark it "Under Repair")
const updatePhysicalLaptop = async (id, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const laptop = await IndividualLaptopModel.findById(id).session(session);
    if (!laptop) throw new Error("Physical laptop not found.");

    // Handle special transition: If they are marking it "Under Repair"
    if (updateData.status === "Under Repair" && laptop.status !== "Under Repair") {
      const parent = await LaptopModel.findById(laptop.laptopModelId).session(session);
      if (parent) {
        parent.underRepair += 1;
        // If it was "Available" before, it's no longer available for new assignments
        await parent.save({ session });
      }
    } else if (updateData.status === "Available" && laptop.status === "Under Repair") {
      // It is fixed! Let's reflect that in the parent catalog
      const parent = await LaptopModel.findById(laptop.laptopModelId).session(session);
      if (parent) {
        parent.underRepair = Math.max(0, parent.underRepair - 1);
        await parent.save({ session });
      }
    }

    // Apply the updates (like new conditionNotes or new status)
    Object.assign(laptop, updateData);
    await laptop.save({ session });

    await session.commitTransaction();
    return laptop;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 5. DELETE a physical laptop (e.g. thrown away permanently)
const removePhysicalLaptop = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const laptop = await IndividualLaptopModel.findById(id).session(session);
    if (!laptop) throw new Error("Physical laptop not found.");

    if (laptop.status === "Assigned") {
       throw new Error("Cannot delete a laptop currently assigned to an employee! Return it first.");
    }

    // Deduct from Parent Catalog total
    const parent = await LaptopModel.findById(laptop.laptopModelId).session(session);
    if (parent) {
      parent.totalAssets = Math.max(0, parent.totalAssets - 1);
      if (laptop.status === "Under Repair") {
        parent.underRepair = Math.max(0, parent.underRepair - 1);
      }
      await parent.save({ session });
    }

    await IndividualLaptopModel.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  addPhysicalLaptop,
  getAllPhysicalLaptops,
  getPhysicalLaptopById,
  updatePhysicalLaptop,
  removePhysicalLaptop
};
