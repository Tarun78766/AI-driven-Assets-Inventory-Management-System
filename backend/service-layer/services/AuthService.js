// ═══════════════════════════════════════════
// BACKEND - AuthService.js
// File: backend/service-layer/services/AuthService.js
// Add these functions to your existing AuthService
// ═══════════════════════════════════════════

// Import the User model to interact with the database
// Import the User model to interact with the database
const User = require("../models/User");
// Import jsonwebtoken to create signed authentication tokens
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AuthEmailService = require("../notifications/AuthEmailService");

/**
 * Register a new user in the database
 * @param {Object} userData - Contains firstName, lastName, email, password, etc.
 * @returns {Object} - The saved user document
 */
const registerUser = async (userData) => {
  // Check if a user with the given email already exists in the database
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) {
    // If user exists, throw an error to be handled by the controller
    throw new Error("User with this email already exists");
  }

  // Create a new User instance with the provided data
  // Note: userData includes fields from our React signup form (firstName, lastName, etc)
 const user = new User({
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  phone: userData.phone,
  department: userData.department,
  password: userData.password,

  // 🔥 FORCE ROLE (VERY IMPORTANT)
  role: "employee",
});
  
  // Save the user to the database 
  // This triggers the pre-save hook in User.js which hashes the password securely using bcrypt
  await user.save();

  // Auto-create corresponding EmployeeModel so they appear in the Employee List
  try {
    const EmployeeModel = require("../models/EmployeeModel");
    const newEmployee = new EmployeeModel({
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phone: userData.phone || "",
      department: userData.department || "Not Specified",
      role: "Employee",
      joinDate: new Date(),
      location: "Not Specified", // Default since it's not collected during signup
      status: "Active"
    });
    await newEmployee.save();
  } catch (employeeError) {
    console.error("Failed to auto-create EmployeeModel during user registration:", employeeError);
  }

  // Return the saved user (excluding the password for safety in later steps)
  // We remove the password from the returned object by converting to a plain object
  const userObj = user.toObject();
  delete userObj.password;
  
  return userObj;
};

/**
 * Log a user in by verifying credentials
 * @param {Object} credentials - Contains email and password
 * @returns {Object} - Contains the user document and a JWT token
 */
const loginUser = async (credentials) => {
  // Find the user by their email address
  const user = await User.findOne({ email: credentials.email }).select("+password");
  if (!user) {
    // If no user is found, throw an error
    throw new Error("Invalid credentials");
  }

  // Use the comparePassword method we defined in User.js to check the password
  // This compares the raw text password with the hashed password in the DB
  const isMatch = await user.comparePassword(credentials.password);
  if (!isMatch) {
    // If the password doesn't match, throw an error
    throw new Error("Invalid credentials");
  }

  // Create a payload containing the user's ID and Role to be embedded in the token
  const payload = {
    id: user._id,
    role: user.role,
  };

  // Sign the JWT token using the secret from .env, making it valid for 1 day
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Remove password before sending to frontend
  const userObj = user.toObject();
  delete userObj.password;

  // Return the user and the generated token
  return { user: userObj, token };
};

/**
 * Log a user out by updating their lastLogout timestamp
 * @param {String} userId - The ID of the user logging out
 * @returns {Object} - The updated user document
 */
const logoutUser = async (userId) => {
  try {
    // Update the user's lastLogout field to current timestamp
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        lastLogout: new Date() 
      },
      { returnDocument: "after" }
    ).select('-password');

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error("Logout failed: " + error.message);
  }
};

/**
 * Get user by ID (for token verification)
 * @param {String} userId - The ID of the user
 * @returns {Object} - The user document without password
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error("Failed to fetch user: " + error.message);
  }
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // We don't want to reveal if a user exists or not, so we just return success anyway
    return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash it and set to resetPasswordToken
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire to 1 hour
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  await user.save();

  // Create reset url (Assuming frontend runs on port 5173 or we can use a relative or configured URL)
  // We'll pass the frontend URL from an env var, or default to localhost:5173
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  try {
    await AuthEmailService.sendPasswordResetEmail(user, resetUrl);
    return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new Error("Email could not be sent");
  }
};

const resetPassword = async (resetToken, newPassword) => {
  // Hash the incoming token to compare with DB
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new Error("Invalid or expired password reset token");
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save(); // pre-save hook will hash the new password

  return { success: true, message: "Password updated successfully" };
};

// Export the functions to be used in AuthController.js
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  forgotPassword,
  resetPassword,
};