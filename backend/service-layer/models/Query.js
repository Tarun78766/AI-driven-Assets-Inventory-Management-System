const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    queryType: {
      type: String,
      enum: [
        "New Laptop Request",
        "Laptop Replacement",
        "Laptop Issue / Repair",
        "Software Installation Request",
        "Software Access Request",
        "General IT Query",
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        senderName: {
          type: String,
          required: true,
        },
        senderRole: {
          type: String,
        },
        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: 2000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

querySchema.index({ employeeId: 1, createdAt: -1 });
querySchema.index({ status: 1 });
querySchema.index({ priority: 1 });

module.exports = mongoose.model("Query", querySchema);
