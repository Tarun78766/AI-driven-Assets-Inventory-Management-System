import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Laptop,
  Package,
  Users,
  ClipboardList,
  FileText,
  Settings,
  UserPlus,
  ShieldAlert,
} from "lucide-react";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "") || "dashboard";
  
  const userRole = user?.role?.toLowerCase() || "employee";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["employee", "manager", "admin"] },
    { id: "laptops", label: "Laptops", icon: Laptop, roles: ["manager", "admin"] },
    { id: "software", label: "Software", icon: Package, roles: ["manager", "admin"] },
    { id: "employees", label: "Employees", icon: Users, roles: ["admin"] },
    { id: "user-management", label: "User Roles", icon: ShieldAlert, roles: ["admin"] },
    { id: "assignments", label: "Assignments", icon: ClipboardList, roles: ["manager", "admin"] },
    { id: "reports", label: "Reports", icon: FileText, roles: ["manager", "admin"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["employee", "manager", "admin"] },
  ];

  return (
    <div className="sidebar-outer">
      <div className="sidebar-inner">
        {menuItems
          .filter(item => item.roles.includes(userRole))
          .map((item) => {
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
