const mongoose = require("mongoose");

const assignmentSchema=new mongoose.Schema(
    {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    assetType: {
      type: String,
      enum: ["Laptop", "Software"],
      required: true
    },
    laptopModelId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaptopModel",
    },
     laptopAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaptopAsset",
      default: null
    },
     softwareId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Software",
    },
    employeeName:{
      type:String,
    },

    assetName:{
      type:String,

    },


    
    assignDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["Assigned", "Returned"],
      default: "Assigned"
    },
    returnDate:{
      type: Date,
      default: null
    },
    assignedBy:{
     type:String
    },
    purchaseDate:{
        type:Date,
        default:null
    }
    },
    {
    timestamps: true
  }
);
module.exports = mongoose.model("Assignment", assignmentSchema);