const User = require("../models/User");

const getAllUsers = async () => {
  // We use .select("-password") to ensure we NEVER send passwords over the wire
  return await User.find({}).select("-password").sort({ createdAt: -1 });
};

const updateUserRole = async (targetUserId, newRole, requestingAdminId) => {
  // Validate role strings securely against Schema Enums to prevent DB corruption
  const allowedRoles = ["employee", "manager", "admin"];

  if (!allowedRoles.includes(newRole)) {
    throw new Error("Invalid role specified.");
  }

  // Prevent admin from demoting themselves!
  if (targetUserId === requestingAdminId.toString() && newRole !== "admin") {
    throw new Error("You cannot demote yourself. Another admin must perform this action.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    targetUserId,
    { role: newRole },
    { returnDocument: "after", runValidators: true } // Return updated doc, run schema enum validators
  ).select("-password");

  if (!updatedUser) {
    throw new Error("User not found.");
  }

  return updatedUser;
};

module.exports = {
  getAllUsers,
  updateUserRole,
};
