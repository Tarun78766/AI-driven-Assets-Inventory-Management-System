import { useLocation, Link } from "react-router-dom";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Laptop,
  Package,
  Users,
  ClipboardList,
  FileText,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "") || "dashboard";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "laptops", label: "Laptops", icon: Laptop },
    { id: "software", label: "Software", icon: Package },
    { id: "employees", label: "Employees", icon: Users },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="sidebar-outer">
      <div className="sidebar-inner">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              to={`/${item.id}`}
              key={item.id}
              style={{ textDecoration: "none" }}
            >
              <button
                type="button"
                className={`menu-btn ${
                  currentPath === item.id ? "active" : ""
                }`}
              >
                <Icon className="menu-icon" size={24} />
                <span className="menu-label">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
