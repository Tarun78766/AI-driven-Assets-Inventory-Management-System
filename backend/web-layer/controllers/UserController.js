const userService = require("../../service-layer/services/UserService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
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

module.exports = {
  getAllUsers,
  updateUserRole,
};
