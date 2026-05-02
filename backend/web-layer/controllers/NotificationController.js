const NotificationService = require("../../service-layer/services/NotificationService");

const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getRoleBasedNotifications({
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

module.exports = {
  getNotifications,
};
