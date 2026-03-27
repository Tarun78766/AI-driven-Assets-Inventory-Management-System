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
} from "lucide-react";

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import AddEditLaptopModal from "./EditModal/AddEditLaptopModal ";

const ITEMS_PER_PAGE = 10;

const LaptopModels = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [laptopModels, setLaptopModels] = useState([
    {
      id: 1,
      modelName: "Dell XPS 15",
      brand: "Dell",
      processor: "Intel Core i7-13700H",
      ram: "16GB DDR5",
      storage: "512GB SSD",
      screenSize: '15.6"',
      graphicsCard: "NVIDIA RTX 3050",
      weight: "1.86 kg",
      batteryLife: "Up to 12 hours",
      ports: "2x Thunderbolt 4, 1x USB-C, SD Card",
      operatingSystem: "Windows 11 Pro",
      warranty: "3 years",
      price: "135000",
      totalAssets: 45,
      available: 12,
      inUse: 30,
      underRepair: 3,
    },
    {
      id: 2,
      modelName: 'MacBook Pro 16"',
      brand: "Apple",
      processor: "Apple M2 Pro",
      ram: "32GB Unified",
      storage: "1TB SSD",
      screenSize: '16.2"',
      graphicsCard: "Integrated",
      weight: "2.15 kg",
      batteryLife: "Up to 22 hours",
      ports: "3x Thunderbolt 4, HDMI, SD Card",
      operatingSystem: "macOS",
      warranty: "1 year",
      price: "245000",
      totalAssets: 38,
      available: 8,
      inUse: 28,
      underRepair: 2,
    },
    {
      id: 3,
      modelName: "HP EliteBook 840 G9",
      brand: "HP",
      processor: "Intel Core i5-1235U",
      ram: "8GB DDR4",
      storage: "256GB SSD",
      screenSize: '14"',
      graphicsCard: "Intel Iris Xe",
      weight: "1.36 kg",
      batteryLife: "Up to 10 hours",
      ports: "2x Thunderbolt 4, 2x USB-A, HDMI",
      operatingSystem: "Windows 11 Pro",
      warranty: "3 years",
      price: "85000",
      totalAssets: 62,
      available: 18,
      inUse: 42,
      underRepair: 2,
    },
    {
      id: 4,
      modelName: "Lenovo ThinkPad X1 Carbon",
      brand: "Lenovo",
      processor: "Intel Core i7-1260P",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
      screenSize: '14"',
      graphicsCard: "Intel Iris Xe",
      weight: "1.12 kg",
      batteryLife: "Up to 16 hours",
      ports: "2x Thunderbolt 4, 2x USB-A",
      operatingSystem: "Windows 11 Pro",
      warranty: "3 years",
      price: "125000",
      totalAssets: 50,
      available: 15,
      inUse: 33,
      underRepair: 2,
    },
    {
      id: 5,
      modelName: "ASUS ROG Zephyrus G14",
      brand: "ASUS",
      processor: "AMD Ryzen 9 6900HS",
      ram: "16GB DDR5",
      storage: "1TB SSD",
      screenSize: '14"',
      graphicsCard: "NVIDIA RTX 3060",
      weight: "1.65 kg",
      batteryLife: "Up to 10 hours",
      ports: "2x USB-C, 2x USB-A, HDMI",
      operatingSystem: "Windows 11 Home",
      warranty: "2 years",
      price: "155000",
      totalAssets: 20,
      available: 5,
      inUse: 14,
      underRepair: 1,
    },
    {
      id: 6,
      modelName: "Microsoft Surface Laptop 5",
      brand: "Microsoft",
      processor: "Intel Core i7-1255U",
      ram: "16GB LPDDR5x",
      storage: "512GB SSD",
      screenSize: '13.5"',
      graphicsCard: "Intel Iris Xe",
      weight: "1.29 kg",
      batteryLife: "Up to 18 hours",
      ports: "1x USB-C, 1x USB-A, Surface Connect",
      operatingSystem: "Windows 11 Pro",
      warranty: "1 year",
      price: "145000",
      totalAssets: 30,
      available: 9,
      inUse: 20,
      underRepair: 1,
    },
  ]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const filteredModels = laptopModels.filter(
    (model) =>
      model.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedModels = filteredModels.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value) => {
    setSearchTerm(value.trim());
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalModels = laptopModels.length;
  const totalAssets = laptopModels.reduce(
    (sum, model) => sum + model.totalAssets,
    0,
  );
  const totalAvailable = laptopModels.reduce(
    (sum, model) => sum + model.available,
    0,
  );
  const totalInUse = laptopModels.reduce((sum, model) => sum + model.inUse, 0);

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

  const handleDelete = (id) => {
    const name = laptopModels.find((m) => m.id === id)?.modelName;
    setLaptopModels((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);

    // Adjust page if needed after deletion
    const newFilteredLength = filteredModels.length - 1;
    const newTotalPages = Math.ceil(newFilteredLength / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }

    showToast(`"${name}" removed`, "error");
  };

  const handleSave = (modelData) => {
    if (isEditing) {
      setLaptopModels((prevModels) =>
        prevModels.map((m) => (m.id === modelData.id ? modelData : m)),
      );
      showToast(`"${modelData.modelName}" updated successfully`);
    } else {
      setLaptopModels((prevModels) => [...prevModels, modelData]);
      showToast(`"${modelData.modelName}" added successfully`);
    }
    setShowAddModal(false);
    setSelectedModel(null);
    setIsEditing(false);
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
              <h3 className="stat-value-small">{totalAssets}</h3>
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
              <h3 className="stat-value-small">{totalAvailable}</h3>
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
              <h3 className="stat-value-small">{totalInUse}</h3>
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
          <button className="btn-filter">
            <Filter size={18} />
            Filter
          </button>
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
              {paginatedModels.length > 0 ? (
                paginatedModels.map((model) => (
                  <tr key={model.id}>
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
                        {model.available}
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
        {filteredModels.length > 0 && (
          <div className="pagination">
            <p className="pagination-info">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredModels.length)} of{" "}
              {filteredModels.length} models
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
                        {showDetail.available}
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
                  onClick={() => handleDelete(deleteConfirm.id)}
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
