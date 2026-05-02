const AiService = require("../../service-layer/services/AiService");

const predictFailure = async (req, res) => {
  try {
    const { assetId } = req.params;
    const result = await AiService.analyzeLaptop(assetId);

    if (result.skipped) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: { ageInMonths: result.ageInMonths, repairCount: result.repairCount }
      });
    }

    res.status(200).json({
      success: true,
      message: "AI analysis completed successfully.",
      data: result.aiMetrics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHighRiskLaptops = async (req, res) => {
  try {
    const laptops = await AiService.getHighRiskLaptops();
    res.status(200).json({
      success: true,
      count: laptops.length,
      data: laptops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandFailureAnalysis = async (req, res) => {
  try {
    const analysis = await AiService.getBrandFailureAnalysis();
    res.status(200).json({
      success: true,
      count: analysis.length,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  predictFailure,
  getHighRiskLaptops,
  getBrandFailureAnalysis
};
