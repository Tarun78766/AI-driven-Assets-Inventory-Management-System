const express = require("express");
const cors = require("cors");
require('dotenv').config();

// Connect DB
const connectDB = require("./db/connect");

const authRoutes = require("./web-layer/routes/AuthRoutes");
const adminRoutes = require("./web-layer/routes/AdminRoutes");
const laptopRoutes = require("./web-layer/routes/LaptopRoutes");
const softwareRoutes = require("./web-layer/routes/SoftwareRoutes");
const employeeRoutes = require("./web-layer/routes/EmployeeRoutes");
const assignmentRoutes = require("./web-layer/routes/AssignmentRoutes");

// Future routes
// const inventoryRoutes = require("./web-layer/routes/inventory.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/laptops", laptopRoutes);
app.use("/api/software", softwareRoutes);
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
