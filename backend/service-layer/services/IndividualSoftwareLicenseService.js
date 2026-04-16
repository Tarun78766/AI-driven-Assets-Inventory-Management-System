const mongoose = require("mongoose");
const IndividualSoftwareLicenseModel = require("../models/IndividualSoftwareLicenseModel");
const SoftwareModel = require("../models/SoftwareModel");

/**
 * IndividualSoftwareLicenseService
 * Exclusively handles adding specific "Seats" or "License Keys".
 */

// 1. ADD a new Tracked License Seat
const addSoftwareLicenseSeat = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // A. Verify Parent Catalog Entry exists
    const parentSoftware = await SoftwareModel.findById(data.softwareModelId).session(session);
    if (!parentCatalogVerified(parentSoftware)) {
      throw new Error("Parent Software Model not found.");
    }

    // B. Security Check: Only allow adding individual seats if the type demands it
    const trackedTypes = ["Subscription", "Licensed", "Per Seat"];
    if (!trackedTypes.includes(parentSoftware.licenseType)) {
      throw new Error(`You cannot add individual tracked seats to an ${parentSoftware.licenseType} software format.`);
    }

    // C. Check for Duplicate License Keys
    const existingKey = await IndividualSoftwareLicenseModel.findOne({ licenseKeyOrSeatName: data.licenseKeyOrSeatName }).session(session);
    if (existingKey) {
      throw new Error(`The license key or seat name '${data.licenseKeyOrSeatName}' is already registered.`);
    }

    // D. Create the actual individual seat/key
    const newLicenseSeat = new IndividualSoftwareLicenseModel({
      softwareModelId: parentSoftware._id,
      softwareName: parentSoftware.name,
      licenseKeyOrSeatName: data.licenseKeyOrSeatName,
      status: "Available",
      activationDate: data.activationDate,
      expiryDate: data.expiryDate
    });
    
    await newLicenseSeat.save({ session });

    // E. Keep Parent Total Licenses accurate dynamically!
    // If they initially typed "10" total licenses into the frontend form, but they upload an 11th key,
    // we should forcefully update the parent catalog to reflect that they actually own 11 now.
    parentSoftware.totalLicenses += 1;
    await parentSoftware.save({ session });

    await session.commitTransaction();
    return newLicenseSeat;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Quick Helper Function
const parentCatalogVerified = (parent) => {
  return parent !== null;
}

// 2. READ All Individual Seats with Pagination and Aggregation Stats
const getAllSoftwareLicenseSeats = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [data, totalCount, statsOutput] = await Promise.all([
    IndividualSoftwareLicenseModel.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    IndividualSoftwareLicenseModel.countDocuments(filters),
    IndividualSoftwareLicenseModel.aggregate([
      // We pass an empty match to get global stats across the ENTIRE system if we want, 
      // but usually stats match the ongoing filters. Let's return global stats overriding the current query 
      // just like the main Software Page does so the top banner stays consistent.
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0] } },
          expiredCount: { $sum: { $cond: [{ $eq: ["$status", "Expired"] }, 1, 0] } },
          revokedCount: { $sum: { $cond: [{ $eq: ["$status", "Revoked"] }, 1, 0] } },
        }
      }
    ])
  ]);

  const rawStats = statsOutput[0] || {
    total: 0,
    available: 0,
    assigned: 0,
    expiredCount: 0,
    revokedCount: 0,
  };

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats: {
      total: rawStats.total,
      available: rawStats.available,
      assigned: rawStats.assigned,
      expired: rawStats.expiredCount + rawStats.revokedCount,
    }
  };
};

// 3. READ Single Seat by ID
const getSoftwareLicenseSeatById = async (id) => {
  const seat = await IndividualSoftwareLicenseModel.findById(id);
  if (!seat) throw new Error("Seat/License not found.");
  return seat;
};

// 4. UPDATE a Seat (e.g., mark as Expired)
const updateSoftwareLicenseSeat = async (id, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seat = await IndividualSoftwareLicenseModel.findById(id).session(session);
    if (!seat) throw new Error("Seat/License not found.");

    // Handle generic status modifications
    Object.assign(seat, updateData);
    await seat.save({ session });

    await session.commitTransaction();
    return seat;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 5. DELETE a Seat (e.g., subscription cancelled)
const removeSoftwareLicenseSeat = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seat = await IndividualSoftwareLicenseModel.findById(id).session(session);
    if (!seat) throw new Error("Seat/License not found.");

    if (seat.status === "Assigned") {
       throw new Error("Cannot delete a license that is currently assigned to an employee! Revoke it first.");
    }

    // Deduct from Parent Catalog total
    const parent = await SoftwareModel.findById(seat.softwareModelId).session(session);
    if (parent) {
      // Don't let totalLicenses drop below 1 due to strict Model rules, unless we change the schema.
      parent.totalLicenses = Math.max(1, parent.totalLicenses - 1);
      await parent.save({ session });
    }

    await IndividualSoftwareLicenseModel.findByIdAndDelete(id).session(session);

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
  addSoftwareLicenseSeat,
  getAllSoftwareLicenseSeats,
  getSoftwareLicenseSeatById,
  updateSoftwareLicenseSeat,
  removeSoftwareLicenseSeat
};
