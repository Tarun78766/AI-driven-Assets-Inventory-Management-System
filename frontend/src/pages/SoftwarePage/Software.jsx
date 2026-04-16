import { useState, useMemo, useEffect } from "react";
import "./Software.css";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Key,
  Calendar,
  RefreshCw,
  ChevronDown,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../../components/navBar/NavBar";
import SideBar from "../../components/sideBar/SideBar";
import {
  addSoftware,
  getSoftwares,
  updateSoftware,
  deleteSoftware,
} from "./SoftwareAPI";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

/* ─── Initial Data ─────────────────────── */
const INITIAL_SOFTWARE = [];

const CATEGORIES = [
  "All",
  "Productivity",
  "Design",
  "Communication",
  "Development",
  "Engineering",
  "Project Management",
  "Analytics",
];
const STATUSES = ["All", "Active", "Upcoming", "Critical", "Expired"];
const LIC_TYPES = ["Subscription", "Per Seat", "Perpetual", "Open Source"];
const VENDORS = [
  "Microsoft",
  "Adobe",
  "Salesforce",
  "GitHub Inc.",
  "Zoom",
  "Autodesk",
  "Atlassian",
  "Oracle",
  "Other",
];
const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Design",
  "Marketing",
  "Management",
  "Sales",
  "Analytics",
  "QA",
  "All Departments",
];

const EMPTY_FORM = {
  name: "",
  category: "Productivity",
  licenseType: "Subscription",
  vendor: "",
  totalLicenses: "",
  expiryDate: "",
  renewalStatus: "Active",
  cost: "",
  assignedTo: [],
  version: "",
  notes: "",
};
const isTrackedType = (type) =>
  ["Subscription", "Per Seat", "Licensed"].includes(type);

const usagePercent = (s) => {
  if (!s.totalLicenses || s.totalLicenses === 0) return 0;
  return Math.round((s.usedLicenses / s.totalLicenses) * 100);
};
const daysUntilExpiry = (d) =>
  Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

const statusConfig = {
  Active: { color: "#10B981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle },
  Upcoming: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Clock },
  Critical: {
    color: "#F43F5E",
    bg: "rgba(244,63,94,0.12)",
    icon: AlertTriangle,
  },
  Expired: { color: "#8892A4", bg: "rgba(136,146,164,0.1)", icon: XCircle },
};

