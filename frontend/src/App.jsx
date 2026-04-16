// ═══════════════════════════════════════════
// FRONTEND - App.js with Authentication
// File: src/App.js
// Updated to include AuthProvider and ProtectedRoute
// ═══════════════════════════════════════════

import "./App.css";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import axios config (sets up interceptors)
import "./config/Axiosconfig";

// Auth Context
import { AuthProvider } from "./context/AuthContext";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Components
import Login from "./components/Login/Login";
import SignUp from "./components/signUp/SignUp";

// Page Components
import Dashboard from "./pages/DashboardPage/DashBoard";
import LaptopModels from "./pages/LaptopModelsPage/Laptopmodels";
import Software from "./pages/SoftwarePage/Software";
import Notification from "./pages/NotificationPage/Notification";
import Employees from "./pages/EmployeesPage/Employees";
import Assignments from "./pages/AssignmentsPage/Assignments";
import Reports from "./pages/ReportsPage/Report";
import Settings from "./pages/SettingsPage/Settings";
import AddManager from "./pages/AdminAddManager/AddManager";

// Navbar and Sidebar
import Navbar from "./components/navBar/NavBar";
import SideBar from "./components/sideBar/SideBar";
import IndividualLaptops from "./pages/LaptopModelsPage/IndividualLaptopPage/IndividualLaptops";
import IndividualSoftware from "./pages/SoftwarePage/IndividualSoftwarePage/IndividualSoftware";

function App() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes - All users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin & Manager only */}
        <Route
          path="/laptops"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <LaptopModels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laptops/individual"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <IndividualLaptops />
            </ProtectedRoute>
          }
        />

        <Route
          path="/software"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Software />
            </ProtectedRoute>
          }
        />
        <Route
          path="/software/individual"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <IndividualSoftware />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Assignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin only */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Employees />
            </ProtectedRoute>
          }
      />
      <Route
          path="/add-manager"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddManager />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes (if needed) */}
        <Route
          path="/navbar"
          element={
            <ProtectedRoute>
              <Navbar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sidebar"
          element={
            <ProtectedRoute>
              <SideBar />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;
