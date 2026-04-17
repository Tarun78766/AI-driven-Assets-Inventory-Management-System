const ReportService = require("../../service-layer/services/ReportService");

const getReports = async (req, res) => {
  try {
    const data = await ReportService.getReportsData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReports,
};
