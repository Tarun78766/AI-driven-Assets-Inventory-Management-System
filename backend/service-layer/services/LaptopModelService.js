const LaptopModel = require("../models/LaptopModel");
const IndividualLaptopModel = require("../models/IndividualLaptopModel");

const mongoose = require("mongoose");

// 1. GET ALL with pagination + stats
const getAllLaptopModels = async (page, limit,filter) => {
  const skip = (page - 1) * limit;

  const totalModels = await LaptopModel.countDocuments();

  const [models, assetStats] = await Promise.all([
    LaptopModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    LaptopModel.aggregate([{
      $group: {
        _id: null,
        totalAssets: { $sum: "$totalAssets" },
        totalAvailable: { $sum: { $subtract: [ "$totalAssets", { $add: [{ $ifNull: ["$inUse", 0] }, { $ifNull: ["$underRepair", 0] }] } ] } },
        totalInUse: { $sum: "$inUse" },
      }
    }])
  ]);

  return {
    stats: {
      totalAssets: assetStats[0]?.totalAssets || 0,
      totalAvailable: assetStats[0]?.totalAvailable || 0,
      totalInUse: assetStats[0]?.totalInUse || 0,
    },
    totalModels,
    totalPages: Math.ceil(totalModels / limit),
    page: Number(page),
    limit: Number(limit),
    data: models,
  };
};

// 2. GET SINGLE
const getLaptopModelById = async (id) => {
  const model = await LaptopModel.findById(id);
  if (!model) throw new Error("Laptop model not found.");
  return model;
};


// 🔥 HELPER: generate serial
const generateSerial = (modelName, index) => {
  const prefix = modelName.slice(0, 3).toUpperCase();
  return `${prefix}-${Date.now()}-${index}`;
};

// 3. CREATE (UPDATED 🚀)
const createLaptopModel = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check duplicate
    const existing = await LaptopModel.findOne({ modelName: data.modelName }).session(session);
    if (existing) throw new Error(`Model "${data.modelName}" already exists.`);

    // 2. Create LaptopModel
    const newModel = new LaptopModel({
      ...data,
      inUse: 0,
      underRepair: 0,
    });

    await newModel.save({ session });

    // 🔥 3. AUTO CREATE INDIVIDUAL LAPTOPS
    const laptops = [];

    for (let i = 1; i <= data.totalAssets; i++) {
      laptops.push({
        laptopModelId: newModel._id,
        modelName: newModel.modelName,
        purchaseDate: data.purchaseDate,
        serialNumber: generateSerial(newModel.modelName, i),
        index:i,
        status: "Available",
      });
    }

    // 🔥 4. BULK INSERT (VERY IMPORTANT)
    if (laptops.length > 0) {
      await IndividualLaptopModel.insertMany(laptops, { session });
    }

    // 5. Commit
    await session.commitTransaction();

    return newModel;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
// 4. UPDATE
const updateLaptopModel = async (id, data) => {
  const model = await LaptopModel.findByIdAndUpdate(
    id,
    data,
    { returnDocument: "after"}       // returns updated doc
  );
  if (!model) throw new Error("Laptop model not found.");
  return model;
};

// 5. DELETE
const deleteLaptopModel = async (id) => {
  const model = await LaptopModel.findById(id);
  if (!model) throw new Error("Laptop model not found.");
  await LaptopModel.findByIdAndDelete(id);
  return true;
};

module.exports = {
  getAllLaptopModels,
  getLaptopModelById,
  createLaptopModel,
  updateLaptopModel,
  deleteLaptopModel,
};