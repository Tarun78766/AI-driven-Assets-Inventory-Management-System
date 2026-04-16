const jwt = require("jsonwebtoken");
const User = require("../../service-layer/models/User");

const authMiddleware = async (req, res, next) => {
  const tokenHeader = req.headers.authorization;

  // 🔒 1. CHECK TOKEN FORMAT
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided or invalid format",
    });
  }

  try {
    const token = tokenHeader.split(" ")[1];

    // 🔒 2. VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 3. CHECK USER EXISTS IN DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // 🔥 4. OPTIONAL: CHECK TOKEN ISSUED BEFORE LOGOUT
    if (user.lastLogout) {
      const tokenIssuedAt = decoded.iat * 1000; // convert to ms

      if (tokenIssuedAt < user.lastLogout.getTime()) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        });
      }
    }

    // ✅ 5. ATTACH CLEAN USER OBJECT
    req.user = {
      id: user._id,
      role: user.role, // already lowercase from schema
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// 🔒 ROLE-BASED ACCESS
authMiddleware.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // 🔥 NO NEED for toLowerCase now (already normalized)
    if (!roles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = authMiddleware;