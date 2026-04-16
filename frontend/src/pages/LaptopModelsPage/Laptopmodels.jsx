import { useState } from "react";
import "./LaptopModels.css";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Laptop,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import AddEditLaptopModal from "./EditModal/AddEditLaptopModal ";
import {
  getLaptopModels,
  addLaptopModel,
  updateLaptopModel,
  deleteLaptopModel,
} from "./LaptopModelAPI";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const LaptopModels = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [laptopModels, setLaptopModels] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalModels, setTotalModels] = useState(0); // replaces laptopModels.length
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalAvailable: 0,
    totalInUse: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLaptopModels = async () => {
    try {
      setIsLoading(true);
      const response = await getLaptopModels(
        currentPage,
        ITEMS_PER_PAGE,
        debouncedSearch,
        statusFilter,
      );
      setLaptopModels(response.data.data);

      setTotalPages(response.data.totalPages);
      setTotalModels(response.data.totalModels);
      setStats(response.data.stats);
    } catch (error) {
      console.log("Failed to fetch laptop models.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaptopModels();
  }, [currentPage, debouncedSearch, statusFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Reset to page 1 when search changes
  const handleSearch = (value) => {
    setSearchTerm(value.trim());
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

  const handleAddNew = () => {
    setSelectedModel(null);
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleViewDetails = (model) => {
    setShowDetail(model);
  };

  const handleEdit = (model) => {
    setSelectedModel(model);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDeleteConfirm = (model) => {
    setDeleteConfirm(model);
  };

  const handleDelete = async (id) => {
    const name = laptopModels.find((m) => m._id === id)?.modelName;
    try {
      await deleteLaptopModel(id);
      await fetchLaptopModels();
      setDeleteConfirm(null);
      showToast(`"${name}" removed`, "error");
    } catch (error) {
      showToast("Failed to delete model.", "error");
    }
  };

  const handleSave = async (modelData) => {
    try {
      if (isEditing) {
        await updateLaptopModel(selectedModel._id, modelData);
        showToast(`"${modelData.modelName}" updated successfully`);
      } else {
        await addLaptopModel(modelData);
        showToast(`"${modelData.modelName}" added successfully`);
      }
      await fetchLaptopModels();
      setShowAddModal(false);
      setSelectedModel(null);
      setIsEditing(false);
    } catch (error) {
      showToast("Failed to save model.", "error");
    }
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedModel(null);
    setIsEditing(false);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="laptop-models">
        {toast && (
          <div className={`lm-toast lm-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="page-header">
          <div className="header-left">
            <div className="header-icon">
              <Laptop size={28} />
            </div>
            <div>
              <h1 className="page-title">Laptop Models</h1>
              <p className="page-subtitle">
                Manage laptop model catalog and specifications
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={handleAddNew}>
            <Plus size={20} />
            Add New Model
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card-small">
            <div
              className="stat-icon-small"
              style={{ backgroundColor: "#e0e7ff" }}
            >
              <Laptop size={24} style={{ color: "#6366f1" }} />
            </div>
            <div className="stat-content-small">
              <p className="stat-label-small">Total Models</p>
              <h3 className="stat-value-small">{totalModels}</h3>
            </div>
          </div>
          <div className="stat-card-small">
            <div
              className="stat-icon-small"
              style={{ backgroundColor: "#ddd6fe" }}
            >
              <Laptop size={24} style={{ color: "#8b5cf6" }} />
            </div>
            <div className="stat-content-small">
              <p className="stat-label-small">Total Assets</p>
              <h3 className="stat-value-small">{stats.totalAssets}</h3>
            </div>
          </div>
          <div className="stat-card-small">
            <div
              className="stat-icon-small"
              style={{ backgroundColor: "#d1fae5" }}
            >
              <Laptop size={24} style={{ color: "#10b981" }} />
            </div>
            <div className="stat-content-small">
              <p className="stat-label-small">Available</p>
              <h3 className="stat-value-small">{stats.totalAvailable}</h3>
            </div>
          </div>
          <div className="stat-card-small">
            <div
              className="stat-icon-small"
              style={{ backgroundColor: "#fef3c7" }}
            >
              <Laptop size={24} style={{ color: "#f59e0b" }} />
            </div>
            <div className="stat-content-small">
              <p className="stat-label-small">In Use</p>
              <h3 className="stat-value-small">{stats.totalInUse}</h3>
            </div>
          </div>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by model name or brand..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="lm-filter-group">
            <span className="lm-filter-label">Status:</span>

            <div className="lm-select-wrap">
              <select
                className="lm-select"
                value={statusFilter}
                onChange={(e) =>
                  handleFilterChange(setStatusFilter)(e.target.value)
                }
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="inUse">In Use</option>
                <option value="underRepair">Under Repair</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Brand</th>
                <th>Processor</th>
                <th>RAM</th>
                <th>Storage</th>
                <th>Screen</th>
                <th>Total Assets</th>
                <th>Available</th>
                <th>In Use</th>
                <th>Under Repair</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="no-data">
                    <RefreshCw
                      size={40}
                      className="il-loading-icon"
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#6366f1",
                        marginBottom: "10px",
                        opacity: 1,
                      }}
                    />
                    <p>Fetching models...</p>
                  </td>
                </tr>
              ) : laptopModels.length > 0 ? (
                laptopModels.map((model) => (
                  <tr key={model._id}>
                    <td>
                      <div className="model-name-cell">
                        <div className="model-name-cell-icon">
                          <Laptop size={18} className="model-icon" />
                        </div>
                        <div className="model-name-cell-label">
                          <strong>{model.modelName}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{model.brand}</td>
                    <td>{model.processor}</td>
                    <td>{model.ram}</td>
                    <td>{model.storage}</td>
                    <td>{model.screenSize}</td>
                    <td>
                      <span className="badge-table badge-total">
                        {model.totalAssets}
                      </span>
                    </td>
                    <td>
                      <span className="badge-table badge-available">
                        {model.totalAssets -
                          model.inUse -
                          (model.underRepair || 0)}
                      </span>
                    </td>
                    <td>
                      <span className="badge-table badge-in-use">
                        {model.inUse}
                      </span>
                    </td>
                    <td>
                      <span className="badge-table badge-repair">
                        {model.underRepair}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          title="View Details"
                          onClick={() => handleViewDetails(model)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          title="Edit"
                          onClick={() => handleEdit(model)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          title="Delete"
                          onClick={() => handleDeleteConfirm(model)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="no-data">
                    <Laptop size={48} />
                    <p>No laptop models found</p>
                    <small>Try adjusting your search criteria</small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {laptopModels.length > 0 && (
          <div className="pagination">
            <p className="pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, laptopModels.length)}{" "}
              of {laptopModels.length} models
            </p>
            <div className="pagination-buttons">
              <button
                className="btn-pagination btn-pagination-nav"
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
                    className="pagination-ellipsis"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`btn-pagination ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className="btn-pagination btn-pagination-nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <AddEditLaptopModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          model={isEditing ? selectedModel : null}
          onSave={handleSave}
        />

        {showDetail && (
          <div className="lm-modal-overlay" onClick={() => setShowDetail(null)}>
            <div
              className="lm-modal lm-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lm-modal-header">
                <div className="lm-modal-title-wrap">
                  <div className="lm-modal-avatar">
                    <Laptop size={22} />
                  </div>
                  <div>
                    <h2 className="lm-modal-title">{showDetail.modelName}</h2>
                    <p className="lm-modal-sub">
                      {showDetail.brand} · {showDetail.operatingSystem}
                    </p>
                  </div>
                </div>
                <button
                  className="lm-modal-close"
                  onClick={() => setShowDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="lm-modal-body">
                <div className="lm-detail-grid">
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Processor</span>
                    <span className="lm-detail-value">
                      {showDetail.processor}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">RAM</span>
                    <span className="lm-detail-value">{showDetail.ram}</span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Storage</span>
                    <span className="lm-detail-value">
                      {showDetail.storage}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Screen Size</span>
                    <span className="lm-detail-value">
                      {showDetail.screenSize}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Graphics Card</span>
                    <span className="lm-detail-value">
                      {showDetail.graphicsCard || "—"}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Weight</span>
                    <span className="lm-detail-value">
                      {showDetail.weight || "—"}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Battery Life</span>
                    <span className="lm-detail-value">
                      {showDetail.batteryLife || "—"}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Warranty</span>
                    <span className="lm-detail-value">
                      {showDetail.warranty || "—"}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Price</span>
                    <span
                      className="lm-detail-value"
                      style={{ color: "#6366f1", fontWeight: 700 }}
                    >
                      ₹{Number(showDetail.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="lm-detail-card">
                    <span className="lm-detail-label">Ports</span>
                    <span className="lm-detail-value">
                      {showDetail.ports || "—"}
                    </span>
                  </div>
                </div>
                <div className="lm-detail-asset-summary">
                  <p className="lm-detail-section-title">Asset Summary</p>
                  <div className="lm-asset-summary-row">
                    <div
                      className="lm-asset-chip"
                      style={{ background: "#e0e7ff", color: "#6366f1" }}
                    >
                      <span className="lm-asset-chip-num">
                        {showDetail.totalAssets}
                      </span>
                      <span className="lm-asset-chip-label">Total</span>
                    </div>
                    <div
                      className="lm-asset-chip"
                      style={{ background: "#d1fae5", color: "#10b981" }}
                    >
                      <span className="lm-asset-chip-num">
                        {showDetail.totalAssets -
                          showDetail.inUse -
                          (showDetail.underRepair || 0)}
                      </span>
                      <span className="lm-asset-chip-label">Available</span>
                    </div>
                    <div
                      className="lm-asset-chip"
                      style={{ background: "#fef3c7", color: "#f59e0b" }}
                    >
                      <span className="lm-asset-chip-num">
                        {showDetail.inUse}
                      </span>
                      <span className="lm-asset-chip-label">In Use</span>
                    </div>
                    <div
                      className="lm-asset-chip"
                      style={{ background: "#fee2e2", color: "#ef4444" }}
                    >
                      <span className="lm-asset-chip-num">
                        {showDetail.underRepair}
                      </span>
                      <span className="lm-asset-chip-label">Under Repair</span>
                    </div>
                  </div>
                </div>
                {showDetail.specifications && (
                  <div className="lm-detail-notes-wrap">
                    <span className="lm-detail-label">
                      Additional Specifications
                    </span>
                    <p className="lm-detail-notes">
                      {showDetail.specifications}
                    </p>
                  </div>
                )}
              </div>
              <div className="lm-modal-footer">
                <button
                  className="lm-btn lm-btn--ghost"
                  onClick={() => setShowDetail(null)}
                >
                  Close
                </button>
                <button
                  className="lm-btn lm-btn--primary"
                  onClick={() => {
                    navigate("/laptops/individual", {
                      state: { filterByModelId: showDetail._id },
                    });
                  }}
                >
                  <Laptop size={15} /> View Physical Assets
                </button>
                <button
                  className="lm-btn lm-btn--primary"
                  onClick={() => {
                    setShowDetail(null);
                    handleEdit(showDetail);
                  }}
                >
                  <Edit2 size={15} /> Edit Model
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div
            className="lm-modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="lm-modal lm-modal--confirm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lm-confirm-icon">
                <Trash2 size={28} color="#ef4444" />
              </div>
              <h3 className="lm-confirm-title">Delete Model?</h3>
              <p className="lm-confirm-text">
                Are you sure you want to remove{" "}
                <strong>"{deleteConfirm.modelName}"</strong>? This action cannot
                be undone.
              </p>
              <div className="lm-confirm-actions">
                <button
                  className="lm-btn lm-btn--ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="lm-btn lm-btn--danger"
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

export default LaptopModels;
