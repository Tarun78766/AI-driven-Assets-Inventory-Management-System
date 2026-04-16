// ═══════════════════════════════════════════
// BACKEND - AuthService.js
// File: backend/service-layer/services/AuthService.js
// Add these functions to your existing AuthService
// ═══════════════════════════════════════════

// Import the User model to interact with the database
const User = require("../models/User");
// Import jsonwebtoken to create signed authentication tokens
const jwt = require("jsonwebtoken");

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

// Export the functions to be used in AuthController.js
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
};