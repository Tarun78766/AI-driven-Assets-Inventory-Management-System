const SoftwareModel = require("../models/SoftwareModel");
const mongoose = require("mongoose");
const IndividualSoftwareLicenseModel = require("../models/IndividualSoftwareLicenseModel");


// 🔥 helper
const generateSeatName = (softwareName, index) => {
  const prefix = softwareName.slice(0, 3).toUpperCase();
  return `${prefix}-SEAT-${Date.now()}-${index}`;
};

const createSoftware = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("inside create software");

    // 🔥 1. CHECK TRACKED TYPE
    const trackableTypes = ["Subscription", "Per Seat", "Perpetual"];
    const isTracked = trackableTypes.includes(data.licenseType);

    // 🔥 2. SET DEFAULT VALUES (IMPORTANT)
    const software = new SoftwareModel({
      ...data,
      usedLicenses: 0,
      cost: isTracked ? data.cost : 0,
      expiryDate: isTracked
        ? data.expiryDate
        : new Date("2099-12-31"), // dummy future date,
      totalLicenses: isTracked ? data.totalLicenses : 0,  
    });

    await software.save({ session });

    // 🔥 3. CREATE SEATS ONLY IF TRACKED
    if (isTracked) {
      const seats = [];

      for (let i = 1; i <= data.totalLicenses; i++) {
        seats.push({
          softwareModelId: software._id,
          softwareName: software.name,
          licenseKeyOrSeatName: generateSeatName(software.name, i),
          status: "Available",
        });
      }

      if (seats.length > 0) {
        await IndividualSoftwareLicenseModel.insertMany(seats, { session });
      }
    }

    await session.commitTransaction();

    return software;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllSoftwares = async (page = 1, limit = 10, search, category, status) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { vendor: { $regex: search, $options: "i" } }
    ];
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (status && status !== "All") {
    query.renewalStatus = status;
  }

  const skip = (page - 1) * limit;

  const data = await SoftwareModel.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const totalCount = await SoftwareModel.countDocuments(query);

  const statsArray = await SoftwareModel.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ["$renewalStatus", "Active"] }, 1, 0] },
        },
        critical: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$renewalStatus", "Critical"] },
                  { $eq: ["$renewalStatus", "Expired"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        upcoming: {
          $sum: { $cond: [{ $eq: ["$renewalStatus", "Upcoming"] }, 1, 0] },
        },
        totalLic: { $sum: "$totalLicenses" },
        usedLic: { $sum: "$usedLicenses" },
      },
    },
  ]);

  const globalTotalCount = await SoftwareModel.countDocuments();

  let stats = {
    total: globalTotalCount,
    active: 0,
    critical: 0,
    upcoming: 0,
    totalLic: 0,
    usedLic: 0,
  };

  if (statsArray.length > 0) {
    stats = {
      total: globalTotalCount,
      active: statsArray[0].active,
      critical: statsArray[0].critical,
      upcoming: statsArray[0].upcoming,
      totalLic: statsArray[0].totalLic || 0,
      usedLic: statsArray[0].usedLic || 0,
    };
  }

  return { data, totalCount, stats };
};

const getTrackedSoftware = async () => {
  return await SoftwareModel.find({
    licenseType: { $in: ["Subscription", "Per Seat", "Licensed"] },
  });
};

const updateSoftware = async (id, data) => {
  const software = await SoftwareModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!software) throw new Error("Software not found");
  return software;
};

const deleteSoftware = async (id) => {
  const software = await SoftwareModel.findByIdAndDelete(id);
  if (!software) throw new Error("Software not found");
  return software;
};

module.exports = {
  createSoftware,
  getAllSoftwares,
  getTrackedSoftware,
  updateSoftware,
  deleteSoftware,
};
