const employeeAssetService = require("../../service-layer/services/EmployeeAssetService");

const getMyAssets = async (req, res) => {
  try {
    const result = await employeeAssetService.getMyAssets(req.user.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch assigned assets.",
    });
  }
};

module.exports = {
  getMyAssets,
};
