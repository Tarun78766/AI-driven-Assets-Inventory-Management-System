import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { Bell, Mail, Globe, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 🔥 Logout handler
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // 🔥 Get user name
  const getUserName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <div className="logo-icon">i</div>
          <span className="logo-text">InventoryHub</span>
        </div>
      </div>

      <div className="nav-right">
        {/* <button className="icon-btn">
          <Mail size={20} />
        </button>

        <button className="icon-btn">
          <Globe size={20} />
        </button> */}

        {/* Notifications */}
        <Link to="/notifications" className="icon-btn">
          <div className="notification-wrapper">
            <Bell size={20} />
            <span className="badge">3</span>
          </div>
        </Link>

        {/* 🔥 USER PROFILE */}
        <div className="user-profile">
          <img
            src={`https://ui-avatars.com/api/?name=${getUserName()}&background=6366f1&color=fff`}
            alt="User"
            className="avatar"
          />
          <div className="user-info">
            <span className="user-name">{getUserName()}</span>
            <span className="user-role">{user?.role || "User"}</span>
          </div>
        </div>

        {/* Settings */}
        <Link to="/settings">
          <button className="nv-settings-btn">
            <SettingsIcon size={20} />
          </button>
        </Link>

        {/* 🔥 LOGOUT BUTTON (NEW) */}
        <button className="icon-btn logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;