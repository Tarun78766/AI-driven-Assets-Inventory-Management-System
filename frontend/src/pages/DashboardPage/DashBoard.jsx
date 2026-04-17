import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { getDashboardData } from "./DashboardAPI";

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
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";



const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sample data for statistics
const stats = [
  {
    id: 1,
    title: "Total Laptops",
    value: dashboardData?.laptops?.total,
    icon: Laptop,
    color: "#6366f1",
  },
  {
    id: 2,
    title: "Total Software",
    value: dashboardData?.software?.totalLicenses,
    icon: Package,
    color: "#8b5cf6",
  },
  {
    id: 3,
    title: "Assignments",
    value: dashboardData?.assignments?.total,
    icon: TrendingUp,
    color: "#14b8a6",
  },
];

  // Recent activity data
  const recentActivity = dashboardData?.activity;
  // Low stock alerts
  const lowStockAlerts =dashboardData?.alerts;
  
  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="dashboard">
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
            <p style={{ fontSize: "16px", fontWeight: "500", color: "#64748b" }}>Fetching Dashboard Data...</p>
          </div>
        ) : (
          <>
            <div className="dashboard-header">
          <div className="header-left">
            <div className="header-icon">
              <LayoutDashboard size={28} />
            </div>

            <div>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back! Here's what's happening with your inventory.
              </p>
            </div>
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
              {recentActivity?.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon-wrapper">
                    {activity.status === "success" && (
                      <CheckCircle
                        size={20}
                        className="activity-icon success"
                      />
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
                      <span className="activity-item-name">
                        {activity.item}
                      </span>
                    </div>
                    <div className="activity-meta">
                      <span className="activity-employee">
                        {activity.employee}
                      </span>
                      <span className="activity-time">{new Date(activity.time).toLocaleString()}</span>
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
              <span className="alert-badge">{lowStockAlerts?.length}</span>
            </div>
            <div className="alerts-list">
              {lowStockAlerts?.map((alert) => (
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
            <div className="quick-stat-value">
              {dashboardData?.laptops?.available}
            </div>
            <div className="quick-stat-bar">
              <div
                className="quick-stat-progress"
                style={{ width: "25%" }}
              ></div>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-label">In Use</div>
            <div className="quick-stat-value">
              {dashboardData?.laptops?.inUse}
            </div>
            <div className="quick-stat-bar">
              <div
                className="quick-stat-progress"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-label">Under Maintenance</div>
            <div className="quick-stat-value">
              {dashboardData?.laptops?.underRepair}
            </div>
            <div className="quick-stat-bar">
              <div
                className="quick-stat-progress warning"
                style={{ width: "15%" }}
              ></div>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-label">Software Licenses</div>
            <div className="quick-stat-value">
              {dashboardData?.software?.totalLicenses}
            </div>
            <div className="quick-stat-bar">
              <div
                className="quick-stat-progress success"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
