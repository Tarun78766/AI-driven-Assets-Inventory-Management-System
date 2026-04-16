const dashboardService = require("../../service-layer/services/DashboardService");

/**
 * DashboardController
 * Serves aggregated data to the frontend Dashboard view.
 */

const getDashboardData = async (req, res) => {
  try {
    const dashboardStats = await dashboardService.getDashboardStats();
    
    res.status(200).json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred while aggregating dashboard stats." 
    });
  }
};

module.exports = {
  getDashboardData
};
