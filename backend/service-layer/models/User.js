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

    lastLogout: { type: Date, default: null },
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