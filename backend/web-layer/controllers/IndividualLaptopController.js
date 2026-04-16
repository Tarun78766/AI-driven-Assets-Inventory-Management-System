
const individualLaptopService = require("../../service-layer/services/IndividualLaptopService");

/**
 * IndividualLaptopController
 * Handles HTTP requests for managing specific, physical laptops (SNs).
 */

// 1. ADD a new physical laptop
const addPhysicalLaptop = async (req, res) => {
  try {

    const newHardware = await individualLaptopService.addPhysicalLaptop(req.body);
    res.status(201).json({
      success: true,
      message: "Physical laptop asset explicitly registered in inventory.",
      data: newHardware
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. READ All physical laptops
const getAllPhysicalLaptops = async (req, res) => {
  try {
    const filter = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    if(search){
      filter.$or = [
        {name: {$regex: search, $options: "i"}},
        {serialNumber: {$regex: search, $options: "i"}},
        {modelName: {$regex: search, $options: "i"}},
      ]
    }
    
    if(status && status !== "All"){
      filter.status = status;
    }
    
    if(req.query.laptopModelId){
      filter.laptopModelId = req.query.laptopModelId;
    }
    
    const { hardwareList, totalCount } = await individualLaptopService.getAllPhysicalLaptops(page, limit, filter);
    
    res.status(200).json({
      success: true,
      data: hardwareList,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalModels: totalCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching physical laptops." });
  }
};

// 3. READ Single physical laptop by ID
const getPhysicalLaptopById = async (req, res) => {
  try {
    const laptop = await individualLaptopService.getPhysicalLaptopById(req.params.id);
    res.status(200).json({ success: true, data: laptop });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// 4. UPDATE a physical laptop (e.g. status "Under Repair" or update conditionNotes)
const updatePhysicalLaptop = async (req, res) => {
  try {
    const updatedLaptop = await individualLaptopService.updatePhysicalLaptop(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Hardware asset updated successfully.",
      data: updatedLaptop
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. DELETE a physical laptop
const removePhysicalLaptop = async (req, res) => {
  try {
    await individualLaptopService.removePhysicalLaptop(req.params.id);
    res.status(200).json({ success: true, message: "Asset successfully decommissioned and removed." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addPhysicalLaptop,
  getAllPhysicalLaptops,
  getPhysicalLaptopById,
  updatePhysicalLaptop,
  removePhysicalLaptop
};
