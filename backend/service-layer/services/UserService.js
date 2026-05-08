const User = require("../models/User");

const getAllUsers = async () => {
  // We use .select("-password") to ensure we NEVER send passwords over the wire
  return await User.find({}).select("-password").sort({ createdAt: -1 });
};

const getManagers = async () => {
  const managers = await User.find({ role: { $in: ["manager", "admin"] } })
    .select("firstName lastName email role department")
    .sort({ role: 1, firstName: 1 })
    .lean();

  return managers.map((m) => ({
    ...m,
    name: `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email,
  }));
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
    { new: true, runValidators: true } // Return updated doc, run schema enum validators
  ).select("-password");

  if (!updatedUser) {
    throw new Error("User not found.");
  }

  // Sync role update to EmployeeModel if it exists
  try {
    const EmployeeModel = require("../models/EmployeeModel");
    const roleMapping = {
      "employee": "Employee",
      "manager": "Manager",
      "admin": "Admin"
    };

    const employeeRole = roleMapping[newRole];

    if (employeeRole) {
      await EmployeeModel.findOneAndUpdate(
        { email: updatedUser.email },
        { role: employeeRole }
      );
    }
  } catch (error) {
    console.error("Failed to sync role to EmployeeModel:", error);
  }

  return updatedUser;
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) throw new Error("User not found");
  
  // Format the name for the frontend
  return {
    ...user,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  };
};

const updateProfile = async (userId, profileData) => {
  const { name, email, phone, department, location } = profileData;
  
  let updateData = { email, phone, department, location };
  
  // Split name back to firstName and lastName
  if (name) {
    const nameParts = name.trim().split(" ");
    updateData.firstName = nameParts[0] || "";
    updateData.lastName = nameParts.slice(1).join(" ") || "";
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password").lean();

  if (!updatedUser) throw new Error("User not found");

  return {
    ...updatedUser,
    name: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim(),
  };
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new Error("Incorrect current password");

  user.password = newPassword;
  await user.save(); // triggers pre-save hook for hashing

  return { success: true, message: "Password updated successfully" };
};

module.exports = {
  getAllUsers,
  getManagers,
  updateUserRole,
  getProfile,
  updateProfile,
  updatePassword,
};
