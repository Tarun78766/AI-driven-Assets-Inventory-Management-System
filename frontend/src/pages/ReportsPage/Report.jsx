import { useState, useMemo } from "react";
import "./Report.css";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  FileText,
  Laptop,
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  PieChart,
  Activity,
  Zap,
  RefreshCw,
} from "lucide-react";

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";

/* ─── Mock Data ─────────────────────────── */
const LIFECYCLE_DATA = [
  { id: 1, assetName: "Dell XPS 15 #101", type: "Laptop", purchaseDate: "2022-01-15", age: 37, status: "Replace Soon", assignedTo: "Rajesh Kumar", condition: "Good" },
  { id: 2, assetName: 'MacBook Pro 16" #102', type: "Laptop", purchaseDate: "2023-11-20", age: 15, status: "Active", assignedTo: "Priya Sharma", condition: "Excellent" },
  { id: 3, assetName: "HP EliteBook #103", type: "Laptop", purchaseDate: "2024-02-10", age: 12, status: "Active", assignedTo: "Amit Patel", condition: "Excellent" },
  { id: 4, assetName: "Lenovo ThinkPad #104", type: "Laptop", purchaseDate: "2021-09-18", age: 41, status: "Expired", assignedTo: "Unassigned", condition: "Fair" },
  { id: 5, assetName: "ASUS ROG #105", type: "Laptop", purchaseDate: "2023-06-10", age: 20, status: "Active", assignedTo: "Vikram Singh", condition: "Good" },
];

const SOFTWARE_EXPIRY = [
  { id: 1, name: "AutoCAD", vendor: "Autodesk", expiryDate: "2025-02-28", daysLeft: 4, status: "Expired", licenses: 15, cost: 220 },
  { id: 2, name: "Adobe Creative Suite", vendor: "Adobe", expiryDate: "2025-03-15", daysLeft: 19, status: "Critical", licenses: 50, cost: 54.99 },
  { id: 3, name: "GitHub Enterprise", vendor: "GitHub", expiryDate: "2025-08-30", daysLeft: 187, status: "Upcoming", licenses: 120, cost: 21 },
  { id: 4, name: "Tableau Desktop", vendor: "Salesforce", expiryDate: "2025-11-10", daysLeft: 259, status: "Upcoming", licenses: 25, cost: 70 },
  { id: 5, name: "Microsoft Office 365", vendor: "Microsoft", expiryDate: "2025-12-31", daysLeft: 310, status: "Active", licenses: 300, cost: 12.5 },
];

const GROWTH_FORECAST = [
  { year: 2024, employees: 1000, laptops: 265, software: 67, totalCost: 1250000 },
  { year: 2025, employees: 1050, laptops: 278, software: 70, totalCost: 1312500 },
  { year: 2026, employees: 1103, laptops: 292, software: 74, totalCost: 1378125 },
  { year: 2027, employees: 1158, laptops: 307, software: 78, totalCost: 1447031 },
];

const ASSIGNMENT_HISTORY = [
  { month: "Aug 2024", laptops: 12, software: 45, total: 57 },
  { month: "Sep 2024", laptops: 8, software: 32, total: 40 },
  { month: "Oct 2024", laptops: 15, software: 51, total: 66 },
  { month: "Nov 2024", laptops: 10, software: 38, total: 48 },
  { month: "Dec 2024", laptops: 18, software: 62, total: 80 },
  { month: "Jan 2025", laptops: 14, software: 47, total: 61 },
];

const ASSET_UTILIZATION = [
  { category: "Laptops", total: 265, inUse: 245, available: 15, underRepair: 5, utilization: 92 },
  { category: "Software", total: 67, inUse: 54, available: 13, expired: 0, utilization: 81 },
];

const DEPARTMENT_ALLOCATION = [
  { department: "Engineering", laptops: 80, software: 18, employees: 120 },
  { department: "IT Operations", laptops: 35, software: 12, employees: 45 },
  { department: "Sales", laptops: 55, software: 8, employees: 85 },
  { department: "Marketing", laptops: 25, software: 9, employees: 38 },
  { department: "HR", laptops: 15, software: 5, employees: 22 },
  { department: "Finance", laptops: 20, software: 7, employees: 30 },
  { department: "Design", laptops: 18, software: 5, employees: 28 },
  { department: "Analytics", laptops: 12, software: 3, employees: 18 },
];

