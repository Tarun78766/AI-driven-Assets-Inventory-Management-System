const express = require("express");
const cors = require("cors");
require('dotenv').config();

// Connect DB
const connectDB = require("./db/connect");

const authRoutes = require("./web-layer/routes/AuthRoutes");
const adminRoutes = require("./web-layer/routes/AdminRoutes");
const laptopModelRoutes = require("./web-layer/routes/LaptopModelRoutes");
const individualLaptopRoutes = require("./web-layer/routes/IndividualLaptopRoutes");
const softwareRoutes = require("./web-layer/routes/SoftwareRoutes");
const individualSoftwareRoutes = require("./web-layer/routes/IndividualSoftwareLicenseRoutes");
const employeeRoutes = require("./web-layer/routes/EmployeeRoutes");
const assignmentRoutes = require("./web-layer/routes/AssignmentRoutes");
const dashboardRoutes = require("./web-layer/routes/DashboardRoutes");

// Future routes
// const inventoryRoutes = require("./web-layer/routes/inventory.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/laptops", laptopModelRoutes);
app.use("/api/individual-laptops", individualLaptopRoutes);
app.use("/api/software", softwareRoutes);
app.use("/api/individual-software", individualSoftwareRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/assignments", assignmentRoutes);

// app.use("/api/inventory", inventoryRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on https://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
