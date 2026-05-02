const mongoose = require("mongoose");

const repairHistorySchema = new mongoose.Schema(
  {
    laptopAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndividualLaptop",
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
      trim: true,
    },
    repairCost: {
      type: Number,
      required: true,
      min: 0,
    },
    repairDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Completed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RepairHistory", repairHistorySchema);
