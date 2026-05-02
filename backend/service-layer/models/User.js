const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String },
    department: { type: String },
    location: { type: String },
    employeeId: { type: String },
    joinDate: { type: Date, default: Date.now },

    role: {
      type: String,
      enum: ["employee", "manager", "admin"], // 🔥 lowercase for consistency
      default: "employee",
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔥 IMPORTANT (hides password in queries)
    },

    // ❌ REMOVED confirmPassword

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    lastLogout: { type: Date, default: null },
    notificationSettings: {
      email: { type: Boolean, default: true },
      inapp: { type: Boolean, default: true },
      critical: { type: Boolean, default: true },
      exp30: { type: Boolean, default: true },
      exp60: { type: Boolean, default: true },
      exp90: { type: Boolean, default: false },
      eol: { type: Boolean, default: true },
      lowinv: { type: Boolean, default: true },
      assign: { type: Boolean, default: false },
      system: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// 🔐 HASH PASSWORD
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔐 COMPARE PASSWORD
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔐 SAFE RESPONSE
UserSchema.methods.toSafeObject = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

module.exports = mongoose.model("User", UserSchema);