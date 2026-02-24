import { useState, useMemo } from "react";
import "./Assignments.css";
import {
  Search,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Package,
  User,
  Calendar,
  RotateCcw,
  TrendingUp,
  Download,
  AlertTriangle,
} from "lucide-react";

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";

const ITEMS_PER_PAGE = 10;

/* ─── Initial Data ─────────────────────── */
const INITIAL_ASSIGNMENTS = [
  { id: 1, employeeId: 1, employeeName: "Rajesh Kumar", assetType: "Laptop", assetName: "Dell XPS 15", assetId: 101, assignDate: "2024-01-15", returnDate: null, status: "Active", assignedBy: "Admin" },
  { id: 2, employeeId: 1, employeeName: "Rajesh Kumar", assetType: "Software", assetName: "Microsoft Office 365", assetId: 201, assignDate: "2024-01-15", returnDate: null, status: "Active", assignedBy: "Admin" },
  { id: 3, employeeId: 2, employeeName: "Priya Sharma", assetType: "Laptop", assetName: 'MacBook Pro 16"', assetId: 102, assignDate: "2023-11-20", returnDate: null, status: "Active", assignedBy: "IT Ops" },
  { id: 4, employeeId: 2, employeeName: "Priya Sharma", assetType: "Software", assetName: "GitHub Enterprise", assetId: 202, assignDate: "2023-11-20", returnDate: null, status: "Active", assignedBy: "IT Ops" },
  { id: 5, employeeId: 3, employeeName: "Amit Patel", assetType: "Laptop", assetName: "HP EliteBook 840 G9", assetId: 103, assignDate: "2024-02-10", returnDate: null, status: "Active", assignedBy: "Admin" },
  { id: 6, employeeId: 3, employeeName: "Amit Patel", assetType: "Software", assetName: "Adobe Creative Suite", assetId: 203, assignDate: "2024-02-10", returnDate: null, status: "Active", assignedBy: "Admin" },
  { id: 7, employeeId: 7, employeeName: "Rahul Verma", assetType: "Laptop", assetName: "Lenovo ThinkPad X1", assetId: 104, assignDate: "2023-09-18", returnDate: "2024-12-20", status: "Returned", assignedBy: "IT Ops" },
  { id: 8, employeeId: 4, employeeName: "Sneha Reddy", assetType: "Software", assetName: "Jira Software", assetId: 204, assignDate: "2024-01-05", returnDate: null, status: "Active", assignedBy: "Admin" },
];

// Mock data for dropdowns
const EMPLOYEES = [
  { id: 1, name: "Rajesh Kumar", department: "IT Operations" },
  { id: 2, name: "Priya Sharma", department: "Engineering" },
  { id: 3, name: "Amit Patel", department: "Design" },
  { id: 4, name: "Sneha Reddy", department: "IT Operations" },
  { id: 5, name: "Vikram Singh", department: "Sales" },
  { id: 6, name: "Ananya Iyer", department: "Marketing" },
];

const LAPTOPS = [
  { id: 101, name: "Dell XPS 15", serialNumber: "DXS-2024-001", available: true },
  { id: 105, name: 'MacBook Pro 14"', serialNumber: "MBP-2024-002", available: true },
  { id: 106, name: "HP EliteBook 840", serialNumber: "HPE-2024-003", available: true },
  { id: 107, name: "Lenovo ThinkPad X1", serialNumber: "LTP-2024-004", available: true },
];

const SOFTWARE = [
  { id: 201, name: "Microsoft Office 365", available: 22 },
  { id: 205, name: "Slack Business", available: 158 },
  { id: 206, name: "Zoom Pro", available: 66 },
  { id: 207, name: "Tableau Desktop", available: 3 },
];

const STATUSES = ["All", "Active", "Returned"];
const ASSET_TYPES = ["All", "Laptop", "Software"];

const EMPTY_FORM = {
  employeeId: "",
  assetType: "Laptop",
  assetId: "",
  assignDate: new Date().toISOString().split("T")[0],
};

