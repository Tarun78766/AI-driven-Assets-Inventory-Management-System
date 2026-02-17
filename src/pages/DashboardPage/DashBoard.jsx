import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import "./Dashboard.css";
import {
  Laptop,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const Dashboard = () => {



  // Sample data for statistics
  const stats = [
    {
      id: 1,
      title: "Total Laptops",
      value: "245",
      change: "+12%",
      isPositive: true,
      icon: Laptop,
      color: "#6366f1",
    },
    {
      id: 2,
      title: "Total Software",
      value: "89",
      change: "+8%",
      isPositive: true,
      icon: Package,
      color: "#8b5cf6",
    },
    {
      id: 3,
      title: "Active Employees",
      value: "184",
      change: "+5%",
      isPositive: true,
      icon: Users,
      color: "#ec4899",
    },
    {
      id: 4,
      title: "Assignments",
      value: "312",
      change: "-3%",
      isPositive: false,
      icon: TrendingUp,
      color: "#14b8a6",
    },
  ];

  // Recent activity data
  const recentActivity = [
    {
      id: 1,
      action: "Laptop assigned",
      item: "Dell XPS 15",
      employee: "John Smith",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      action: "Software installed",
      item: "Adobe Creative Suite",
      employee: "Sarah Johnson",
      time: "4 hours ago",
      status: "success",
    },
    {
      id: 3,
      action: "Laptop returned",
      item: 'MacBook Pro 16"',
      employee: "Mike Davis",
      time: "5 hours ago",
      status: "warning",
    },
    {
      id: 4,
      action: "New laptop added",
      item: "HP EliteBook 840",
      employee: "Admin",
      time: "1 day ago",
      status: "success",
    },
    {
      id: 5,
      action: "License expired",
      item: "Microsoft Office",
      employee: "System",
      time: "2 days ago",
      status: "error",
    },
  ];

  // Low stock alerts
  const lowStockAlerts = [
    { id: 1, item: "Dell Latitude 5420", stock: 3, threshold: 10 },
    { id: 2, item: "Adobe Photoshop License", stock: 2, threshold: 5 },
    { id: 3, item: "MacBook Air M2", stock: 4, threshold: 8 },
  ];

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back! Here's what's happening with your inventory.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-header">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <span
                  className={`stat-change ${stat.isPositive ? "positive" : "negative"}`}
                >
                  {stat.isPositive ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  {stat.change}
                </span>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon-wrapper">
                  {activity.status === "success" && (
                    <CheckCircle size={20} className="activity-icon success" />
                  )}
                  {activity.status === "warning" && (
                    <Clock size={20} className="activity-icon warning" />
                  )}
                  {activity.status === "error" && (
                    <AlertCircle size={20} className="activity-icon error" />
                  )}
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-item-name">{activity.item}</span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-employee">
                      {activity.employee}
                    </span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h2 className="card-title">Low Stock Alerts</h2>
            <span className="alert-badge">{lowStockAlerts.length}</span>
          </div>
          <div className="alerts-list">
            {lowStockAlerts.map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="alert-content">
                  <p className="alert-item-name">{alert.item}</p>
                  <div className="alert-stock">
                    <span className="stock-current">
                      {alert.stock} remaining
                    </span>
                    <span className="stock-threshold">
                      Min: {alert.threshold}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="reorder-btn">Reorder Items</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat-item">
          <div className="quick-stat-label">Available Laptops</div>
          <div className="quick-stat-value">61</div>
          <div className="quick-stat-bar">
            <div className="quick-stat-progress" style={{ width: "25%" }}></div>
          </div>
        </div>
        <div className="quick-stat-item">
          <div className="quick-stat-label">In Use</div>
          <div className="quick-stat-value">184</div>
          <div className="quick-stat-bar">
            <div className="quick-stat-progress" style={{ width: "75%" }}></div>
          </div>
        </div>
        <div className="quick-stat-item">
          <div className="quick-stat-label">Under Maintenance</div>
          <div className="quick-stat-value">12</div>
          <div className="quick-stat-bar">
            <div
              className="quick-stat-progress warning"
              style={{ width: "15%" }}
            ></div>
          </div>
        </div>
        <div className="quick-stat-item">
          <div className="quick-stat-label">Software Licenses</div>
          <div className="quick-stat-value">89</div>
          <div className="quick-stat-bar">
            <div
              className="quick-stat-progress success"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div></>
    
  );
};

export default Dashboard;
