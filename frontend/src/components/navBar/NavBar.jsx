import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";
import { Bell, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications } from "../../API/NotificationAPI";
import { useEffect, useState } from "react";

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const readStorageKey = user?._id || user?.id ? `readNotifications:${user._id || user.id}` : "readNotifications";

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await getNotifications();
          if (res.success) {
            const list = res.data || [];
            const readIds = JSON.parse(localStorage.getItem(readStorageKey) || "[]");
            setNotifications(list);
            setUnreadCount(list.filter((notification) => !readIds.includes(notification.id)).length);
            setNotificationError("");
          }
        } catch (error) {
          setNotificationError("Unable to load notifications");
        }
      };
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 60000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [user, readStorageKey]);

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

  const formatNotificationTime = (date) => {
    if (!date) return "";
    const diffMs = Date.now() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const markNotificationRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem(readStorageKey) || "[]");
    if (!readIds.includes(id)) {
      const nextReadIds = [...readIds, id];
      localStorage.setItem(readStorageKey, JSON.stringify(nextReadIds));
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  };

  const markAllNotificationsRead = () => {
    localStorage.setItem(readStorageKey, JSON.stringify(notifications.map((notification) => notification.id)));
    setUnreadCount(0);
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

        <div className="notification-menu">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <div className="notification-wrapper">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="badge notification-badge-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </button>
        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllNotificationsRead}>
                  Mark all read
                </button>
              )}
            </div>
            {notificationError ? (
              <div className="notification-dropdown-empty">{notificationError}</div>
            ) : notifications.length === 0 ? (
              <div className="notification-dropdown-empty">No notifications</div>
            ) : (
              <div className="notification-dropdown-list">
                {notifications.map((notification) => {
                  const readIds = JSON.parse(localStorage.getItem(readStorageKey) || "[]");
                  const isUnread = !readIds.includes(notification.id);
                  return (
                    <button
                      type="button"
                      key={notification.id}
                      className={`notification-dropdown-item ${isUnread ? "unread" : ""}`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className={`notification-priority ${notification.priority?.toLowerCase() || "medium"}`} />
                      <div className="notification-dropdown-content">
                        <div className="notification-dropdown-title">
                          <span>{notification.title}</span>
                          <small>{formatNotificationTime(notification.createdAt)}</small>
                        </div>
                        <p>{notification.message}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </div>

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

export default NavBar;