const Software = () => {
  const navigate = useNavigate();
  const [software, setSoftware] = useState(INITIAL_SOFTWARE);
  const TRACKED_TYPES = ["Subscription", "Per Seat", "Licensed"];
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    upcoming: 0,
    totalLic: 0,
    usedLic: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const isTracked = TRACKED_TYPES.includes(formData.licenseType);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchSoftwares = async () => {
    setIsLoading(true);
    try {
      const response = await getSoftwares(
        currentPage,
        ITEMS_PER_PAGE,
        search,
        catFilter,
        statusFilter,
      );
      setSoftware(response.data);
      setTotalCount(response.totalCount || 0);
      if (response.stats) setDashboardStats(response.stats);
    } catch (error) {
      console.error("Error fetching softwares:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftwares();
  }, [currentPage, search, catFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + software.length;

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // dashboardStats replaces local useMemo stats.

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Software name is required";
    if (!f.vendor.trim()) e.vendor = "Vendor is required";

    if (Number(f.usedLicenses) > Number(f.totalLicenses))
      e.usedLicenses = "Cannot exceed total";
    const isTracked = TRACKED_TYPES.includes(f.licenseType);

    if (isTracked) {
      if (!f.expiryDate) e.expiryDate = "Expiry date is required";
      if (!f.cost || f.cost < 0) e.cost = "Enter a valid cost";
      if (!f.totalLicenses || f.totalLicenses < 1)
        e.totalLicenses = "Must be at least 1";
    }
    return e;
  };

  const handleAddNew = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      ...item,
      expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
      assignedTo: [...item.assignedTo],
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleViewDetails = (item) => {
    setShowDetail(item);
  };

  const handleDeleteConfirm = (item) => {
    setDeleteConfirm(item);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSoftware(id);
      setDeleteConfirm(null);
      showToast(`Removed successfully`, "error");

      // Attempting to maintain current page if not empty after deletion
      if (software.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchSoftwares();
      }
    } catch (error) {
      showToast("Failed to remove software", "error");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    if (editItem) {
      try {
        await updateSoftware(editItem._id, formData);
        showToast(`"${formData.name}" updated successfully`);
        fetchSoftwares();
      } catch (error) {
        showToast(`"${formData.name}" failed to update`, "error");
      }
    } else {
      try {
        await addSoftware(formData);
        showToast(`"${formData.name}" added successfully`);
        if (currentPage === 1) fetchSoftwares();
        else setCurrentPage(1);
      } catch (error) {
        showToast(`"${formData.name}" failed to add`, "error");
      }
    }
    handleCloseModal();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "licenseType") {
      const isTracked = TRACKED_TYPES.includes(value);

      setFormData((prev) => ({
        ...prev,
        licenseType: value,
        cost: isTracked ? prev.cost : "",
        expiryDate: isTracked ? prev.expiryDate : "",
        totalLicenses: isTracked ? prev.totalLicenses : 1, // 🔥 FIX
      }));

      return;
    }

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDept = (dept) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(dept)
        ? prev.assignedTo.filter((d) => d !== dept)
        : [...prev.assignedTo, dept],
    }));
  };

  return (
    <>
      <Navbar />
      <SideBar />
      <div className="sw-page">
        {toast && (
          <div className={`sw-toast sw-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="sw-header">
          <div className="sw-header-left">
            <div className="sw-header-icon">
              <Package size={26} />
            </div>
            <div>
              <h1 className="sw-title">Software Licenses</h1>
              <p className="sw-subtitle">
                Manage software inventory, licenses &amp; renewals
              </p>
            </div>
          </div>
          <div className="sw-header-right">
            <button className="sw-btn sw-btn--outline">
              <Download size={16} /> Export
            </button>
            <button className="sw-btn sw-btn--primary" onClick={handleAddNew}>
              <Plus size={18} /> Add Software
            </button>
          </div>
        </div>

        <div className="sw-stats">
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
            >
              <Package size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{dashboardStats.total}</div>
              <div className="sw-stat-label">Total Software</div>
            </div>
          </div>
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
            >
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{dashboardStats.active}</div>
              <div className="sw-stat-label">Active Licenses</div>
            </div>
          </div>
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(244,63,94,0.12)", color: "#F43F5E" }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{dashboardStats.critical}</div>
              <div className="sw-stat-label">Critical / Expired</div>
            </div>
          </div>
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{dashboardStats.upcoming}</div>
              <div className="sw-stat-label">Upcoming Renewals</div>
            </div>
          </div>
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}
            >
              <Key size={22} />
            </div>
            <div>
              <div className="sw-stat-value">
                {dashboardStats.usedLic}
                <span>/{dashboardStats.totalLic}</span>
              </div>
              <div className="sw-stat-label">Licenses Used</div>
            </div>
          </div>
        </div>

        <div className="sw-filters">
          <div className="sw-search-wrap">
            <Search size={17} className="sw-search-icon" />
            <input
              className="sw-search"
              placeholder="Search software or vendor..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="sw-search-clear"
                onClick={() => handleSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="sw-filter-group">
            <span className="sw-filter-label">Category:</span>
            <div className="sw-select-wrap">
              <select
                className="sw-select"
                value={catFilter}
                onChange={(e) =>
                  handleFilterChange(setCatFilter)(e.target.value)
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sw-filter-group">
            <span className="sw-filter-label">Status:</span>
            <div className="sw-select-wrap">
              <select
                className="sw-select"
                value={statusFilter}
                onChange={(e) =>
                  handleFilterChange(setStatusFilter)(e.target.value)
                }
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="sw-result-count">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="sw-table-wrap">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Software</th>
                <th>Category</th>
                <th>License Type</th>
                <th>Licenses</th>
                <th>Usage</th>
                <th>Expiry</th>
                <th>Renewal</th>
                <th>Cost/mo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="sw-empty">
                    <RefreshCw
                      size={40}
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#6366f1",
                        marginBottom: "10px",
                        opacity: 1,
                      }}
                    />
                    <p>Fetching software...</p>
                  </td>
                </tr>
              ) : software.length === 0 ? (
                <tr>
                  <td colSpan="9" className="sw-empty">
                    <Package size={48} strokeWidth={1.2} />
                    <p>No software found</p>
                    <span>Try adjusting your filters</span>
                  </td>
                </tr>
              ) : (
                software.map((item) => {
                  const pct = usagePercent(item);
                  const days = daysUntilExpiry(item.expiryDate);
                  const cfg = statusConfig[item.renewalStatus];
                  const Icon = cfg.icon;

                  return (
                    <tr key={item._id} className="sw-row">
                      <td>
                        <div className="sw-name-cell">
                          <div className="sw-name-avatar">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <div className="sw-name">{item.name}</div>
                            <div className="sw-vendor">
                              {item.vendor} · v{item.version}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="sw-category-badge">
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <div className="sw-lic-type">
                          <Key size={13} />
                          <span>{item.licenseType}</span>
                        </div>
                      </td>
                      <td>
                        <div className="sw-lic-count">
                          <span className="sw-lic-used">
                            {item.usedLicenses}
                          </span>
                          <span className="sw-lic-sep">/</span>
                          <span className="sw-lic-total">
                            {item.totalLicenses}
                          </span>
                        </div>
                      </td>
                      <td>
                        {isTrackedType(item.licenseType) ? (
                          <div className="sw-usage-wrap">
                            <div className="sw-usage-bar-bg">
                              <div
                                className="sw-usage-bar-fill"
                                style={{
                                  width: `${pct}%`,
                                  background:
                                    pct >= 95
                                      ? "#F43F5E"
                                      : pct >= 80
                                        ? "#F59E0B"
                                        : "#6366F1",
                                }}
                              />
                            </div>
                            <span className="sw-usage-pct">{pct}%</span>
                          </div>
                        ) : (
                          <span className="sw-na">N/A</span>
                        )}
                      </td>
                      <td>
                        <div className="sw-expiry">
                          <Calendar size={13} />
                          <span>
                            {new Date(item.expiryDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {days <= 90 && days > 0 && (
                          <div
                            className="sw-days-left"
                            style={{
                              color: days <= 30 ? "#F43F5E" : "#F59E0B",
                            }}
                          >
                            {days}d left
                          </div>
                        )}
                        {days <= 0 && (
                          <div
                            className="sw-days-left"
                            style={{ color: "#8892A4" }}
                          >
                            Expired
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="sw-status-badge"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <Icon size={12} />
                          {item.renewalStatus}
                        </span>
                      </td>
                      <td>
                        <span className="sw-cost">${item.cost.toFixed(2)}</span>
                      </td>
                      <td>
                        <div className="sw-actions">
                          <button
                            className="sw-action-btn sw-action-btn--view"
                            title="View details"
                            onClick={() => handleViewDetails(item)}
                          >
                            <Eye size={15} />
                          </button>

                          {/* ✅ Only show for tracked license types */}
                          {TRACKED_TYPES.includes(item.licenseType) && (
                            <button
                              className="sw-action-btn sw-action-btn--seats"
                              title="View License Seats"
                              onClick={() =>
                                navigate(
                                  `/software/individual?softwareId=${item._id}&softwareName=${item.name}`,
                                )
                              }
                            >
                              <Key size={15} />
                            </button>
                          )}

                          <button
                            className="sw-action-btn sw-action-btn--edit"
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="sw-action-btn sw-action-btn--delete"
                            title="Delete"
                            onClick={() => handleDeleteConfirm(item)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {totalCount > 0 && (
          <div className="sw-pagination">
            <p className="sw-pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of{" "}
              {totalCount} software
            </p>
            <div className="sw-pagination-buttons">
              <button
                className="sw-btn-page sw-btn-page-nav"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="sw-pagination-ellipsis"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`sw-btn-page ${currentPage === page ? "sw-btn-page--active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className="sw-btn-page sw-btn-page-nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <div className="sw-modal-overlay" onClick={handleCloseModal}>
            <div className="sw-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sw-modal-header">
                <div className="sw-modal-title-wrap">
                  <div className="sw-modal-icon">
                    <Package size={22} />
                  </div>
                  <div>
                    <h2 className="sw-modal-title">
                      {editItem ? "Edit Software" : "Add New Software"}
                    </h2>
                    <p className="sw-modal-sub">
                      {editItem
                        ? "Update license details"
                        : "Register a new software license"}
                    </p>
                  </div>
                </div>
                <button className="sw-modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="sw-modal-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="sw-form-row">
                    <div className="sw-form-group sw-form-group--full">
                      <label>
                        Software Name{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g. Microsoft Office 365"
                        className={
                          formErrors.name
                            ? "sw-input sw-input--error"
                            : "sw-input"
                        }
                      />
                      {formErrors.name && (
                        <span className="sw-field-error">
                          {formErrors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>
                        Vendor <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="sw-select-wrap">
                        <select
                          name="vendor"
                          value={formData.vendor}
                          onChange={handleFormChange}
                          className={
                            formErrors.vendor
                              ? "sw-input sw-input--error"
                              : "sw-input"
                          }
                        >
                          <option value="">Select vendor</option>
                          {VENDORS.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      {formErrors.vendor && (
                        <span className="sw-field-error">
                          {formErrors.vendor}
                        </span>
                      )}
                    </div>
                    <div className="sw-form-group">
                      <label>Version</label>
                      <input
                        name="version"
                        value={formData.version}
                        onChange={handleFormChange}
                        placeholder="e.g. 2024.1"
                        className="sw-input"
                      />
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>Category</label>
                      <div className="sw-select-wrap">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="sw-input"
                        >
                          {CATEGORIES.filter((c) => c !== "All").map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="sw-form-group">
                      <label>License Type</label>
                      <div className="sw-select-wrap">
                        <select
                          name="licenseType"
                          value={formData.licenseType}
                          onChange={handleFormChange}
                          className="sw-input"
                        >
                          {LIC_TYPES.map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>
                        Total Licenses{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="totalLicenses"
                        value={isTracked ? formData.totalLicenses : 1}
                        onChange={handleFormChange}
                        placeholder="e.g. 100"
                        min={isTracked ? "1" : "0"}
                        disabled={!isTracked}
                        className={`
                          sw-input
                          ${formErrors.totalLicenses ? "sw-input--error" : ""}
                          ${!isTracked ? "sw-input--default" : ""}
                        `}
                      />
                      {formErrors.totalLicenses && (
                        <span className="sw-field-error">
                          {formErrors.totalLicenses}
                        </span>
                      )}
                    </div>
                    <div className="sw-form-group">
                      <label>
                        Cost / Month ($){" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        step="0.01"
                        onChange={handleFormChange}
                        disabled={!isTracked}
                        placeholder="e.g. 12.50"
                        min="0"
                        className={`
                          sw-input
                          ${formErrors.cost ? "sw-input--error" : ""}
                          ${!isTracked ? "sw-input--default" : ""}
                        `}
                      />
                      {formErrors.cost && (
                        <span className="sw-field-error">
                          {formErrors.cost}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>
                        Expiry Date <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleFormChange}
                        disabled={!isTracked}
                        className={`
                          sw-input
                          ${formErrors.expiryDate ? "sw-input--error" : ""}
                          ${!isTracked ? "sw-input--default" : ""}
                        `}
                      />
                      {formErrors.expiryDate && (
                        <span className="sw-field-error">
                          {formErrors.expiryDate}
                        </span>
                      )}
                    </div>
                    <div className="sw-form-group">
                      <label>Renewal Status</label>
                      <div className="sw-select-wrap">
                        <select
                          name="renewalStatus"
                          value={formData.renewalStatus}
                          onChange={handleFormChange}
                          className="sw-input"
                        >
                          {STATUSES.filter((s) => s !== "All").map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="sw-form-group sw-form-group--full">
                    <label>Assigned Departments</label>
                    <div className="sw-dept-grid">
                      {DEPARTMENTS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDept(d)}
                          className={`sw-dept-chip ${formData.assignedTo.includes(d) ? "sw-dept-chip--active" : ""}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sw-form-group sw-form-group--full">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="Additional notes about this license..."
                      className="sw-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="sw-modal-footer">
                    <button
                      type="button"
                      className="sw-btn sw-btn--ghost"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="sw-btn sw-btn--primary">
                      {editItem ? (
                        <>
                          <RefreshCw size={16} /> Update
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Add Software
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showDetail && (
          <div className="sw-modal-overlay" onClick={() => setShowDetail(null)}>
            <div
              className="sw-modal sw-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sw-modal-header">
                <div className="sw-modal-title-wrap">
                  <div className="sw-name-avatar sw-name-avatar--lg">
                    {showDetail.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="sw-modal-title">{showDetail.name}</h2>
                    <p className="sw-modal-sub">
                      {showDetail.vendor} · Version {showDetail.version}
                    </p>
                  </div>
                </div>
                <button
                  className="sw-modal-close"
                  onClick={() => setShowDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="sw-modal-body">
                <div className="sw-detail-grid">
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Category</span>
                    <span className="sw-detail-value">
                      {showDetail.category}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">License Type</span>
                    <span className="sw-detail-value">
                      {showDetail.licenseType}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Total Licenses</span>
                    <span className="sw-detail-value">
                      {showDetail.totalLicenses}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Used Licenses</span>
                    <span className="sw-detail-value">
                      {showDetail.usedLicenses}
                      <span
                        style={{
                          color: "#6366F1",
                          fontSize: "13px",
                          marginLeft: 6,
                        }}
                      >
                        ({usagePercent(showDetail)}%)
                      </span>
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Expiry Date</span>
                    <span className="sw-detail-value">
                      {new Date(showDetail.expiryDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Monthly Cost</span>
                    <span className="sw-detail-value">
                      ${showDetail.cost.toFixed(2)} / license
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Renewal Status</span>
                    <span
                      className="sw-status-badge"
                      style={{
                        background: statusConfig[showDetail.renewalStatus].bg,
                        color: statusConfig[showDetail.renewalStatus].color,
                      }}
                    >
                      {showDetail.renewalStatus}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Total Monthly Cost</span>
                    <span
                      className="sw-detail-value"
                      style={{ color: "#6366F1", fontWeight: 700 }}
                    >
                      ${(showDetail.cost * showDetail.totalLicenses).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="sw-detail-usage">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      License Usage
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#6366F1",
                        fontWeight: 700,
                      }}
                    >
                      {usagePercent(showDetail)}%
                    </span>
                  </div>
                  <div
                    className="sw-usage-bar-bg"
                    style={{ height: 10, borderRadius: 8 }}
                  >
                    <div
                      className="sw-usage-bar-fill"
                      style={{
                        width: `${usagePercent(showDetail)}%`,
                        height: "100%",
                        borderRadius: 8,
                        background:
                          usagePercent(showDetail) >= 95
                            ? "#F43F5E"
                            : usagePercent(showDetail) >= 80
                              ? "#F59E0B"
                              : "#6366F1",
                      }}
                    />
                  </div>
                </div>

                <div className="sw-detail-section">
                  <span className="sw-detail-label">Assigned Departments</span>
                  <div className="sw-dept-tags">
                    {showDetail.assignedTo.map((d) => (
                      <span key={d} className="sw-dept-tag">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {showDetail.notes && (
                  <div className="sw-detail-section">
                    <span className="sw-detail-label">Notes</span>
                    <p className="sw-detail-notes">{showDetail.notes}</p>
                  </div>
                )}

                <div className="sw-modal-footer">
                  <button
                    className="sw-btn sw-btn--ghost"
                    onClick={() => setShowDetail(null)}
                  >
                    Close
                  </button>
                  <button
                    className="sw-btn sw-btn--primary"
                    onClick={() => {
                      setShowDetail(null);
                      handleEdit(showDetail);
                    }}
                  >
                    <Edit2 size={15} /> Edit License
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div
            className="sw-modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="sw-modal sw-modal--confirm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sw-confirm-icon">
                <Trash2 size={28} color="#F43F5E" />
              </div>
              <h3 className="sw-confirm-title">Delete Software?</h3>
              <p className="sw-confirm-text">
                Are you sure you want to remove{" "}
                <strong>"{deleteConfirm.name}"</strong>? This action cannot be
                undone.
              </p>
              <div className="sw-confirm-actions">
                <button
                  className="sw-btn sw-btn--ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="sw-btn sw-btn--danger"
                  onClick={() => handleDelete(deleteConfirm._id)}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Software;
