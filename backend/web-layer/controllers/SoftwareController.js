const SoftwareService = require("../../service-layer/services/SoftwareService");

const getAllSoftwares = async (req, res) => {
  try {
    const { page, limit, search, category, status } = req.query;
    
    // Pass raw queries to the service
    const result = await SoftwareService.getAllSoftwares(
      Number(page) || 1, 
      Number(limit) || 10, 
      search, 
      category, 
      status
    );

    // Return exact signature expected by the frontend
    res.status(200).json({
      success: true,
      data: result.data,
      totalCount: result.totalCount,
      stats: result.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSoftware = async (req, res) => {
  try {
    const data = await SoftwareService.createSoftware(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSoftware = async (req, res) => {
  try {
    const data = await SoftwareService.updateSoftware(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSoftware = async (req, res) => {
  try {
    await SoftwareService.deleteSoftware(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTrackedSoftware = async (req, res) => {
  try {
    const data = await SoftwareService.getTrackedSoftware();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllSoftwares,
  createSoftware,
  updateSoftware,
  deleteSoftware,
  getTrackedSoftware
};
