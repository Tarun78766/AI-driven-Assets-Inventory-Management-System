import { useState } from "react";
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

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "Rajesh Kumar",
    email: "rajesh.kumar@company.com",
    phone: "+91 98765 43210",
    role: "Admin",
    department: "IT Operations",
    location: "Mumbai",
    employeeId: "EMP-001",
    joinDate: "2020-01-15",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    laptopAssignments: true,
    softwareExpiry: true,
    licenseRenewal: true,
    systemUpdates: false,
    weeklyReport: true,
    pushNotifications: true,
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

  const handleSaveProfile = () => {
    showToast("Profile updated successfully");
  };

  const handleSaveNotifications = () => {
    showToast("Notification preferences saved");
  };

  const handleSaveSystem = () => {
    showToast("System settings updated");
  };

  const handleSaveSecurity = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    showToast("Security settings updated");
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorAuth: securityData.twoFactorAuth,
      sessionTimeout: securityData.sessionTimeout,
    });
  };

  const handleExportData = () => {
    showToast("Data export initiated");
  };

  return (
    <>
      <Navbar />
      <Sidebar />
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
              className={`settings-nav-item ${activeTab === "system" ? "settings-nav-item--active" : ""}`}
              onClick={() => setActiveTab("system")}
            >
              <Database size={20} />
              <span>System</span>
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
                  <div className="settings-avatar-section">
                    <div className="settings-avatar-large">
                      <User size={48} />
                    </div>
                    <button className="settings-avatar-upload">
                      <Camera size={16} />
                      Change Photo
                    </button>
                  </div>

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
                        <label>Employee ID</label>
                        <div className="settings-input-wrap">
                          <Briefcase
                            size={16}
                            className="settings-input-icon"
                          />
                          <input
                            type="text"
                            name="employeeId"
                            value={profileData.employeeId}
                            disabled
                            className="settings-input settings-input--disabled"
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

            {/* System Tab */}
            {activeTab === "system" && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <div>
                    <h2 className="settings-section-title">
                      System Configuration
                    </h2>
                    <p className="settings-section-subtitle">
                      Customize system behavior and preferences
                    </p>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-form">
                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>
                          <Palette size={16} />
                          Theme
                        </label>
                        <select
                          name="theme"
                          value={systemSettings.theme}
                          onChange={handleSystemChange}
                          className="settings-input"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      </div>
                      <div className="settings-form-group">
                        <label>
                          <Globe size={16} />
                          Language
                        </label>
                        <select
                          name="language"
                          value={systemSettings.language}
                          onChange={handleSystemChange}
                          className="settings-input"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="mr">Marathi</option>
                        </select>
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>
                          <Clock size={16} />
                          Date Format
                        </label>
                        <select
                          name="dateFormat"
                          value={systemSettings.dateFormat}
                          onChange={handleSystemChange}
                          className="settings-input"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div className="settings-form-group">
                        <label>
                          <Globe size={16} />
                          Time Zone
                        </label>
                        <select
                          name="timeZone"
                          value={systemSettings.timeZone}
                          onChange={handleSystemChange}
                          className="settings-input"
                        >
                          <option value="Asia/Kolkata">
                            IST (Asia/Kolkata)
                          </option>
                          <option value="America/New_York">
                            EST (America/New_York)
                          </option>
                          <option value="Europe/London">
                            GMT (Europe/London)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>Items Per Page</label>
                        <select
                          name="itemsPerPage"
                          value={systemSettings.itemsPerPage}
                          onChange={handleSystemChange}
                          className="settings-input"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                        </select>
                      </div>
                      <div className="settings-form-group">
                        <label>Backup Frequency</label>
                        <select
                          name="backupFrequency"
                          value={systemSettings.backupFrequency}
                          onChange={handleSystemChange}
                          className="settings-input"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                    </div>

                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <div className="settings-toggle-title">
                          <Database size={18} />
                          Automatic Backups
                        </div>
                        <p className="settings-toggle-desc">
                          Enable automatic data backups
                        </p>
                      </div>
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          name="autoBackup"
                          checked={systemSettings.autoBackup}
                          onChange={handleSystemChange}
                        />
                        <span className="settings-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-form-actions">
                      <button
                        className="settings-btn settings-btn--outline"
                        onClick={handleExportData}
                      >
                        <Download size={16} />
                        Export Data
                      </button>
                      <button
                        className="settings-btn settings-btn--primary"
                        onClick={handleSaveSystem}
                      >
                        <Save size={16} />
                        Save Settings
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

                  <div className="settings-divider"></div>

                  
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
      </div>
    </>
  );
};

export default Settings;
