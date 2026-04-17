import { useState, useEffect } from "react";
import "../Software.css";
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
  Key,
  Calendar,
  RefreshCw,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import Navbar from "../../../components/navBar/NavBar";
import SideBar from "../../../components/sideBar/SideBar";
import {
  getIndividualSeats,
  addIndividualSeat,
  updateIndividualSeat,
  deleteIndividualSeat,
  getSoftwareDropdown,
} from "./IndividualSoftwareAPI";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const STATUSES = ["All", "Available", "Assigned", "Revoked", "Expired"];

const EMPTY_FORM = {
  softwareModelId: "",
  licenseKeyOrSeatName: "",
  activationDate: "",
  expiryDate: "",
};

const statusConfig = {
  Available: {
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
    icon: CheckCircle,
  },
  Assigned: { color: "#6366F1", bg: "rgba(99,102,241,0.12)", icon: Clock },
  Revoked: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: XCircle },
  Expired: { color: "#8892A4", bg: "rgba(136,146,164,0.1)", icon: AlertCircle },
};

const IndividualSoftware = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const softwareIdFromNav = params.get("softwareId");
  const softwareNameFromNav = params.get("softwareName");

  // Pre-set search with software name if navigated from Software page
  const [search, setSearch] = useState(softwareNameFromNav || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    softwareNameFromNav || "",
  );
  const [seats, setSeats] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    expired: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [softwareDropdown, setSoftwareDropdown] = useState([]); // for the add modal dropdown

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch seats
  const fetchSeats = async () => {
    setIsLoading(true);
    try {
      const response = await getIndividualSeats(
        currentPage,
        ITEMS_PER_PAGE,
        debouncedSearch,
        statusFilter,
      );
      setSeats(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
      if (response.stats) setStats(response.stats);
    } catch (error) {
      console.error("Error fetching seats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch software dropdown for Add modal
  const fetchSoftwareDropdown = async () => {
    try {
      const response = await getSoftwareDropdown();
      setSoftwareDropdown(response.data);
    } catch (error) {
      console.error("Error fetching software dropdown:", error);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [currentPage, debouncedSearch, statusFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + seats.length;

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
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

  const validate = (f) => {
    const e = {};
    if (!f.softwareModelId) e.softwareModelId = "Software is required";
    if (!f.licenseKeyOrSeatName.trim())
      e.licenseKeyOrSeatName = "License key or seat name is required";
    return e;
  };

  const handleAddNew = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    fetchSoftwareDropdown(); // load dropdown when modal opens
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      softwareModelId: item.softwareModelId,
      licenseKeyOrSeatName: item.licenseKeyOrSeatName,
      activationDate: item.activationDate
        ? item.activationDate.split("T")[0]
        : "",
      expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
    });
    setFormErrors({});
    fetchSoftwareDropdown();
    setShowModal(true);
  };

  const handleViewDetails = (item) => setShowDetail(item);
  const handleDeleteConfirm = (item) => setDeleteConfirm(item);

  const handleDelete = async (id) => {
    try {
      await deleteIndividualSeat(id);
      await fetchSeats();
      setDeleteConfirm(null);
      showToast("License seat removed", "error");
    } catch (error) {
      showToast("Failed to remove seat", "error");
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
    try {
      if (editItem) {
        await updateIndividualSeat(editItem._id, formData);
        showToast(`"${formData.licenseKeyOrSeatName}" updated successfully`);
      } else {
        await addIndividualSeat(formData);
        showToast(`"${formData.licenseKeyOrSeatName}" added successfully`);
      }
      await fetchSeats();
      handleCloseModal();
    } catch (error) {
      showToast("Failed to save seat", "error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
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

        {/* Header */}
        <div className="sw-header">
          <div className="sw-header-left">
            <div className="sw-header-icon">
              <Key size={26} />
            </div>
            <div>
              <h1 className="sw-title">Individual License Seats</h1>
              <p className="sw-subtitle">
                Track specific license keys and seat assignments
              </p>
            </div>
          </div>
          <div className="sw-header-right">
            <button
              className="sw-btn sw-btn--outline"
              onClick={() => navigate("/software")}
            >
              <ChevronLeft size={16} /> Back to Models
            </button>
            <button className="sw-btn sw-btn--primary" onClick={handleAddNew}>
              <Plus size={18} /> Add Seat
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="sw-stats">
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
            >
              <Key size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{stats.total}</div>
              <div className="sw-stat-label">Total Seats</div>
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
              <div className="sw-stat-value">{stats.available}</div>
              <div className="sw-stat-label">Available</div>
            </div>
          </div>
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{stats.assigned}</div>
              <div className="sw-stat-label">Assigned</div>
            </div>
          </div>
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(136,146,164,0.1)", color: "#8892A4" }}
            >
              <XCircle size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{stats.expired}</div>
              <div className="sw-stat-label">Expired / Revoked</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sw-filters">
          <div className="sw-search-wrap">
            <Search size={17} className="sw-search-icon" />
            <input
              className="sw-search"
              placeholder="Search by key, seat name or software..."
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
            <Filter size={15} className="sw-filter-icon" />
            <select
              className="sw-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <span className="sw-result-count">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="sw-table-wrap">
          <table className="sw-table">
            <thead>
              <tr>
                <th>License Key / Seat</th>
                <th>Software</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Activation Date</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="sw-empty">
                    <RefreshCw
                      size={40}
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#6366f1",
                        marginBottom: "10px",
                      }}
                    />
                    <p>Fetching seats...</p>
                  </td>
                </tr>
              ) : seats.length === 0 ? (
                <tr>
                  <td colSpan="7" className="sw-empty">
                    <Key size={48} strokeWidth={1.2} />
                    <p>No license seats found</p>
                    <span>Try adjusting your filters</span>
                  </td>
                </tr>
              ) : (
                seats.map((seat) => {
                  const cfg =
                    statusConfig[seat.status] || statusConfig.Available;
                  const Icon = cfg.icon;
                  return (
                    <tr key={seat._id} className="sw-row">
                      <td>
                        <div className="sw-name-cell">
                          <div className="sw-name-avatar">
                            {seat.licenseKeyOrSeatName.charAt(0)}
                          </div>
                          <div>
                            <div className="sw-name">
                              {seat.licenseKeyOrSeatName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="sw-lic-type">
                          <Package size={13} />
                          <span>{seat.softwareName}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="sw-status-badge"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <Icon size={12} />
                          {seat.status}
                        </span>
                      </td>
                      <td>
                        {seat.assignedTo ? (
                          <span className="sw-vendor">
                            {console.log(seat)}
                            {seat.assignedTo?.name || seat.assignedTo}
                          </span>
                        ) : (
                          <span style={{ color: "#8892A4" }}>—</span>
                        )}
                      </td>
                      <td>
                        {seat.activationDate ? (
                          <div className="sw-expiry">
                            <Calendar size={13} />
                            <span>
                              {new Date(seat.activationDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#8892A4" }}>—</span>
                        )}
                      </td>
                      <td>
                        {seat.expiryDate ? (
                          <div className="sw-expiry">
                            <Calendar size={13} />
                            <span>
                              {new Date(seat.expiryDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#8892A4" }}>—</span>
                        )}
                      </td>
                      <td>
                        <div className="sw-actions">
                          <button
                            className="sw-action-btn sw-action-btn--view"
                            title="View"
                            onClick={() => handleViewDetails(seat)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="sw-action-btn sw-action-btn--edit"
                            title="Edit"
                            onClick={() => handleEdit(seat)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="sw-action-btn sw-action-btn--delete"
                            title="Delete"
                            onClick={() => handleDeleteConfirm(seat)}
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

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="sw-pagination">
            <p className="sw-pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of{" "}
              {totalCount} seats
            </p>
            <div className="sw-pagination-buttons">
              <button
                className="sw-btn-page sw-btn-page-nav"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Previous
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
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="sw-modal-overlay" onClick={handleCloseModal}>
            <div className="sw-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sw-modal-header">
                <div className="sw-modal-title-wrap">
                  <div className="sw-modal-icon">
                    <Key size={22} />
                  </div>
                  <div>
                    <h2 className="sw-modal-title">
                      {editItem ? "Edit Seat" : "Add License Seat"}
                    </h2>
                    <p className="sw-modal-sub">
                      {editItem
                        ? "Update seat details"
                        : "Register a new license key or seat"}
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
                        Software <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="sw-select-wrap">
                        <select
                          name="softwareModelId"
                          value={formData.softwareModelId}
                          onChange={handleFormChange}
                          className={
                            formErrors.softwareModelId
                              ? "sw-input sw-input--error"
                              : "sw-input"
                          }
                          disabled={!!editItem} // can't change parent software when editing
                        >
                          <option value="">Select software</option>
                          {softwareDropdown.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.softwareModelId && (
                        <span className="sw-field-error">
                          {formErrors.softwareModelId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group sw-form-group--full">
                      <label>
                        License Key / Seat Name{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        name="licenseKeyOrSeatName"
                        value={formData.licenseKeyOrSeatName}
                        onChange={handleFormChange}
                        placeholder="e.g. ADBE-SEAT-03 or XXXX-YYYY-ZZZZ"
                        className={
                          formErrors.licenseKeyOrSeatName
                            ? "sw-input sw-input--error"
                            : "sw-input"
                        }
                        disabled={!!editItem} // key shouldn't change after creation
                      />
                      {formErrors.licenseKeyOrSeatName && (
                        <span className="sw-field-error">
                          {formErrors.licenseKeyOrSeatName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>Activation Date</label>
                      <input
                        type="date"
                        name="activationDate"
                        value={formData.activationDate}
                        onChange={handleFormChange}
                        className="sw-input"
                      />
                    </div>
                    <div className="sw-form-group">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleFormChange}
                        className="sw-input"
                      />
                    </div>
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
                          <Plus size={16} /> Add Seat
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && (
          <div className="sw-modal-overlay" onClick={() => setShowDetail(null)}>
            <div
              className="sw-modal sw-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sw-modal-header">
                <div className="sw-modal-title-wrap">
                  <div className="sw-name-avatar sw-name-avatar--lg">
                    {showDetail.licenseKeyOrSeatName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="sw-modal-title">
                      {showDetail.licenseKeyOrSeatName}
                    </h2>
                    <p className="sw-modal-sub">{showDetail.softwareName}</p>
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
                    <span className="sw-detail-label">Software</span>
                    <span className="sw-detail-value">
                      {showDetail.softwareName}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Status</span>
                    <span
                      className="sw-status-badge"
                      style={{
                        background: statusConfig[showDetail.status]?.bg,
                        color: statusConfig[showDetail.status]?.color,
                      }}
                    >
                      {showDetail.status}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Assigned To</span>
                    <span className="sw-detail-value">
                      {showDetail.assignedTo?.name || "—"}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Activation Date</span>
                    <span className="sw-detail-value">
                      {showDetail.activationDate
                        ? new Date(
                            showDetail.activationDate,
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Expiry Date</span>
                    <span className="sw-detail-value">
                      {showDetail.expiryDate
                        ? new Date(showDetail.expiryDate).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "long", year: "numeric" },
                          )
                        : "—"}
                    </span>
                  </div>
                </div>
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
                    <Edit2 size={15} /> Edit Seat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
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
              <h3 className="sw-confirm-title">Delete Seat?</h3>
              <p className="sw-confirm-text">
                Are you sure you want to remove{" "}
                <strong>"{deleteConfirm.licenseKeyOrSeatName}"</strong>? This
                action cannot be undone.
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

export default IndividualSoftware;