const Assignments = () => {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const filtered = useMemo(() => {
    return assignments.filter((assign) => {
      const matchSearch =
        assign.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        assign.assetName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || assign.status === statusFilter;
      const matchType = typeFilter === "All" || assign.assetType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [assignments, search, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAssignments = filtered.slice(startIndex, endIndex);

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

  const stats = useMemo(() => ({
    total: assignments.length,
    active: assignments.filter((a) => a.status === "Active").length,
    returned: assignments.filter((a) => a.status === "Returned").length,
    laptops: assignments.filter((a) => a.assetType === "Laptop" && a.status === "Active").length,
    software: assignments.filter((a) => a.assetType === "Software" && a.status === "Active").length,
  }), [assignments]);

  const validate = (f) => {
    const e = {};
    if (!f.employeeId) e.employeeId = "Employee is required";
    if (!f.assetId) e.assetId = "Asset is required";
    if (!f.assignDate) e.assignDate = "Assignment date is required";
    return e;
  };

  const handleAddNew = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const handleViewDetails = (item) => {
    setShowDetail(item);
  };

  const handleReturn = (assignment) => {
    if (window.confirm(`Return ${assignment.assetName} from ${assignment.employeeName}?`)) {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignment.id
            ? { ...a, status: "Returned", returnDate: new Date().toISOString().split("T")[0] }
            : a
        )
      );
      showToast(`Asset returned successfully`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    const employee = EMPLOYEES.find((emp) => emp.id === Number(formData.employeeId));
    const asset =
      formData.assetType === "Laptop"
        ? LAPTOPS.find((l) => l.id === Number(formData.assetId))
        : SOFTWARE.find((s) => s.id === Number(formData.assetId));

    const newAssignment = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      assetType: formData.assetType,
      assetName: asset.name,
      assetId: asset.id,
      assignDate: formData.assignDate,
      returnDate: null,
      status: "Active",
      assignedBy: "Current User",
    };

    setAssignments((prev) => [newAssignment, ...prev]);
    showToast(`${asset.name} assigned to ${employee.name}`);
    handleCloseModal();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Reset asset selection when asset type changes
    if (name === "assetType") {
      setFormData((prev) => ({ ...prev, [name]: value, assetId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getAssetTypeColor = (type) => {
    return type === "Laptop"
      ? { bg: "#e0e7ff", color: "#6366f1" }
      : { bg: "#fce7f3", color: "#ec4899" };
  };

  const getAvailableAssets = () => {
    return formData.assetType === "Laptop" ? LAPTOPS : SOFTWARE;
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="assign-page">
        {toast && (
          <div className={`assign-toast assign-toast--${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="assign-header">
          <div className="assign-header-left">
            <div className="assign-header-icon">
              <ClipboardList size={26} />
            </div>
            <div>
              <h1 className="assign-title">Asset Assignments</h1>
              <p className="assign-subtitle">Manage laptop and software assignments</p>
            </div>
          </div>
          <div className="assign-header-right">
            <button className="assign-btn assign-btn--outline">
              <Download size={16} /> Export
            </button>
            <button className="assign-btn assign-btn--primary" onClick={handleAddNew}>
              <Plus size={18} /> New Assignment
            </button>
          </div>
        </div>

        <div className="assign-stats">
          <div className="assign-stat-card">
            <div className="assign-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}>
              <ClipboardList size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.total}</div>
              <div className="assign-stat-label">Total Assignments</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div className="assign-stat-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.active}</div>
              <div className="assign-stat-label">Active</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div className="assign-stat-icon" style={{ background: "rgba(136,146,164,0.12)", color: "#8892A4" }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.returned}</div>
              <div className="assign-stat-label">Returned</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div className="assign-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
              <Laptop size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.laptops}</div>
              <div className="assign-stat-label">Laptops Assigned</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div className="assign-stat-icon" style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}>
              <Package size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.software}</div>
              <div className="assign-stat-label">Software Assigned</div>
            </div>
          </div>
        </div>

        <div className="assign-filters">
          <div className="assign-search-wrap">
            <Search size={17} className="assign-search-icon" />
            <input
              className="assign-search"
              placeholder="Search by employee or asset name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button className="assign-search-clear" onClick={() => handleSearch("")}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="assign-filter-group">
            <Filter size={15} className="assign-filter-icon" />
            <select className="assign-select" value={typeFilter} onChange={(e) => handleFilterChange(setTypeFilter)(e.target.value)}>
              {ASSET_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="assign-filter-group">
            <select className="assign-select" value={statusFilter} onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <span className="assign-result-count">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="assign-table-wrap">
          <table className="assign-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Asset Type</th>
                <th>Asset Name</th>
                <th>Assigned Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Assigned By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="assign-empty">
                    <ClipboardList size={48} strokeWidth={1.2} />
                    <p>No assignments found</p>
                    <span>Try adjusting your filters</span>
                  </td>
                </tr>
              ) : (
                paginatedAssignments.map((assign) => {
                  const typeColor = getAssetTypeColor(assign.assetType);
                  return (
                    <tr key={assign.id} className="assign-row">
                      <td>
                        <div className="assign-employee-cell">
                          <div className="assign-avatar">{assign.employeeName.charAt(0)}</div>
                          <div className="assign-employee-name">{assign.employeeName}</div>
                        </div>
                      </td>
                      <td>
                        <span className="assign-type-badge" style={{ background: typeColor.bg, color: typeColor.color }}>
                          {assign.assetType === "Laptop" ? <Laptop size={13} /> : <Package size={13} />}
                          {assign.assetType}
                        </span>
                      </td>
                      <td>
                        <span className="assign-asset-name">{assign.assetName}</span>
                      </td>
                      <td>
                        <div className="assign-date">
                          <Calendar size={13} />
                          {new Date(assign.assignDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td>
                        {assign.returnDate ? (
                          <div className="assign-date">
                            <Calendar size={13} />
                            {new Date(assign.returnDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        ) : (
                          <span className="assign-no-date">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`assign-status-badge assign-status-badge--${assign.status.toLowerCase()}`}>
                          {assign.status}
                        </span>
                      </td>
                      <td>
                        <div className="assign-assigned-by">
                          <User size={13} />
                          {assign.assignedBy}
                        </div>
                      </td>
                      <td>
                        <div className="assign-actions">
                          <button className="assign-action-btn assign-action-btn--view" title="View details" onClick={() => handleViewDetails(assign)}>
                            <Eye size={15} />
                          </button>
                          {assign.status === "Active" && (
                            <button className="assign-action-btn assign-action-btn--return" title="Return asset" onClick={() => handleReturn(assign)}>
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="assign-pagination">
            <p className="assign-pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} assignments
            </p>
            <div className="assign-pagination-buttons">
              <button className="assign-btn-page assign-btn-page-nav" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft size={16} />
                Previous
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="assign-pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button key={page} className={`assign-btn-page ${currentPage === page ? "assign-btn-page--active" : ""}`} onClick={() => handlePageChange(page)}>
                    {page}
                  </button>
                )
              )}

              <button className="assign-btn-page assign-btn-page-nav" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Create Assignment Modal */}
        {showModal && (
          <div className="assign-modal-overlay" onClick={handleCloseModal}>
            <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
              <div className="assign-modal-header">
                <div className="assign-modal-title-wrap">
                  <div className="assign-modal-icon">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h2 className="assign-modal-title">New Assignment</h2>
                    <p className="assign-modal-sub">Assign a laptop or software to an employee</p>
                  </div>
                </div>
                <button className="assign-modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="assign-modal-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="assign-form-row">
                    <div className="assign-form-group assign-form-group--full">
                      <label>
                        Employee <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="assign-select-wrap">
                        <select name="employeeId" value={formData.employeeId} onChange={handleFormChange} className={formErrors.employeeId ? "assign-input assign-input--error" : "assign-input"}>
                          <option value="">Select employee</option>
                          {EMPLOYEES.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} - {emp.department}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.employeeId && <span className="assign-field-error">{formErrors.employeeId}</span>}
                    </div>
                  </div>

                  <div className="assign-form-row">
                    <div className="assign-form-group">
                      <label>Asset Type</label>
                      <div className="assign-radio-group">
                        <label className={`assign-radio-option ${formData.assetType === "Laptop" ? "assign-radio-option--active" : ""}`}>
                          <input type="radio" name="assetType" value="Laptop" checked={formData.assetType === "Laptop"} onChange={handleFormChange} />
                          <Laptop size={18} />
                          <span>Laptop</span>
                        </label>
                        <label className={`assign-radio-option ${formData.assetType === "Software" ? "assign-radio-option--active" : ""}`}>
                          <input type="radio" name="assetType" value="Software" checked={formData.assetType === "Software"} onChange={handleFormChange} />
                          <Package size={18} />
                          <span>Software</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="assign-form-row">
                    <div className="assign-form-group assign-form-group--full">
                      <label>
                        {formData.assetType} <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="assign-select-wrap">
                        <select name="assetId" value={formData.assetId} onChange={handleFormChange} className={formErrors.assetId ? "assign-input assign-input--error" : "assign-input"}>
                          <option value="">Select {formData.assetType.toLowerCase()}</option>
                          {getAvailableAssets().map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name}
                              {formData.assetType === "Laptop" ? ` (${asset.serialNumber})` : ` (${asset.available} available)`}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.assetId && <span className="assign-field-error">{formErrors.assetId}</span>}
                    </div>
                  </div>

                  <div className="assign-form-row">
                    <div className="assign-form-group">
                      <label>
                        Assignment Date <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input type="date" name="assignDate" value={formData.assignDate} onChange={handleFormChange} className={formErrors.assignDate ? "assign-input assign-input--error" : "assign-input"} />
                      {formErrors.assignDate && <span className="assign-field-error">{formErrors.assignDate}</span>}
                    </div>
                  </div>

                  <div className="assign-modal-footer">
                    <button type="button" className="assign-btn assign-btn--ghost" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="assign-btn assign-btn--primary">
                      <CheckCircle size={16} /> Create Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && (
          <div className="assign-modal-overlay" onClick={() => setShowDetail(null)}>
            <div className="assign-modal assign-modal--detail" onClick={(e) => e.stopPropagation()}>
              <div className="assign-modal-header">
                <div className="assign-modal-title-wrap">
                  <div className="assign-avatar assign-avatar--lg">{showDetail.employeeName.charAt(0)}</div>
                  <div>
                    <h2 className="assign-modal-title">Assignment Details</h2>
                    <p className="assign-modal-sub">
                      {showDetail.employeeName} · {showDetail.assetName}
                    </p>
                  </div>
                </div>
                <button className="assign-modal-close" onClick={() => setShowDetail(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="assign-modal-body">
                <div className="assign-detail-grid">
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Employee</span>
                    <span className="assign-detail-value">
                      <User size={14} style={{ marginRight: 6 }} />
                      {showDetail.employeeName}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Asset Type</span>
                    <span className="assign-detail-value">
                      {showDetail.assetType === "Laptop" ? <Laptop size={14} style={{ marginRight: 6 }} /> : <Package size={14} style={{ marginRight: 6 }} />}
                      {showDetail.assetType}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Asset Name</span>
                    <span className="assign-detail-value">{showDetail.assetName}</span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Asset ID</span>
                    <span className="assign-detail-value">#{showDetail.assetId}</span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Assigned Date</span>
                    <span className="assign-detail-value">
                      <Calendar size={14} style={{ marginRight: 6 }} />
                      {new Date(showDetail.assignDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Return Date</span>
                    <span className="assign-detail-value">
                      {showDetail.returnDate ? (
                        <>
                          <Calendar size={14} style={{ marginRight: 6 }} />
                          {new Date(showDetail.returnDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </>
                      ) : (
                        "Not returned"
                      )}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Status</span>
                    <span className={`assign-status-badge assign-status-badge--${showDetail.status.toLowerCase()}`}>{showDetail.status}</span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Assigned By</span>
                    <span className="assign-detail-value">
                      <User size={14} style={{ marginRight: 6 }} />
                      {showDetail.assignedBy}
                    </span>
                  </div>
                </div>
              </div>

              <div className="assign-modal-footer">
                <button className="assign-btn assign-btn--ghost" onClick={() => setShowDetail(null)}>
                  Close
                </button>
                {showDetail.status === "Active" && (
                  <button
                    className="assign-btn assign-btn--danger"
                    onClick={() => {
                      setShowDetail(null);
                      handleReturn(showDetail);
                    }}
                  >
                    <RotateCcw size={15} /> Return Asset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Assignments;