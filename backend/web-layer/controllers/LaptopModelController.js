const laptopModelService = require("../../service-layer/services/LaptopModelService");

const getAllLaptopModels = async (req, res) => {
  try {
    const filter = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const statusFilter = req.query.statusFilter || "";
    if (search) {
      filter.$or = [
        { modelName: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { processor: { $regex: search, $options: "i" } },
        { ram: { $regex: search, $options: "i" } },
        { storage: { $regex: search, $options: "i" } },
        { os: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }
    if (statusFilter && statusFilter !== "All" && statusFilter !== "") {
      if (statusFilter === "inUse") {
        filter.inUse = { $gt: 0 };
      } else if (statusFilter === "underRepair") {
        filter.underRepair = { $gt: 0 };
      } else if (statusFilter === "available") {
        filter.$expr = {
          $gt: [
            { $subtract: ["$totalAssets", { $add: ["$inUse", { $ifNull: ["$underRepair", 0] }] }] },
            0
          ]
        };
      }
    }
    const data = await laptopModelService.getAllLaptopModels(
      page,
      limit,
      filter,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLaptopModelById = async (req, res) => {
  try {
    const model = await laptopModelService.getLaptopModelById(req.params.id);
    res.status(200).json({ success: true, data: model });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const createLaptopModel = async (req, res) => {
  try {
    const newModel = await laptopModelService.createLaptopModel(req.body);
    res.status(201).json({ success: true, data: newModel });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateLaptopModel = async (req, res) => {
  try {
    const updated = await laptopModelService.updateLaptopModel(
      req.params.id,
      req.body,
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteLaptopModel = async (req, res) => {
  try {
    await laptopModelService.deleteLaptopModel(req.params.id);
    res.status(200).json({ success: true, message: "Laptop model deleted." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllLaptopModels,
  getLaptopModelById,
  createLaptopModel,
  updateLaptopModel,
  deleteLaptopModel,
};
