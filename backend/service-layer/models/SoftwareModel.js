const mongoose = require("mongoose");

/**
 * SoftwareModel Schema
 * Represents a software license entry in our database.
 * The schema matches the exact fields needed by the React `Software.jsx` frontend.
 */
const SoftwareModelSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    category: { 
      type: String, 
      required: true 
      // Example: 'Productivity', 'Design', 'Communication', 'Development', etc.
    },
    licenseType: { 
      type: String, 
      required: true 
      // Example: 'Subscription', 'Per Seat', 'Perpetual', 'Open Source'
    },
    vendor: { 
      type: String, 
      required: true 
    },
    totalLicenses: { 
      type: Number, 
      required: true,
      min: [1, "Total licenses must be at least 1"]
    },
    usedLicenses: { 
      type: Number, 
      default: 0,
      min: [0, "Used licenses cannot be negative"]
    },
    expiryDate: { 
      // We can store it as a basic String (YYYY-MM-DD) or Mongoose Date.
      // String is okay if that's what the frontend form sends directly.
      type: String, 
      required: true 
    },
    renewalStatus: { 
      type: String,
      enum: ["Active", "Upcoming", "Critical", "Expired"],
      default: "Active"
    },
    cost: { 
      // Monthly/Annual cost for calculating totals
      type: Number, 
      required: true 
    },
    assignedTo: { 
      // Array of strings representing Departments like ['Engineering', 'HR']
      type: [String],
      default: []
    },
    version: { 
      type: String 
    },
    notes: { 
      type: String 
    }
  },
  { 
    // Adds createdAt and updatedAt automatic fields
    timestamps: true 
  }
);

module.exports = mongoose.model("SoftwareModel", SoftwareModelSchema);
