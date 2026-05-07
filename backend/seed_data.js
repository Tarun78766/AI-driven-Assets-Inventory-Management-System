const mongoose = require("mongoose");
const dotenv = require("dotenv");
const EmployeeModel = require("./service-layer/models/EmployeeModel");
const LaptopModel = require("./service-layer/models/LaptopModel");
const IndividualLaptop = require("./service-layer/models/IndividualLaptopModel");
const RepairHistory = require("./service-layer/models/RepairHistory");
const User = require("./service-layer/models/User");
const SoftwareModel = require("./service-layer/models/SoftwareModel");
const IndividualSoftwareLicense = require("./service-layer/models/IndividualSoftwareLicenseModel");
const Assignment = require("./service-layer/models/AssignmentModel");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Clear existing data
    console.log("Cleaning old data...");
    await Promise.all([
      EmployeeModel.deleteMany({}),
      LaptopModel.deleteMany({}),
      IndividualLaptop.deleteMany({}),
      RepairHistory.deleteMany({}),
      User.deleteMany({ role: "admin" }),
      SoftwareModel.deleteMany({}),
      IndividualSoftwareLicense.deleteMany({}),
      Assignment.deleteMany({}),
    ]);

    // 2. Insert Admin User
    console.log("Creating Admin...");
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@assetto.co.in",
      password: "password123",
      role: "admin",
      department: "IT",
      location: "Bangalore"
    });

    // 3. Insert Laptop Models
    console.log("Creating Laptop Models...");
    const laptopModels = await LaptopModel.insertMany([
      { modelName: "ThinkPad X1 Carbon", brand: "Lenovo", processor: "i7-1335U", ram: "16GB", storage: "512GB", price: 160000, totalAssets: 10 },
      { modelName: "MacBook Pro 14", brand: "Apple", processor: "M3 Pro", ram: "16GB", storage: "512GB", price: 199900, totalAssets: 5 },
      { modelName: "Dell XPS 15", brand: "Dell", processor: "i7-13700H", ram: "32GB", storage: "1TB", price: 245000, totalAssets: 3 },
    ]);

    // 4. Insert Employees
    console.log("Creating Employees...");
    const employees = await EmployeeModel.insertMany([
      { name: "Rahul Sharma", email: "rahul.s@assetto.co.in", department: "Engineering", role: "Manager", location: "Bangalore", joinDate: new Date("2022-01-01") },
      { name: "Sneha Reddy", email: "sneha.r@assetto.co.in", department: "IT Operations", role: "Employee", location: "Hyderabad", joinDate: new Date("2021-06-15") },
      { name: "Vikram Singh", email: "vikram.s@assetto.co.in", department: "Sales", role: "Employee", location: "Delhi", joinDate: new Date("2023-03-10") },
    ]);

    // 5. Insert Software Models
    console.log("Creating Software Models...");
    const softwareModels = await SoftwareModel.insertMany([
      { name: "Adobe Creative Cloud", vendor: "Adobe", category: "Design", licenseType: "Subscription", totalLicenses: 10, cost: 45000, expiryDate: new Date("2025-12-31"), renewalStatus: "Active" },
      { name: "Visual Studio Code Pro", vendor: "Microsoft", category: "Development", licenseType: "Per Seat", totalLicenses: 50, cost: 12000, expiryDate: new Date("2026-06-30"), renewalStatus: "Active" },
    ]);

    // 6. Insert Individual Laptops (Generating counts to match parent models)
    console.log("Creating Individual Laptops...");
    const laptopData = [];
    
    // ThinkPad: Create 10 assets (1 Critical for AI Demo, 9 Available)
    for (let i = 1; i <= 10; i++) {
      laptopData.push({
        laptopModelId: laptopModels[0]._id,
        serialNumber: i === 1 ? "SN-CRITICAL-999" : `SN-THINK-${String(i).padStart(3, '0')}`,
        modelName: "ThinkPad X1 Carbon",
        status: i === 1 ? "Under Repair" : "Available",
        purchaseDate: i === 1 ? new Date("2019-01-10") : new Date("2023-01-01"),
        conditionNotes: i === 1 ? "Critical battery and fan issues." : "Good condition",
        index: i
      });
    }

    // MacBook: Create 5 assets (1 Assigned, 4 Available)
    for (let i = 1; i <= 5; i++) {
      laptopData.push({
        laptopModelId: laptopModels[1]._id,
        serialNumber: i === 1 ? "SN-HEALTHY-001" : `SN-MAC-${String(i).padStart(3, '0')}`,
        modelName: "MacBook Pro 14",
        status: i === 1 ? "Assigned" : "Available",
        assignedTo: i === 1 ? employees[0]._id : null,
        purchaseDate: new Date("2024-01-15"),
        conditionNotes: "Perfect condition",
        index: 10 + i
      });
    }

    // Dell: Create 3 assets (1 Assigned, 2 Available)
    for (let i = 1; i <= 3; i++) {
      laptopData.push({
        laptopModelId: laptopModels[2]._id,
        serialNumber: i === 1 ? "SN-HIGH-RISK-002" : `SN-DELL-${String(i).padStart(3, '0')}`,
        modelName: "Dell XPS 15",
        status: i === 1 ? "Assigned" : "Available",
        assignedTo: i === 1 ? employees[1]._id : null,
        purchaseDate: new Date("2021-06-10"),
        conditionNotes: i === 1 ? "Loose hinge." : "Standard wear",
        index: 15 + i
      });
    }
    const laptops = await IndividualLaptop.insertMany(laptopData);

    // 7. Insert Individual Software Licenses
    console.log("Creating Software Licenses...");
    const softwareData = [];
    // Adobe: 10 seats
    for (let i = 1; i <= 10; i++) {
      softwareData.push({
        softwareModelId: softwareModels[0]._id,
        licenseKeyOrSeatName: `ADOBE-KEY-${String(i).padStart(3, '0')}`,
        softwareName: "Adobe Creative Cloud",
        status: i === 1 ? "Assigned" : "Available",
        assignedTo: i === 1 ? employees[2]._id : null
      });
    }
    // VS Code: 50 seats (matching parent total)
    for (let i = 1; i <= 50; i++) {
      softwareData.push({
        softwareModelId: softwareModels[1]._id,
        licenseKeyOrSeatName: `VS-KEY-${String(i).padStart(3, '0')}`,
        softwareName: "Visual Studio Code Pro",
        status: "Available"
      });
    }
    const softwareLicenses = await IndividualSoftwareLicense.insertMany(softwareData);

    // 8. Insert Repair History (Data for AI Analysis)
    console.log("Creating Repair Histories...");
    await RepairHistory.insertMany([
      { laptopAssetId: laptops[0]._id, issueDescription: "Motherboard Short Circuit", repairCost: 45000, repairDate: new Date("2023-05-10"), status: "Completed" },
      { laptopAssetId: laptops[0]._id, issueDescription: "Battery Replacement (Swollen)", repairCost: 8000, repairDate: new Date("2022-11-15"), status: "Completed" },
      { laptopAssetId: laptops[0]._id, issueDescription: "Screen Panel Replacement", repairCost: 15000, repairDate: new Date("2021-08-20"), status: "Completed" },
      { laptopAssetId: laptops[2]._id, issueDescription: "Keyboard Replacement", repairCost: 5000, repairDate: new Date("2023-01-10"), status: "Completed" },
    ]);

    // 9. Insert Assignments (Linking everything)
    console.log("Creating Assignments...");
    await Assignment.insertMany([
      {
        employeeId: employees[0]._id,
        employeeName: employees[0].name,
        assetType: "Laptop",
        laptopModelId: laptopModels[1]._id,
        laptopAssetId: laptops[1]._id,
        assetName: "MacBook Pro 14",
        assignDate: new Date("2024-01-15"),
        status: "Assigned",
        assignedBy: "System Admin"
      },
      {
        employeeId: employees[1]._id,
        employeeName: employees[1].name,
        assetType: "Laptop",
        laptopModelId: laptopModels[2]._id,
        laptopAssetId: laptops[2]._id,
        assetName: "Dell XPS 15",
        assignDate: new Date("2023-01-10"),
        status: "Assigned",
        assignedBy: "System Admin"
      },
      {
        employeeId: employees[2]._id,
        employeeName: employees[2].name,
        assetType: "Software",
        softwareId: softwareModels[0]._id,
        assetName: "Adobe Creative Cloud",
        assignDate: new Date("2023-06-01"),
        status: "Assigned",
        assignedBy: "System Admin"
      }
    ]);

    console.log("\n✅ SUCCESS: Database seeded for Demo!");
    console.log("---------------------------------------");
    console.log("1. Admin: admin@assetto.co.in / password123");
    console.log("2. AI Demo Asset: ThinkPad X1 (SN-CRITICAL-999)");
    console.log("3. Normal Asset: MacBook Pro (SN-HEALTHY-001)");
    console.log("4. 3 Employees, 3 Laptops, 2 Software items added.");
    
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();
