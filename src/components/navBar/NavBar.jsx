import "./Navbar.css";
import { Bell, Mail, Globe, Settings as SettingsIcon } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <div className="logo-icon">i</div>
          <span className="logo-text">InventoryHub</span>
        </div>
      </div>

      <div className="nav-right">
        <button className="icon-btn">
          <Mail size={20} />
        </button>

        <button className="icon-btn">
          <Globe size={20} />
        </button>

        <button className="icon-btn">
          <div className="notification-wrapper">
            <Bell size={20} />
            <span className="badge">3</span>
          </div>
        </button>

        <div className="user-profile">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
            alt="User"
            className="avatar"
          />
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>

        <button className="settings-btn">
          <SettingsIcon size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
