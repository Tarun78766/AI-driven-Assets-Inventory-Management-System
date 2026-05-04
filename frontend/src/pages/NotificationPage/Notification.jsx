import React, { useEffect, useState } from "react";
import { AlertTriangle, Bell, BellOff, CheckCircle, ClipboardList, Info, RefreshCw, Search } from "lucide-react";
import { getNotifications } from "../../API/NotificationAPI";
import "./Notification.css";

const TYPE_ICONS = {
  query: Info,
  assignment: ClipboardList,
  inventory: AlertTriangle,
  alert: AlertTriangle,
};

const PRIORITY_CLASS = {
  High: "critical",
  Medium: "warning",
  Low: "success",
};

const formatTime = (date) => {
  if (!date) return "";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getNotifications();
      setNotifications(res.success ? res.data || [] : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    const content = `${notification.title} ${notification.message}`.toLowerCase();
    return content.includes(search.toLowerCase());
  });

  return (
    <div className="nf-body">
          <div className="nf-page-hdr">
            <div className="nf-page-hdr-left">
              <div className="nf-page-icon">
                <Bell size={22} />
              </div>
              <div>
                <h1 className="nf-page-title">Notifications</h1>
                <p className="nf-page-sub">
                  {notifications.length > 0
                    ? `${notifications.length} role-based notification${notifications.length !== 1 ? "s" : ""}`
                    : "No notifications"}
                </p>
              </div>
            </div>
          </div>

          <div className="nf-list-panel">
            <div className="nf-controls">
              <div className="nf-search-wrap">
                <Search size={16} className="nf-search-ico" />
                <input
                  className="nf-search"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="nf-list">
              {loading ? (
                <div className="nf-empty">
                  <RefreshCw size={40} className="ai-spin" />
                  <p>Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="nf-empty">
                  <AlertTriangle size={46} strokeWidth={1.2} />
                  <p>{error}</p>
                  <button className="nf-btn nf-btn--outline" onClick={fetchNotifications}>
                    Retry
                  </button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="nf-empty">
                  <BellOff size={46} strokeWidth={1.2} />
                  <p>No notifications</p>
                  <span>You're all caught up.</span>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const Icon = TYPE_ICONS[notification.type] || CheckCircle;
                  const priorityClass = PRIORITY_CLASS[notification.priority] || "info";
                  return (
                    <div key={notification.id} className={`nf-item nf-item--unread`}>
                      <span className="nf-unread-dot" />
                      <div className="nf-item-icon">
                        <Icon size={18} />
                      </div>
                      <div className="nf-item-content">
                        <div className="nf-item-top">
                          <span className="nf-item-title">{notification.title}</span>
                          <span className="nf-item-time">{formatTime(notification.createdAt)}</span>
                        </div>
                        <p className="nf-item-msg">{notification.message}</p>
                        <div className="nf-item-meta">
                          <span className={`nf-badge-type nf-${priorityClass}`}>{notification.priority}</span>
                          <span className="nf-badge-cat">{notification.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
    </div>
  );
};

export default Notification;
