const mongoose = require("mongoose");

/**
 * AssignmentModel Schema
 * This acts as the "Bridge" connecting an Employee to a specific Asset (Laptop or Software).
 */
const AssignmentModelSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeModel", // Tells MongoDB this ID belongs to the Employee collection
      required: true
    },
    employeeName: {
      // We store the name directly here too! 
      // This is a common NoSQL trick (called "denormalization") to avoid complex JOIN queries later
      type: String,
      required: true
    },
    assetType: {
      type: String,
      enum: ["Laptop", "Software"],
      required: true
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
      // Notice there's no "ref" here because it could be referencing EITHER LaptopModel OR SoftwareModel!
    },
    assetName: {
      // Storing the asset's name directly so the frontend can easily display it in the table
      type: String,
      required: true
    },
    assignDate: {
      type: String, // Kept as String (YYYY-MM-DD) to easily match the React date inputs
      required: true
    },
    returnDate: {
      type: String,
      default: null // Null means it's still actively assigned to the employee
    },
    status: {
      type: String,
      enum: ["Active", "Returned"],
      default: "Active"
    },
    assignedBy: {
      type: String, // Name of the Admin/IT Ops who handed over the equipment
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("AssignmentModel", AssignmentModelSchema);
