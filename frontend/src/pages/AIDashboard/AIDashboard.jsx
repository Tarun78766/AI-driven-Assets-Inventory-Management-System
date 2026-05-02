import React, { useEffect, useState } from "react";
import "./AIDashboard.css";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import { getHighRiskLaptops, getBrandFailureAnalysis, predictFailure } from "../../API/aiApi";
import { AlertTriangle, RefreshCw, TrendingDown, Zap, Bot } from "lucide-react";

const AIDashboard = () => {
  const [highRiskLaptops, setHighRiskLaptops] = useState([]);
  const [brandAnalysis, setBrandAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predictingId, setPredictingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [laptopsRes, brandRes] = await Promise.all([
        getHighRiskLaptops(),
        getBrandFailureAnalysis()
      ]);
      setHighRiskLaptops(laptopsRes.data || []);
      setBrandAnalysis(brandRes.data || []);
    } catch (error) {
      console.error("Failed to fetch AI data", error);
      setMessage({ text: "Failed to load dashboard data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePredict = async (assetId) => {
    try {
      setPredictingId(assetId);
      setMessage({ text: "", type: "" });
      const res = await predictFailure(assetId);
      
      if (res.skipped) {
         setMessage({ text: res.message, type: "info" });
      } else {
         setMessage({ text: "Prediction updated successfully!", type: "success" });
         await fetchData();
      }
    } catch (error) {
      setMessage({ text: "Prediction failed. Try again.", type: "error" });
    } finally {
      setPredictingId(null);
    }
  };

  const getBadgeClass = (level) => {
    switch (level) {
      case "Low": return "ai-badge-low";
      case "Medium": return "ai-badge-medium";
      case "High": return "ai-badge-high";
      case "Critical": return "ai-badge-critical";
      default: return "ai-badge-default";
    }
  };

  // Calculate highest failure rate for the stat card
  const highestFailureRate = brandAnalysis.length > 0 
    ? Math.max(...brandAnalysis.map(b => b.failureRate)).toFixed(1) 
    : "0.0";

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="ai-dashboard-content">
          
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-icon-box">
                <Bot size={28} />
              </div>
              <div>
                <h1 className="ai-title">AI Predictive Maintenance</h1>
                <p className="ai-subtitle">Advanced hardware failure risk analysis powered by AI.</p>
              </div>
            </div>
            <button className="ai-refresh-btn" onClick={fetchData} disabled={loading}>
              <RefreshCw size={18} className={loading ? "ai-spin" : ""} /> Refresh Data
            </button>
          </div>

          {message.text && (
            <div className={`ai-alert ai-alert-${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Stat Cards */}
          <div className="ai-stats-row">
            <div className="ai-stat-card">
              <div className="ai-stat-icon-wrapper ai-stat-icon-red">
                <AlertTriangle size={24} />
              </div>
              <div className="ai-stat-info">
                <h2>{highRiskLaptops.length}</h2>
                <p>At-Risk Laptops</p>
              </div>
            </div>
            
            <div className="ai-stat-card">
              <div className="ai-stat-icon-wrapper ai-stat-icon-orange">
                <TrendingDown size={24} />
              </div>
              <div className="ai-stat-info">
                <h2>{highestFailureRate}%</h2>
                <p>Highest Brand Failure Rate</p>
              </div>
            </div>

            <div className="ai-stat-card">
              <div className="ai-stat-icon-wrapper ai-stat-icon-blue">
                <Zap size={24} />
              </div>
              <div className="ai-stat-info">
                <h2>Auto-Scan</h2>
                <p>Enabled (Weekly)</p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="ai-main-grid">
            
            {/* Left Column: Assets Table */}
            <div className="ai-card">
              <div className="ai-card-header">
                <h3 className="ai-card-title">High & Critical Risk Assets</h3>
                <span className="ai-count-badge">{highRiskLaptops.length} Assets</span>
              </div>
              <div className="ai-card-content">
                {highRiskLaptops.length === 0 ? (
                  <div className="ai-empty-state">
                    <AlertTriangle size={48} strokeWidth={1} />
                    <p>No high-risk laptops detected.</p>
                  </div>
                ) : (
                  <div className="ai-table-container">
                    <table className="ai-table">
                      <thead>
                        <tr>
                          <th>Asset Name</th>
                          <th>Assigned To</th>
                          <th>Score</th>
                          <th>Risk</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highRiskLaptops.map(laptop => (
                          <tr key={laptop._id}>
                            <td>
                              <strong>{laptop.laptopModelId?.brand} {laptop.laptopModelId?.modelName}</strong>
                              <br /><span className="ai-text-muted">SN: {laptop.serialNumber}</span>
                            </td>
                            <td>
                              {laptop.assignedTo 
                                ? `${laptop.assignedTo.firstName} ${laptop.assignedTo.lastName}`
                                : "Unassigned"}
                            </td>
                            <td><span className="ai-score-pill">{laptop.aiMetrics?.predictionScore}/100</span></td>
                            <td>
                              <span className={`ai-badge ${getBadgeClass(laptop.aiMetrics?.riskLevel)}`}>
                                {laptop.aiMetrics?.riskLevel}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="ai-predict-btn"
                                onClick={() => handlePredict(laptop._id)}
                                disabled={predictingId === laptop._id}
                              >
                                {predictingId === laptop._id ? "..." : "Re-Analyze"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Brand Reliability Table */}
            <div className="ai-card">
              <div className="ai-card-header">
                <h3 className="ai-card-title">Brand Reliability Analysis</h3>
              </div>
              <div className="ai-card-content">
                <table className="ai-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Total Units</th>
                      <th>Total Repairs</th>
                      <th>Failure Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandAnalysis.map((item, idx) => (
                      <tr key={idx}>
                        <td className="ai-brand-cell">{item.brand}</td>
                        <td>{item.totalLaptops}</td>
                        <td>{item.totalRepairs}</td>
                        <td>
                          <div className="ai-failure-rate-cell">
                            <div className={`ai-dot ${item.failureRate > 20 ? 'ai-dot-red' : 'ai-dot-green'}`}></div>
                            {item.failureRate.toFixed(0)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                    {brandAnalysis.length === 0 && (
                      <tr><td colSpan="4" className="ai-empty">No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
