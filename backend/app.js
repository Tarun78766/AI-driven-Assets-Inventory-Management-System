const express = require("express");
const cors = require("cors");
require("dotenv").config();

// DB
const connectDB = require("./db/connect");

// Routes
const authRoutes = require("./web-layer/routes/AuthRoutes");
const adminRoutes = require("./web-layer/routes/AdminRoutes");
const laptopModelRoutes = require("./web-layer/routes/LaptopModelRoutes");
const individualLaptopRoutes = require("./web-layer/routes/IndividualLaptopRoutes");
const softwareRoutes = require("./web-layer/routes/SoftwareRoutes");
const individualSoftwareRoutes = require("./web-layer/routes/IndividualSoftwareLicenseRoutes");
const employeeRoutes = require("./web-layer/routes/EmployeeRoutes");
const assignmentRoutes = require("./web-layer/routes/AssignmentRoutes");
const dashboardRoutes = require("./web-layer/routes/DashboardRoutes");
const userRoutes = require("./web-layer/routes/UserRoutes");
const reportRoutes = require("./web-layer/routes/ReportRoutes");
const queryRoutes = require("./web-layer/routes/QueryRoutes");
const employeeAssetRoutes = require("./web-layer/routes/EmployeeAssetRoutes");
const aiRoutes = require("./web-layer/routes/AiRoutes");
const notificationRoutes = require("./web-layer/routes/NotificationRoutes");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Config
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Asset Management API",
      version: "1.0.0",
      description: "API documentation for Asset Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
  },
  apis: ["./web-layer/routes/*.js"], // IMPORTANT FIX ✅
};

const swaggerSpec = swaggerJsDoc(options);

// Swagger Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/employee-assets", employeeAssetRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    
    // Initialize scheduled cron jobs
    const initPredictiveMaintenanceCron = require("./cron/predictiveMaintenanceCron");
    initPredictiveMaintenanceCron();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📄 Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
