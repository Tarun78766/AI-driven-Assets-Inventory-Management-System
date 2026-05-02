const userService = require("../../service-layer/services/UserService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
  }
};

const getManagers = async (req, res) => {
  try {
    const managers = await userService.getManagers();
    res.status(200).json({ success: true, count: managers.length, data: managers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching managers", error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body; // Expected payload: { "role": "manager" }
    const requestingAdminId = req.user.id; // Coming from authMiddleware

    const updatedUser = await userService.updateUserRole(
      targetUserId,
      role.toLowerCase(),
      requestingAdminId
    );

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    // 403 Forbidden is a bit more semantically correct for the demotion blocker, but 400 catches general logic failures securely
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await userService.getProfile(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    const updatedProfile = await userService.updateProfile(userId, profileData);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new passwords are required" });
    }

    const result = await userService.updatePassword(userId, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getManagers,
  updateUserRole,
  getProfile,
  updateProfile,
  updatePassword,
};
