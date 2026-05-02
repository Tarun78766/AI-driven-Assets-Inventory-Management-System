const AssignmentModel = require("../models/AssignmentModel");
const EmployeeModel = require("../models/EmployeeModel");
const IndividualLaptopModel = require("../models/IndividualLaptopModel");
const IndividualSoftwareLicenseModel = require("../models/IndividualSoftwareLicenseModel");
const LaptopModel = require("../models/LaptopModel");
const User = require("../models/User");

const getMyAssets = async (userId) => {
  const user = await User.findById(userId).select("email firstName lastName").lean();

  if (!user) {
    const error = new Error("Authenticated user not found.");
    error.statusCode = 401;
    throw error;
  }

  const employee = await EmployeeModel.findOne({
    email: user.email,
  }).lean();

  if (!employee) {
    return {
      employee: {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email,
      },
      assets: [],
      totalCount: 0,
      stats: {
        assigned: 0,
        laptops: 0,
        software: 0,
      },
    };
  }

  const assignments = await AssignmentModel.find({
    employeeId: employee._id,
    status: { $in: ["Assigned", "Return Requested"] },
  })
    .sort({ assignDate: -1, createdAt: -1 })
    .lean();

  const laptopAssetIds = assignments
    .filter((assignment) => assignment.laptopAssetId)
    .map((assignment) => assignment.laptopAssetId);
  const softwareSeatIds = assignments
    .filter((assignment) => assignment.softwareId)
    .map((assignment) => assignment.softwareId);
  const laptopModelIds = assignments
    .filter((assignment) => assignment.laptopModelId)
    .map((assignment) => assignment.laptopModelId);

  const [laptops, softwareSeats, laptopModels] = await Promise.all([
    IndividualLaptopModel.find({ _id: { $in: laptopAssetIds } })
      .select("modelName serialNumber status purchaseDate conditionNotes")
      .lean(),
    IndividualSoftwareLicenseModel.find({ _id: { $in: softwareSeatIds } })
      .select("softwareName licenseKeyOrSeatName status activationDate expiryDate")
      .lean(),
    LaptopModel.find({ _id: { $in: laptopModelIds } })
      .select("brand processor ram storage operatingSystem warranty")
      .lean(),
  ]);

  const laptopsById = new Map(laptops.map((laptop) => [laptop._id.toString(), laptop]));
  const softwareById = new Map(
    softwareSeats.map((software) => [software._id.toString(), software]),
  );
  const laptopModelsById = new Map(
    laptopModels.map((model) => [model._id.toString(), model]),
  );

  const assets = assignments.map((assignment) => {
    const isLaptop = assignment.assetType === "Laptop";
    const laptop = assignment.laptopAssetId
      ? laptopsById.get(assignment.laptopAssetId.toString())
      : null;
    const laptopModel = assignment.laptopModelId
      ? laptopModelsById.get(assignment.laptopModelId.toString())
      : null;
    const software = assignment.softwareId
      ? softwareById.get(assignment.softwareId.toString())
      : null;

    return {
      id: assignment._id,
      assetType: assignment.assetType,
      assetName:
        assignment.assetName ||
        laptop?.modelName ||
        software?.softwareName ||
        "Assigned Asset",
      status: assignment.status,
      assignDate: assignment.assignDate,
      returnDate: assignment.returnDate,
      assignedBy: assignment.assignedBy,
      purchaseDate: assignment.purchaseDate || laptop?.purchaseDate || null,
      details: isLaptop
        ? {
            serialNumber: laptop?.serialNumber || "N/A",
            brand: laptopModel?.brand || "N/A",
            processor: laptopModel?.processor || "N/A",
            ram: laptopModel?.ram || "N/A",
            storage: laptopModel?.storage || "N/A",
            operatingSystem: laptopModel?.operatingSystem || "N/A",
            warranty: laptopModel?.warranty || "N/A",
            conditionNotes: laptop?.conditionNotes || "No notes",
          }
        : {
            licenseKeyOrSeatName: software?.licenseKeyOrSeatName || "N/A",
            activationDate: software?.activationDate || "N/A",
            expiryDate: software?.expiryDate || "N/A",
          },
    };
  });

  return {
    employee,
    assets,
    totalCount: assets.length,
    stats: {
      assigned: assets.length,
      laptops: assets.filter((asset) => asset.assetType === "Laptop").length,
      software: assets.filter((asset) => asset.assetType === "Software").length,
    },
  };
};

module.exports = {
  getMyAssets,
};
