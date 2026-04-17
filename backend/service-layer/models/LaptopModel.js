const mongoose = require("mongoose");

/**
 * LaptopModel Schema
 * This defines how a "Laptop Model" document will look like in our MongoDB database.
 * We derived these exact fields from your frontend LaptopModels.jsx file to ensure compatibility!
 */
const LaptopModelSchema = new mongoose.Schema(
  {
    modelName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    brand: { 
      type: String, 
      required: true,
      trim: true 
    },
    processor: { 
      type: String, 
      required: true 
    },
    ram: { 
      type: String, 
      required: true 
    },
    storage: { 
      type: String, 
      required: true 
    },
    screenSize: { 
      type: String 
    },
    graphicsCard: { 
      type: String 
    },
    weight: { 
      type: String 
    },
    batteryLife: { 
      type: String 
    },
    ports: { 
      type: String 
    },
    operatingSystem: { 
      type: String 
    },
    warranty: { 
      type: String 
    },
    price: { 
      // Stored as Number so we can do math calculations (like total value) later if needed
      type: Number, 
      required: true 
    },
    
    // Inventory Tracking Numbers
    totalAssets: { 
      type: Number, 
      default: 0 
    },
    
    
    inUse: { 
      type: Number, 
      default: 0 
    },
    underRepair: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    // Automatically adds `createdAt` and `updatedAt` timestamps
    timestamps: true 
  }
);

// We export the model so we can use `LaptopModel.find()` or `LaptopModel.create()` in the Service layer
module.exports = mongoose.model("LaptopModel", LaptopModelSchema);
