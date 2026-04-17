const mongoose = require("mongoose");

/**
 * IndividualLaptopModel Schema
 * Represents exactly ONE physical laptop possessing a unique Serial Number.
 * Instead of duplicating RAM, Processor, and Storage on every single physical machine,
 * it points back to a "Parent" LaptopModel which holds all the heavy specs.
 */
const IndividualLaptopSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
    },
    // The "Parent" Catalog Model (e.g., links to "Dell XPS 15")
    laptopModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaptopModel",
      required: true,
    },
    // The unique identifier physically stamped on the laptop chassis
    serialNumber: {
      type: String,
      required: true,
      unique: true, // Prevents accidentally adding the same physical laptop twice
      trim: true,
    },
    // Useful for grouping in UI without a huge JOIN
    modelName: {
      type: String,
      required: true,
    },
    // Where is the physical laptop right now?
    status: {
      type: String,
      enum: ["Available", "Assigned", "Under Repair", "Retired"],
      default: "Available",
    },
    // If "Assigned", who currently holds it?
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeModel",
      default: null,
    },
    // Details on when the company acquired this specific slice of hardware
    purchaseDate: {
      type: Date,
      required: true
    },
    // Extra notes if a screen is scratched or a key is broken
    conditionNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("IndividualLaptop", IndividualLaptopSchema);
