import { useState, useEffect } from "react";
import "./Settings.css";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Upload,
  Camera,
  Clock,
  Download,
  RefreshCw,
  Globe,
  Palette,
  Moon,
  Sun,
} from "lucide-react";

import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    location: "",
    employeeId: "",
    joinDate: "",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: false,
    laptopAssignments: false,
    softwareExpiry: false,
    licenseRenewal: false,
    systemUpdates: false,
    weeklyReport: false,
    pushNotifications: false,
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    theme: "light",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeZone: "Asia/Kolkata",
    itemsPerPage: "10",
    autoBackup: true,
    backupFrequency: "daily",
  });

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSystemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecurityData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(APIRoutes.USERS_API + "/profile");
        if (res.data.success) {
          const fetchedData = res.data.data;
          setProfileData((prev) => ({
            ...prev,
            ...fetchedData,
            joinDate: fetchedData.joinDate ? fetchedData.joinDate.slice(0, 10) : prev.joinDate,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put(APIRoutes.USERS_API + "/profile", profileData);
      if (res.data.success) {
        showToast("Profile updated successfully");
        const updatedData = res.data.data;
        setProfileData((prev) => ({
          ...prev,
          ...updatedData,
          joinDate: updatedData.joinDate ? updatedData.joinDate.slice(0, 10) : prev.joinDate,
        }));
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const handleSaveNotifications = () => {
    showToast("Notification preferences saved");
  };

  const handleSaveSystem = () => {
    showToast("System settings updated");
  };

  const handleSaveSecurity = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const res = await axios.put(APIRoutes.USERS_API + "/security/password", {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      });

      if (res.data.success) {
        showToast("Password updated. Please login again.");
        setTimeout(() => {
          logout(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to update security:", error);
      showToast(error.response?.data?.message || "Failed to update security", "error");
    }
  };

  const handleExportData = () => {
    showToast("Data export initiated");
  };
  return (
    <>
      <div className="settings-page">
        {toast && (
          <div className={`settings-toast settings-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        {loading ? (
          <div className="no-data" style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "calc(100vh - 120px)" 
          }}>
            <RefreshCw
              size={50}
              className="il-loading-icon"
              style={{
                animation: "spin 1s linear infinite",
                color: "#6366f1",
                marginBottom: "16px",
              }}
            />
            <p style={{ fontSize: "16px", fontWeight: "500", color: "#64748b" }}>Fetching Settings...</p>
          </div>
        ) : (
          <>
            <div className="settings-header">
          <div className="settings-header-left">
            <div className="settings-header-icon">
              <SettingsIcon size={26} />
            </div>
            <div>
              <h1 className="settings-title">Settings</h1>
              <p className="settings-subtitle">
                Manage your account and system preferences
              </p>
            </div>
          </div>
        </div>

        <div className="settings-container">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            <button
              className={`settings-nav-item ${activeTab === "profile" ? "settings-nav-item--active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={20} />
              <span>Profile</span>
            </button>

            <button
              className={`settings-nav-item ${activeTab === "security" ? "settings-nav-item--active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={20} />
              <span>Security</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <div>
                    <h2 className="settings-section-title">
                      Profile Information
                    </h2>
                    <p className="settings-section-subtitle">
                      Update your personal information and contact details
                    </p>
                  </div>
                </div>

                <div className="settings-profile-card">
                  

                  <div className="settings-form">
                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>Full Name</label>
                        <div className="settings-input-wrap">
                          <User size={16} className="settings-input-icon" />
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className="settings-input"
                          />
                        </div>
                      </div>
                      <div className="settings-form-group">
                        <div className="settings-input-wrap">
                          
                          <input
                            type="text"
                            name="employeeId"
                            value={profileData.employeeId}
                            disabled
                                  className="settings-input settings-input--disabled"
                            hidden
                          />
                        </div>
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>Email Address</label>
                        <div className="settings-input-wrap">
                          <Mail size={16} className="settings-input-icon" />
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            className="settings-input"
                          />
                        </div>
                      </div>
                      <div className="settings-form-group">
                        <label>Phone Number</label>
                        <div className="settings-input-wrap">
                          <Phone size={16} className="settings-input-icon" />
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="settings-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>Role</label>
                        <div className="settings-input-wrap">
                          <Shield size={16} className="settings-input-icon" />
                          <input
                            type="text"
                            name="role"
                            value={profileData.role}
                            disabled
                            className="settings-input settings-input--disabled"
                          />
                        </div>
                      </div>
                      <div className="settings-form-group">
                        <label>Department</label>
                        <div className="settings-input-wrap">
                          <Briefcase
                            size={16}
                            className="settings-input-icon"
                          />
                          <select
                            name="department"
                            value={profileData.department}
                            onChange={handleProfileChange}
                            className="settings-input"
                          >
                            <option>IT Operations</option>
                            <option>Engineering</option>
                            <option>HR</option>
                            <option>Finance</option>
                            <option>Marketing</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>Location</label>
                        <div className="settings-input-wrap">
                          <MapPin size={16} className="settings-input-icon" />
                          <select
                            name="location"
                            value={profileData.location}
                            onChange={handleProfileChange}
                            className="settings-input"
                          >
                            <option>Mumbai</option>
                            <option>Delhi</option>
                            <option>Bangalore</option>
                            <option>Hyderabad</option>
                            <option>Chennai</option>
                            <option>Pune</option>
                          </select>
                        </div>
                      </div>
                      <div className="settings-form-group">
                        <label>Join Date</label>
                        <div className="settings-input-wrap">
                          <Clock size={16} className="settings-input-icon" />
                          <input
                            type="date"
                            name="joinDate"
                            value={profileData.joinDate}
                            disabled
                            className="settings-input settings-input--disabled"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="settings-form-actions">
                      <button
                        className="settings-btn settings-btn--primary"
                        onClick={handleSaveProfile}
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <div>
                    <h2 className="settings-section-title">
                      Security Settings
                    </h2>
                    <p className="settings-section-subtitle">
                      Manage password and security preferences
                    </p>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-subsection-title">Change Password</h3>
                  <div className="settings-form">
                    <div className="settings-form-group settings-form-group--full">
                      <label>Current Password</label>
                      <div className="settings-input-wrap">
                        <Lock size={16} className="settings-input-icon" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={securityData.currentPassword}
                          onChange={handleSecurityChange}
                          className="settings-input"
                          placeholder="Enter current password"
                        />
                        <button
                          className="settings-input-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>New Password</label>
                        <div className="settings-input-wrap">
                          <Lock size={16} className="settings-input-icon" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={securityData.newPassword}
                            onChange={handleSecurityChange}
                            className="settings-input"
                            placeholder="Enter new password"
                          />
                          <button
                            className="settings-input-toggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="settings-form-group">
                        <label>Confirm New Password</label>
                        <div className="settings-input-wrap">
                          <Lock size={16} className="settings-input-icon" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={securityData.confirmPassword}
                            onChange={handleSecurityChange}
                            className="settings-input"
                            placeholder="Confirm new password"
                          />
                          <button
                            className="settings-input-toggle"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="settings-form-actions">
                      <button
                        className="settings-btn settings-btn--primary"
                        onClick={handleSaveSecurity}
                      >
                        <Save size={16} />
                        Update Security
                      </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )}
  </div>
</>
  );
};

export default Settings;
