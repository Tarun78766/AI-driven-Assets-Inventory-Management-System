import { useEffect, useMemo, useState } from "react";
import "./Report.css";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Laptop,
  Package,
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
import { getReportsData } from "./ReportsAPI";

const EMPTY_REPORTS_DATA = {
  stats: {
    totalAssets: 0,
    activeAssignments: 0,
    expiringLicenses: 0,
    replacementDue: 0,
    avgUtilization: 0,
    forecastGrowth: 0,
  },
  assignmentHistory: [],
  lifecycleData: [],
  softwareExpiry: [],
  growthForecast: [],
  assetUtilization: [],
  departmentAllocation: [],
  topDepartments: [],
};

const Report = () => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [toast, setToast] = useState(null);
  const [reportsData, setReportsData] = useState(EMPTY_REPORTS_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await getReportsData();
        setReportsData(data || EMPTY_REPORTS_DATA);
      } catch (error) {
        console.error("Failed to fetch reports data:", error);
        showToast("Failed to load reports data.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleExport = (reportType) => {
    showToast(`Exporting ${reportType} report...`);
  };

  const stats = reportsData?.stats || EMPTY_REPORTS_DATA.stats;
  const lifecycleData = reportsData?.lifecycleData || [];
  const softwareExpiry = reportsData?.softwareExpiry || [];
  const growthForecast = reportsData?.growthForecast || [];
  const assignmentHistory = reportsData?.assignmentHistory || [];
  const assetUtilization = reportsData?.assetUtilization || [];
  const departmentAllocation = reportsData?.departmentAllocation || [];
  const topDepartments = reportsData?.topDepartments || [];

  const maxAssignmentTotal = useMemo(() => {
    if (assignmentHistory.length === 0) {
      return 1;
    }

    return Math.max(...assignmentHistory.map((item) => item.total), 1);
  }, [assignmentHistory]);

  const overviewDepartments = useMemo(
    () => departmentAllocation.slice(0, 5),
    [departmentAllocation]
  );

  const rankedDepartments = useMemo(() => {
    if (topDepartments.length > 0) {
      return topDepartments;
    }

    return [...departmentAllocation]
      .sort(
        (left, right) =>
          right.laptops + right.software - (left.laptops + left.software)
      )
      .slice(0, 5);
  }, [departmentAllocation, topDepartments]);

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
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        {isLoading ? (
          <div
            className="reports-content"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100vh - 220px)",
              gap: "12px",
            }}
          >
            <RefreshCw
              size={44}
              style={{
                animation: "spin 1s linear infinite",
                color: "#6366f1",
              }}
            />
            <p style={{ fontSize: "16px", fontWeight: "500", color: "#64748b" }}>
              Fetching reports data...
            </p>
          </div>
        ) : (
          <>
            <div className="reports-header">
              <div className="reports-header-left">
                <div className="reports-header-icon">
                  <BarChart3 size={26} />
                </div>
                <div>
                  <h1 className="reports-title">Reports & Forecasting</h1>
                  <p className="reports-subtitle">
                    Analytics, lifecycle tracking, and growth projections
                  </p>
                </div>
              </div>
              <div className="reports-header-right">
                <button
                  className="reports-btn reports-btn--outline"
                  onClick={() => handleExport("complete")}
                >
                  <Download size={16} /> Export Report
                </button>
              </div>
            </div>

            <div className="reports-stats">
              <div className="reports-stat-card">
                <div
                  className="reports-stat-icon"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "#6366F1",
                  }}
                >
                  <Activity size={22} />
                </div>
                <div>
                  <div className="reports-stat-value">{stats.totalAssets}</div>
                  <div className="reports-stat-label">Total Assets</div>
                </div>
              </div>
              <div className="reports-stat-card">
                <div
                  className="reports-stat-icon"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10B981",
                  }}
                >
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="reports-stat-value">
                    {stats.activeAssignments}
                  </div>
                  <div className="reports-stat-label">Active Assignments</div>
                </div>
              </div>
              <div className="reports-stat-card">
                <div
                  className="reports-stat-icon"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    color: "#ef4444",
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <div className="reports-stat-value">
                    {stats.expiringLicenses}
                  </div>
                  <div className="reports-stat-label">Expiring Soon</div>
                </div>
              </div>
              <div className="reports-stat-card">
                <div
                  className="reports-stat-icon"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#f59e0b",
                  }}
                >
                  <RefreshCw size={22} />
                </div>
                <div>
                  <div className="reports-stat-value">{stats.replacementDue}</div>
                  <div className="reports-stat-label">Replacement Due</div>
                </div>
              </div>
              <div className="reports-stat-card">
                <div
                  className="reports-stat-icon"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "#6366f1",
                  }}
                >
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div className="reports-stat-value">
                    {stats.avgUtilization}%
                  </div>
                  <div className="reports-stat-label">Avg Utilization</div>
                </div>
              </div>
              <div className="reports-stat-card">
                <div
                  className="reports-stat-icon"
                  style={{
                    background: "rgba(139,92,246,0.12)",
                    color: "#8b5cf6",
                  }}
                >
                  <Zap size={22} />
                </div>
                <div>
                  <div className="reports-stat-value">
                    {stats.forecastGrowth}%
                  </div>
                  <div className="reports-stat-label">Yearly Growth</div>
                </div>
              </div>
            </div>

            <div className="reports-tabs">
              <button
                className={`reports-tab ${
                  selectedReport === "overview" ? "reports-tab--active" : ""
                }`}
                onClick={() => setSelectedReport("overview")}
              >
                <PieChart size={18} />
                Overview
              </button>
              <button
                className={`reports-tab ${
                  selectedReport === "lifecycle" ? "reports-tab--active" : ""
                }`}
                onClick={() => setSelectedReport("lifecycle")}
              >
                <Clock size={18} />
                Lifecycle
              </button>
              <button
                className={`reports-tab ${
                  selectedReport === "software" ? "reports-tab--active" : ""
                }`}
                onClick={() => setSelectedReport("software")}
              >
                <Package size={18} />
                Software Expiry
              </button>
              <button
                className={`reports-tab ${
                  selectedReport === "forecast" ? "reports-tab--active" : ""
                }`}
                onClick={() => setSelectedReport("forecast")}
              >
                <TrendingUp size={18} />
                Growth Forecast
              </button>
              <button
                className={`reports-tab ${
                  selectedReport === "utilization" ? "reports-tab--active" : ""
                }`}
                onClick={() => setSelectedReport("utilization")}
              >
                <Activity size={18} />
                Utilization
              </button>
            </div>

            {selectedReport === "overview" && (
              <div className="reports-content">
                <div className="reports-grid">
                  <div className="reports-card reports-card--full">
                    <div className="reports-card-header">
                      <div>
                        <h3 className="reports-card-title">Assignment History</h3>
                        <p className="reports-card-subtitle">
                          Last 6 months trend analysis
                        </p>
                      </div>
                      <button
                        className="reports-btn-icon"
                        onClick={() => handleExport("assignment-history")}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                    <div className="reports-chart">
                      <div className="reports-bar-chart">
                        {assignmentHistory.length === 0 ? (
                          <div className="reports-empty-state">
                            No assignment history available
                          </div>
                        ) : (
                          assignmentHistory.map((item, idx) => (
                            <div key={`${item.month}-${idx}`} className="reports-bar-group">
                              <div
                                className="reports-bar-container"
                                data-total={`${item.total} Total`}
                                title={`Laptops: ${item.laptops}, Software: ${item.software}`}
                              >
                                <div
                                  className="reports-bar reports-bar--software"
                                  style={{
                                    height: `${(item.software / maxAssignmentTotal) * 100}%`,
                                  }}
                                ></div>
                                <div
                                  className="reports-bar reports-bar--laptops"
                                  style={{
                                    height: `${(item.laptops / maxAssignmentTotal) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="reports-bar-label">
                                {item.month.split(" ")[0]}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="reports-chart-legend">
                        <div className="reports-legend-item">
                          <span
                            className="reports-legend-dot"
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                            }}
                          ></span>
                          <span>Laptops Assigned</span>
                        </div>
                        <div className="reports-legend-item">
                          <span
                            className="reports-legend-dot"
                            style={{
                              background:
                                "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                            }}
                          ></span>
                          <span>Software Licenses</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="reports-card">
                    <div className="reports-card-header">
                      <div>
                        <h3 className="reports-card-title">Department Allocation</h3>
                        <p className="reports-card-subtitle">Assets by department</p>
                      </div>
                    </div>
                    <div className="reports-table-simple">
                      {overviewDepartments.length === 0 ? (
                        <div className="reports-empty-state">
                          No department allocation available
                        </div>
                      ) : (
                        overviewDepartments.map((dept) => (
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
                        ))
                      )}
                    </div>
                  </div>

                  <div className="reports-card">
                    <div className="reports-card-header">
                      <div>
                        <h3 className="reports-card-title">Asset Utilization</h3>
                        <p className="reports-card-subtitle">Current usage rates</p>
                      </div>
                    </div>
                    <div className="reports-utilization">
                      {assetUtilization.length === 0 ? (
                        <div className="reports-empty-state">
                          No utilization data available
                        </div>
                      ) : (
                        assetUtilization.map((asset) => (
                          <div key={asset.category} className="reports-util-item">
                            <div className="reports-util-header">
                              <span className="reports-util-label">{asset.category}</span>
                              <span className="reports-util-pct">
                                {asset.utilization}%
                              </span>
                            </div>
                            <div className="reports-util-bar-bg">
                              <div
                                className="reports-util-bar-fill"
                                style={{ width: `${asset.utilization}%` }}
                              ></div>
                            </div>
                            <div className="reports-util-stats">
                              <span>{asset.inUse} In Use</span>
                              <span>&middot;</span>
                              <span>{asset.available} Available</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === "lifecycle" && (
              <div className="reports-content">
                <div className="reports-card">
                  <div className="reports-card-header">
                    <div>
                      <h3 className="reports-card-title">
                        Laptop Lifecycle Tracking
                      </h3>
                      <p className="reports-card-subtitle">
                        3-year replacement policy monitoring
                      </p>
                    </div>
                    <button
                      className="reports-btn-icon"
                      onClick={() => handleExport("lifecycle")}
                    >
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
                        {lifecycleData.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="reports-empty-state">
                              No lifecycle data available
                            </td>
                          </tr>
                        ) : (
                          lifecycleData.map((item) => {
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
                                    {new Date(item.purchaseDate).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span className="reports-age">
                                    {item.age} months
                                  </span>
                                </td>
                                <td>{item.assignedTo}</td>
                                <td>
                                  <span className="reports-condition">
                                    {item.condition}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="reports-status-badge"
                                    style={{
                                      background: statusColor.bg,
                                      color: statusColor.color,
                                    }}
                                  >
                                    {item.status}
                                  </span>
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
            )}

            {selectedReport === "software" && (
              <div className="reports-content">
                <div className="reports-card">
                  <div className="reports-card-header">
                    <div>
                      <h3 className="reports-card-title">Software License Expiry</h3>
                      <p className="reports-card-subtitle">
                        Renewal alerts (30/60/90 days)
                      </p>
                    </div>
                    <button
                      className="reports-btn-icon"
                      onClick={() => handleExport("software-expiry")}
                    >
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
                        {softwareExpiry.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="reports-empty-state">
                              No software expiry data available
                            </td>
                          </tr>
                        ) : (
                          softwareExpiry.map((item) => {
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
                                    {new Date(item.expiryDate).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className={`reports-days-left ${
                                      item.daysLeft <= 30
                                        ? "reports-days-left--critical"
                                        : item.daysLeft <= 90
                                          ? "reports-days-left--warning"
                                          : ""
                                    }`}
                                  >
                                    {item.daysLeft > 0
                                      ? `${item.daysLeft} days`
                                      : "Expired"}
                                  </span>
                                </td>
                                <td>{item.licenses}</td>
                                <td>
                                  <span className="reports-cost">
                                    ${Number(item.cost || 0).toFixed(2)}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="reports-status-badge"
                                    style={{
                                      background: statusColor.bg,
                                      color: statusColor.color,
                                    }}
                                  >
                                    {item.status}
                                  </span>
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
            )}

            {selectedReport === "forecast" && (
              <div className="reports-content">
                <div className="reports-card">
                  <div className="reports-card-header">
                    <div>
                      <h3 className="reports-card-title">3-Year Growth Forecast</h3>
                      <p className="reports-card-subtitle">
                        5% annual growth projection
                      </p>
                    </div>
                    <button
                      className="reports-btn-icon"
                      onClick={() => handleExport("forecast")}
                    >
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
                    {growthForecast.length === 0 ? (
                      <div className="reports-empty-state">
                        No forecast data available
                      </div>
                    ) : (
                      growthForecast.map((item, idx) => (
                        <div
                          key={item.year}
                          className={`reports-forecast-row ${
                            idx === 0 ? "reports-forecast-row--current" : ""
                          }`}
                        >
                          <div className="reports-forecast-year">
                            {item.year}
                            {idx === 0 && (
                              <span className="reports-forecast-badge">
                                Current
                              </span>
                            )}
                          </div>
                          <div>{item.employees.toLocaleString()}</div>
                          <div>{item.laptops}</div>
                          <div>{item.software}</div>
                          <div className="reports-forecast-cost">
                            Rs {(Number(item.totalCost || 0) / 100000).toFixed(1)}L
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="reports-forecast-note">
                    <AlertTriangle size={16} />
                    <span>
                      Based on 5% annual employee growth rate and current asset
                      allocation ratios
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === "utilization" && (
              <div className="reports-content">
                <div className="reports-grid">
                  <div className="reports-card">
                    <div className="reports-card-header">
                      <div>
                        <h3 className="reports-card-title">Detailed Utilization</h3>
                        <p className="reports-card-subtitle">
                          Asset usage breakdown
                        </p>
                      </div>
                    </div>
                    <div className="reports-utilization-detail">
                      {assetUtilization.length === 0 ? (
                        <div className="reports-empty-state">
                          No utilization data available
                        </div>
                      ) : (
                        assetUtilization.map((asset) => (
                          <div
                            key={asset.category}
                            className="reports-util-detail-card"
                          >
                            <h4 className="reports-util-detail-title">
                              {asset.category}
                            </h4>
                            <div className="reports-util-detail-grid">
                              <div className="reports-util-detail-item">
                                <span className="reports-util-detail-label">
                                  Total
                                </span>
                                <span className="reports-util-detail-value">
                                  {asset.total}
                                </span>
                              </div>
                              <div className="reports-util-detail-item">
                                <span className="reports-util-detail-label">
                                  In Use
                                </span>
                                <span
                                  className="reports-util-detail-value"
                                  style={{ color: "#10b981" }}
                                >
                                  {asset.inUse}
                                </span>
                              </div>
                              <div className="reports-util-detail-item">
                                <span className="reports-util-detail-label">
                                  Available
                                </span>
                                <span
                                  className="reports-util-detail-value"
                                  style={{ color: "#6366f1" }}
                                >
                                  {asset.available}
                                </span>
                              </div>
                              <div className="reports-util-detail-item">
                                <span className="reports-util-detail-label">
                                  Utilization
                                </span>
                                <span
                                  className="reports-util-detail-value"
                                  style={{ color: "#8b5cf6", fontSize: "20px" }}
                                >
                                  {asset.utilization}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="reports-card">
                    <div className="reports-card-header">
                      <div>
                        <h3 className="reports-card-title">Top Departments</h3>
                        <p className="reports-card-subtitle">
                          By total asset count
                        </p>
                      </div>
                    </div>
                    <div className="reports-dept-ranking">
                      {rankedDepartments.length === 0 ? (
                        <div className="reports-empty-state">
                          No department ranking available
                        </div>
                      ) : (
                        rankedDepartments.map((dept, idx) => (
                          <div
                            key={dept.department}
                            className="reports-dept-rank-item"
                          >
                            <span className="reports-dept-rank-num">
                              {idx + 1}
                            </span>
                            <div className="reports-dept-rank-info">
                              <span className="reports-dept-rank-name">
                                {dept.department}
                              </span>
                              <span className="reports-dept-rank-count">
                                {dept.laptops + dept.software} assets
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Report;
