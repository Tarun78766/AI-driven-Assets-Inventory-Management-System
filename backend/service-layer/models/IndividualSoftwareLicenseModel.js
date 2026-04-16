const mongoose = require("mongoose");

/**
 * IndividualSoftwareLicense Schema
 * Represents exactly ONE tracked seat or license key.
 * Only software with licenseType: "Subscription", "Licensed", or "Per Seat" 
 * will use this database collection!
 */
const IndividualSoftwareLicenseSchema = new mongoose.Schema(
  {
    // The "Parent" Catalog Model (e.g., links to "Adobe Creative Cloud")
    softwareModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SoftwareModel",
      required: true
    },
    // The actual 16-digit license key, or just an internal tracking ID like "Adobe-Seat-01"
    licenseKeyOrSeatName: {
      type: String,
      required: true,
      unique: true, 
      trim: true
    },
    // The human readable name derived from the parent for easy viewing
    softwareName: {
      type: String,
      required: true
    },
    // Where is this specific seat right now?
    status: {
      type: String,
      enum: ["Available", "Assigned", "Revoked", "Expired"],
      default: "Available"
    },
    // If "Assigned", which employee is currently logged into or using this seat?
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeModel",
      default: null
    },
    // If it's a specific activation key, when does it die?
    activationDate: {
      type: String
    },
    expiryDate: {
      type: String
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("IndividualSoftwareLicense", IndividualSoftwareLicenseSchema);
