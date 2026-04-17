import React, { useState, useEffect, useMemo } from "react";
import { Search, ShieldAlert, ShieldCheck, Users, Briefcase, RefreshCw, } from "lucide-react";
import { getAllUsers, updateUserRole } from "./UserAPI";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import "./UserManagement.css";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      showToast("Failed to fetch users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (userId, oldRole, newRole) => {
    if (oldRole === newRole) return; // No change

    // If attempting to promote to Admin, warn first!
    if (newRole === "admin") {
      const confirm = window.confirm(
        "Are you sure you want to make this user an Admin? They will have full destructive access to the system."
      );
      if (!confirm) return;
    }

    try {
      // Optimistically mapping would be slightly faster but re-fetching ensures db state is fully atomic
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        showToast("Role updated successfully");
        // Re-fetch users to reflect changes uniformly
        await fetchUsers();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update role", "error");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchTarget = `${u.firstName} ${u.lastName} ${u.email} ${u.department}`.toLowerCase();
      return searchTarget.includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  const renderRoleIcon = (role) => {
    if (role === "admin") return <ShieldAlert size={14} />;
    if (role === "manager") return <ShieldCheck size={14} />;
    return <Users size={14} />;
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="page-content">
          <div className="users-container">
            {/* Header section */}
            
            <div className="users-header">
              <div className="header-left">
              <div className="header-icon">
                <ShieldAlert size={28} />
              </div>
              <div className="users-header-info">
                <h1>User Management</h1>
                <p>Manage employee access levels and system permissions</p>
              </div>
              </div>
              <div className="users-controls">
                <div className="users-search-box">
                  <Search size={18} className="users-search-icon" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="users-search-input"
                  />
                </div>
              </div>
            </div>

            {/* Toast rendering */}
            {toast && (
              <div
                className="toast-message"
                style={{
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  padding: "15px 25px",
                  borderRadius: "8px",
                  background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
                  color: toast.type === "error" ? "#dc2626" : "#16a34a",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  zIndex: 9999,
                  fontWeight: "500",
                }}
              >
                {toast.message}
              </div>
            )}

            {/* Table section */}
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Department</th>
                    <th>Current Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                  <td colSpan="11" className="no-data">
                    <RefreshCw
                      size={40}
                      className="il-loading-icon"
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#6366f1",
                        marginBottom: "10px",
                        opacity: 1,
                      }}
                    />
                    <p>Fetching models...</p>
                  </td>
                </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="users-empty">
                        <Users size={48} style={{ opacity: 0.2, marginBottom: "10px" }} />
                        <p>No users found matching your search.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelf = user._id === currentUser?.id;
                      
                      return (
                        <tr key={user._id} className="users-row">
                          <td>
                            <div className="user-name-cell">
                              <div className="user-avatar">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </div>
                              <div className="user-full-name">
                                {user.firstName} {user.lastName}
                                {isSelf && (
                                  <span style={{ color: "#6366f1", fontSize: "12px", marginLeft: "8px" }}>
                                    (You)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="user-email-cell">{user.email}</div>
                          </td>
                          <td>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569" }}>
                              <Briefcase size={14} />
                              {user.department || "N/A"}
                            </span>
                          </td>
                          <td>
                            <div className={`role-badge ${user.role}`}>
                              {renderRoleIcon(user.role)}
                              {user.role}
                            </div>
                          </td>
                          <td>
                            <select
                              className="role-select"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, user.role, e.target.value)}
                              disabled={isSelf}
                              title={isSelf ? "You cannot modify your own role" : "Change user role"}
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