const Report = () => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleExport = (reportType) => {
    showToast(`Exporting ${reportType} report...`);
  };

  const stats = useMemo(
    () => ({
      totalAssets: 265 + 67,
      activeAssignments: 245 + 54,
      expiringLicenses: SOFTWARE_EXPIRY.filter((s) => s.daysLeft <= 90).length,
      replacementDue: LIFECYCLE_DATA.filter((l) => l.status === "Replace Soon" || l.status === "Expired").length,
      avgUtilization: Math.round(((245 + 54) / (265 + 67)) * 100),
      forecastGrowth: 5,
    }),
    []
  );

  const getLifecycleStatusColor = (status) => {
    const colors = {
      Active: { bg: "#d1fae5", color: "#10b981" },
      "Replace Soon": { bg: "#fef3c7", color: "#f59e0b" },
      Expired: { bg: "#fee2e2", color: "#ef4444" },
    };
    return colors[status] || colors.Active;
  };

  const getSoftwareStatusColor = (status) => {
    const colors = {
      Active: { bg: "#d1fae5", color: "#10b981" },
      Upcoming: { bg: "#fef3c7", color: "#f59e0b" },
      Critical: { bg: "#fee2e2", color: "#ef4444" },
      Expired: { bg: "#f1f5f9", color: "#8892a4" },
    };
    return colors[status] || colors.Active;
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="reports-page">
        {toast && (
          <div className={`reports-toast reports-toast--${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="reports-header">
          <div className="reports-header-left">
            <div className="reports-header-icon">
              <BarChart3 size={26} />
            </div>
            <div>
              <h1 className="reports-title">Reports & Forecasting</h1>
              <p className="reports-subtitle">Analytics, lifecycle tracking, and growth projections</p>
            </div>
          </div>
          <div className="reports-header-right">
            <button className="reports-btn reports-btn--outline" onClick={() => handleExport("complete")}>
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="reports-stats">
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}>
              <Activity size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.totalAssets}</div>
              <div className="reports-stat-label">Total Assets</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.activeAssignments}</div>
              <div className="reports-stat-label">Active Assignments</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.expiringLicenses}</div>
              <div className="reports-stat-label">Expiring Soon</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.replacementDue}</div>
              <div className="reports-stat-label">Replacement Due</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.avgUtilization}%</div>
              <div className="reports-stat-label">Avg Utilization</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
              <Zap size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.forecastGrowth}%</div>
              <div className="reports-stat-label">Yearly Growth</div>
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="reports-tabs">
          <button className={`reports-tab ${selectedReport === "overview" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("overview")}>
            <PieChart size={18} />
            Overview
          </button>
          <button className={`reports-tab ${selectedReport === "lifecycle" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("lifecycle")}>
            <Clock size={18} />
            Lifecycle
          </button>
          <button className={`reports-tab ${selectedReport === "software" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("software")}>
            <Package size={18} />
            Software Expiry
          </button>
          <button className={`reports-tab ${selectedReport === "forecast" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("forecast")}>
            <TrendingUp size={18} />
            Growth Forecast
          </button>
          <button className={`reports-tab ${selectedReport === "utilization" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("utilization")}>
            <Activity size={18} />
            Utilization
          </button>
        </div>

        {/* Overview Tab */}
        {selectedReport === "overview" && (
          <div className="reports-content">
            <div className="reports-grid">
              {/* Assignment History Chart */}
              <div className="reports-card reports-card--full">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Assignment History</h3>
                    <p className="reports-card-subtitle">Last 6 months trend analysis</p>
                  </div>
                  <button className="reports-btn-icon" onClick={() => handleExport("assignment-history")}>
                    <Download size={16} />
                  </button>
                </div>
                <div className="reports-chart">
                  <div className="reports-bar-chart">
                    {ASSIGNMENT_HISTORY.map((item, idx) => {
                      const maxTotal = Math.max(...ASSIGNMENT_HISTORY.map((i) => i.total));
                      return (
                        <div key={idx} className="reports-bar-group">
                          <div 
                            className="reports-bar-container" 
                            data-total={`${item.total} Total`}
                            title={`Laptops: ${item.laptops}, Software: ${item.software}`}
                          >
                            <div 
                              className="reports-bar reports-bar--software" 
                              style={{ height: `${(item.software / maxTotal) * 100}%` }}
                            ></div>
                            <div 
                              className="reports-bar reports-bar--laptops" 
                              style={{ height: `${(item.laptops / maxTotal) * 100}%` }}
                            ></div>
                          </div>
                          <span className="reports-bar-label">{item.month.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="reports-chart-legend">
                    <div className="reports-legend-item">
                      <span className="reports-legend-dot" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}></span>
                      <span>Laptops Assigned</span>
                    </div>
                    <div className="reports-legend-item">
                      <span className="reports-legend-dot" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}></span>
                      <span>Software Licenses</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Allocation */}
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Department Allocation</h3>
                    <p className="reports-card-subtitle">Assets by department</p>
                  </div>
                </div>
                <div className="reports-table-simple">
                  {DEPARTMENT_ALLOCATION.slice(0, 5).map((dept) => (
                    <div key={dept.department} className="reports-dept-row">
                      <div className="reports-dept-name">{dept.department}</div>
                      <div className="reports-dept-stats">
                        <span className="reports-dept-stat">
                          <Laptop size={12} /> {dept.laptops}
                        </span>
                        <span className="reports-dept-stat">
                          <Package size={12} /> {dept.software}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asset Utilization */}
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Asset Utilization</h3>
                    <p className="reports-card-subtitle">Current usage rates</p>
                  </div>
                </div>
                <div className="reports-utilization">
                  {ASSET_UTILIZATION.map((asset) => (
                    <div key={asset.category} className="reports-util-item">
                      <div className="reports-util-header">
                        <span className="reports-util-label">{asset.category}</span>
                        <span className="reports-util-pct">{asset.utilization}%</span>
                      </div>
                      <div className="reports-util-bar-bg">
                        <div className="reports-util-bar-fill" style={{ width: `${asset.utilization}%` }}></div>
                      </div>
                      <div className="reports-util-stats">
                        <span>{asset.inUse} In Use</span>
                        <span>·</span>
                        <span>{asset.available} Available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lifecycle Tab */}
        {selectedReport === "lifecycle" && (
          <div className="reports-content">
            <div className="reports-card">
              <div className="reports-card-header">
                <div>
                  <h3 className="reports-card-title">Laptop Lifecycle Tracking</h3>
                  <p className="reports-card-subtitle">3-year replacement policy monitoring</p>
                </div>
                <button className="reports-btn-icon" onClick={() => handleExport("lifecycle")}>
                  <Download size={16} />
                </button>
              </div>
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Asset Name</th>
                      <th>Purchase Date</th>
                      <th>Age (Months)</th>
                      <th>Assigned To</th>
                      <th>Condition</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LIFECYCLE_DATA.map((item) => {
                      const statusColor = getLifecycleStatusColor(item.status);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="reports-asset-cell">
                              <Laptop size={16} />
                              <strong>{item.assetName}</strong>
                            </div>
                          </td>
                          <td>
                            <div className="reports-date">
                              <Calendar size={13} />
                              {new Date(item.purchaseDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td>
                            <span className="reports-age">{item.age} months</span>
                          </td>
                          <td>{item.assignedTo}</td>
                          <td>
                            <span className="reports-condition">{item.condition}</span>
                          </td>
                          <td>
                            <span className="reports-status-badge" style={{ background: statusColor.bg, color: statusColor.color }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Software Expiry Tab */}
        {selectedReport === "software" && (
          <div className="reports-content">
            <div className="reports-card">
              <div className="reports-card-header">
                <div>
                  <h3 className="reports-card-title">Software License Expiry</h3>
                  <p className="reports-card-subtitle">Renewal alerts (30/60/90 days)</p>
                </div>
                <button className="reports-btn-icon" onClick={() => handleExport("software-expiry")}>
                  <Download size={16} />
                </button>
              </div>
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Software</th>
                      <th>Vendor</th>
                      <th>Expiry Date</th>
                      <th>Days Left</th>
                      <th>Licenses</th>
                      <th>Cost/Month</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SOFTWARE_EXPIRY.map((item) => {
                      const statusColor = getSoftwareStatusColor(item.status);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="reports-asset-cell">
                              <Package size={16} />
                              <strong>{item.name}</strong>
                            </div>
                          </td>
                          <td>{item.vendor}</td>
                          <td>
                            <div className="reports-date">
                              <Calendar size={13} />
                              {new Date(item.expiryDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td>
                            <span className={`reports-days-left ${item.daysLeft <= 30 ? "reports-days-left--critical" : item.daysLeft <= 90 ? "reports-days-left--warning" : ""}`}>
                              {item.daysLeft > 0 ? `${item.daysLeft} days` : "Expired"}
                            </span>
                          </td>
                          <td>{item.licenses}</td>
                          <td>
                            <span className="reports-cost">${item.cost.toFixed(2)}</span>
                          </td>
                          <td>
                            <span className="reports-status-badge" style={{ background: statusColor.bg, color: statusColor.color }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Growth Forecast Tab */}
        {selectedReport === "forecast" && (
          <div className="reports-content">
            <div className="reports-card">
              <div className="reports-card-header">
                <div>
                  <h3 className="reports-card-title">3-Year Growth Forecast</h3>
                  <p className="reports-card-subtitle">5% annual growth projection</p>
                </div>
                <button className="reports-btn-icon" onClick={() => handleExport("forecast")}>
                  <Download size={16} />
                </button>
              </div>
              <div className="reports-forecast-table">
                <div className="reports-forecast-row reports-forecast-row--header">
                  <div>Year</div>
                  <div>Employees</div>
                  <div>Laptops</div>
                  <div>Software</div>
                  <div>Est. Total Cost</div>
                </div>
                {GROWTH_FORECAST.map((item, idx) => (
                  <div key={item.year} className={`reports-forecast-row ${idx === 0 ? "reports-forecast-row--current" : ""}`}>
                    <div className="reports-forecast-year">
                      {item.year}
                      {idx === 0 && <span className="reports-forecast-badge">Current</span>}
                    </div>
                    <div>{item.employees.toLocaleString()}</div>
                    <div>{item.laptops}</div>
                    <div>{item.software}</div>
                    <div className="reports-forecast-cost">₹{(item.totalCost / 100000).toFixed(1)}L</div>
                  </div>
                ))}
              </div>
              <div className="reports-forecast-note">
                <AlertTriangle size={16} />
                <span>Based on 5% annual employee growth rate and current asset allocation ratios</span>
              </div>
            </div>
          </div>
        )}

        {/* Utilization Tab */}
        {selectedReport === "utilization" && (
          <div className="reports-content">
            <div className="reports-grid">
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Detailed Utilization</h3>
                    <p className="reports-card-subtitle">Asset usage breakdown</p>
                  </div>
                </div>
                <div className="reports-utilization-detail">
                  {ASSET_UTILIZATION.map((asset) => (
                    <div key={asset.category} className="reports-util-detail-card">
                      <h4 className="reports-util-detail-title">{asset.category}</h4>
                      <div className="reports-util-detail-grid">
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">Total</span>
                          <span className="reports-util-detail-value">{asset.total}</span>
                        </div>
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">In Use</span>
                          <span className="reports-util-detail-value" style={{ color: "#10b981" }}>
                            {asset.inUse}
                          </span>
                        </div>
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">Available</span>
                          <span className="reports-util-detail-value" style={{ color: "#6366f1" }}>
                            {asset.available}
                          </span>
                        </div>
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">Utilization</span>
                          <span className="reports-util-detail-value" style={{ color: "#8b5cf6", fontSize: "20px" }}>
                            {asset.utilization}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Top Departments</h3>
                    <p className="reports-card-subtitle">By total asset count</p>
                  </div>
                </div>
                <div className="reports-dept-ranking">
                  {DEPARTMENT_ALLOCATION.sort((a, b) => b.laptops + b.software - (a.laptops + a.software))
                    .slice(0, 5)
                    .map((dept, idx) => (
                      <div key={dept.department} className="reports-dept-rank-item">
                        <span className="reports-dept-rank-num">{idx + 1}</span>
                        <div className="reports-dept-rank-info">
                          <span className="reports-dept-rank-name">{dept.department}</span>
                          <span className="reports-dept-rank-count">{dept.laptops + dept.software} assets</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Report;