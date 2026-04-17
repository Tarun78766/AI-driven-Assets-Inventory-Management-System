const mongoose = require("mongoose");

const SoftwareModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    vendor: {
      type: String,
      required: true,
    },
    version: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        "Productivity",
        "Design",
        "Communication",
        "Development",
        "Engineering",
        "Project Management",
        "Analytics",
        "QA",
      ],
    },
    licenseType: {
      type: String,
      enum: ["Subscription", "Per Seat", "Perpetual"],
    },
    totalLicenses: {
      type: Number,
      required: true,
      
    },
    usedLicenses: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    renewalStatus: {
      type: String,
      enum: ["Active", "Upcoming", "Critical", "Expired"],
    },
    cost: {
      type: Number,
      required: true,
    },
    assignedTo: {
      type: [String],
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SoftwareModel", SoftwareModelSchema);
