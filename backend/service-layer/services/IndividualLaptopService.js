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
const getAllPhysicalLaptops = async (page, limit, filter) => {
  const skip = (page - 1) * limit;
  
  const hardwareList = await IndividualLaptopModel.find(filter)
    .sort({ index: 1 })
    .skip(skip)
    .limit(limit);
    
  const totalCount = await IndividualLaptopModel.countDocuments(filter);
  
  return { hardwareList, totalCount };
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

    // FIX 2: Make serial number and laptopModelId immutable
    // Check if they exist in the payload and actively differ from the current DB record
    if (updateData.serialNumber && updateData.serialNumber !== laptop.serialNumber) {
      throw new Error("Serial number cannot be changed after creation. Delete this record and re-add it if entered incorrectly.");
    }
    if (updateData.laptopModelId && updateData.laptopModelId.toString() !== laptop.laptopModelId.toString()) {
      throw new Error("Parent laptop model cannot be reassigned. Delete this record and create a new one under the correct model.");
    }

    // FIX 1: Block illegal status transitions from 'Assigned'
    if (updateData.status && laptop.status === "Assigned" && updateData.status !== "Assigned") {
      throw new Error(`Cannot change status from Assigned to ${updateData.status}. Please return the asset from the employee first.`);
    }

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
