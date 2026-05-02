
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

import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";

// Page Components
import Software from "./pages/SoftwarePage/Software";
import Notification from "./pages/NotificationPage/Notification";
import Employees from "./pages/EmployeesPage/Employees";
import Assignments from "./pages/AssignmentsPage/Assignments";
import Reports from "./pages/ReportsPage/Report";
import Settings from "./pages/SettingsPage/Settings";
import UserManagement from "./pages/UserManagementPage/UserManagement";
import EmployeeQueries from "./pages/EmployeeQueriesPage/EmployeeQueries";

// Navbar and Sidebar
import Navbar from "./components/navBar/NavBar";
import SideBar from "./components/sideBar/SideBar";
import IndividualLaptops from "./pages/LaptopModelsPage/IndividualLaptopPage/IndividualLaptops";
import IndividualSoftware from "./pages/SoftwarePage/IndividualSoftwarePage/IndividualSoftware";
import AIDashboard from "./pages/AIDashboard/AIDashboard";
import SignUp from "./components/signUp/Signup";
import Dashboard from "./pages/DashboardPage/MainDashboard";
import LaptopModels from "./pages/LaptopModelsPage/LaptopModel";

function App() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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

        <Route
          path="/employee/queries"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeQueries />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin & Manager only */}
        <Route
          path="/laptops"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <LaptopModels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laptops/individual"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <IndividualLaptops />
            </ProtectedRoute>
          }
        />

        <Route
          path="/software"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Software />
            </ProtectedRoute>
          }
        />
        <Route
          path="/software/individual"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <IndividualSoftware />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Assignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <AIDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin only */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Employees />
            </ProtectedRoute>
          }
      />
        
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
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
