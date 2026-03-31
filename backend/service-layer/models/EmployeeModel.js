const mongoose = require("mongoose");

/**
 * EmployeeModel Schema
 * Represents the workforce in the company who will be assigned assets.
 * Note: This is separate from User.js, as Users are people who can login to the dashboard (Admins/IT Ops).
 * Employees are simply records of staff who hold company equipment.
 */
const EmployeeModelSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true,
      unique: true, // Prevents creating two employees with same email
      trim: true
    },
    phone: { 
      type: String 
    },
    role: { 
      type: String,
      enum: ["Admin", "IT Operations", "Manager", "Employee"],
      default: "Employee"
    },
    department: { 
      type: String, 
      required: true 
    },
    joinDate: { 
      type: String, 
      required: true 
    },
    location: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    // Counters to track how many assets the employee is currently holding
    assignedLaptops: {
      type: Number,
      default: 0
    },
    assignedSoftware: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("EmployeeModel", EmployeeModelSchema);
