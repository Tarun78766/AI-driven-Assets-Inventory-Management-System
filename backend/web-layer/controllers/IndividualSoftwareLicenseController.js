const individualSoftwareService = require("../../service-layer/services/IndividualSoftwareLicenseService");

/**
 * IndividualSoftwareLicenseController
 * Handles requests for specific tracked software seats/keys.
 */

const addSoftwareLicenseSeat = async (req, res) => {
  try {
    const newSeat = await individualSoftwareService.addSoftwareLicenseSeat(req.body);
    res.status(201).json({
      success: true,
      message: "License seat explicitly registered.",
      data: newSeat
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllSoftwareLicenseSeats = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, softwareModelId } = req.query;
    
    const filters = {};
    
    if (search) {
      filters.$or = [
        { licenseKeyOrSeatName: { $regex: search, $options: "i" } },
        { softwareName: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status && status !== "All") {
      filters.status = status;
    }

    if (softwareModelId) {
      filters.softwareModelId = softwareModelId;
    }

    const result = await individualSoftwareService.getAllSoftwareLicenseSeats(
      filters,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: result.data,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      stats: result.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching license seats." });
  }
};

const getSoftwareLicenseSeatById = async (req, res) => {
  try {
    const seat = await individualSoftwareService.getSoftwareLicenseSeatById(req.params.id);
    res.status(200).json({ success: true, data: seat });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateSoftwareLicenseSeat = async (req, res) => {
  try {
    const updatedSeat = await individualSoftwareService.updateSoftwareLicenseSeat(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "License seat updated successfully.",
      data: updatedSeat
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeSoftwareLicenseSeat = async (req, res) => {
  try {
    await individualSoftwareService.removeSoftwareLicenseSeat(req.params.id);
    res.status(200).json({ success: true, message: "License seat revoked and removed." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addSoftwareLicenseSeat,
  getAllSoftwareLicenseSeats,
  getSoftwareLicenseSeatById,
  updateSoftwareLicenseSeat,
  removeSoftwareLicenseSeat
};
