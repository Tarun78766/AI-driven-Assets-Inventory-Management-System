import { useState, useMemo, useEffect } from "react";
import {
  getAssignments,
  createAssignmentApi,
  returnAssignmentApi,
} from "./AssignmentAPI";
import {
  getEmployees,
  getLaptopModels,
  getAvailableLaptops,
  getAvailableLaptopsByModel,
  getSoftwareModels,
  getAvailableSoftwareSeatsByModel,
} from "../../API/dataAPI";
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
  RefreshCw,
} from "lucide-react";

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";

const ITEMS_PER_PAGE = 10;


const STATUSES = ["All", "Assigned", "Returned"];
const ASSET_TYPES = ["All", "Laptop", "Software"];
const userData = JSON.parse(localStorage.getItem("user"));

const EMPTY_FORM = {
  employeeId: "",
  assetType: "Laptop",
  laptopModelId: "",
  laptopAssetId: "",
  softwareModelId: "",
  softwareId: "",
  assignedBy: userData?.role || "",
  status: "Assigned",
  assignDate: new Date().toISOString().split("T")[0],
};

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [laptopModels, setLaptopModels] = useState([]);
  const [availableLaptops, setAvailableLaptops] = useState([]);
  const [filteredLaptopAssets, setFilteredLaptopAssets] = useState([]);
  const [softwareModels, setSoftwareModels] = useState([]);
  const [softwareSeats, setSoftwareSeats] = useState([]);

  // Backend Pagination States
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    returned: 0,
    laptops: 0,
    software: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [emp, lapModels, availLaps, softModels] = await Promise.all([
        getEmployees(),
        getLaptopModels(),
        getAvailableLaptops(),
        getSoftwareModels(),
      ]);

      setEmployees(emp);
      setLaptopModels(lapModels);
      setAvailableLaptops(availLaps);
      setSoftwareModels(softModels);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      if (formData.assetType === "Laptop" && formData.laptopModelId) {
        try {
          const laptops = await getAvailableLaptopsByModel(
            formData.laptopModelId,
          );
          setFilteredLaptopAssets(laptops || []);
        } catch (err) {
          console.error("Error fetching laptops by model", err);
          setFilteredLaptopAssets([]);
        }
      } else if (formData.assetType === "Software" && formData.softwareModelId) {
        try {
          const data = await getAvailableSoftwareSeatsByModel(formData.softwareModelId);
          setSoftwareSeats(data || []);
        } catch (err) {
          console.error(err);
          setSoftwareSeats([]);
        }
      } else {
         if (formData.assetType === "Software") setSoftwareSeats([]);
         if (formData.assetType === "Laptop") setFilteredLaptopAssets([]);
      }
    };
    fetchAssets();
  }, [formData.laptopModelId, formData.softwareModelId, formData.assetType]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await getAssignments(
        currentPage,
        ITEMS_PER_PAGE,
        search,
        statusFilter,
        typeFilter,
      );
      setAssignments(response.data || []);
      setTotalCount(response.totalCount || 0);
      if (response.stats) setStats(response.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentPage, search, statusFilter, typeFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Pagination Variables based on Server State
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + assignments.length;

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

  const validate = (f) => {
    console.log(f);
    const e = {};
    if (!f.employeeId) e.employeeId = "Employee is required";
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

  const handleReturn = async (assignment) => {
    if (!window.confirm("Return this asset?")) return;

    try {
      const updated = await returnAssignmentApi(assignment._id);

      setAssignments((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a)),
      );

      showToast("Returned successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "error");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
      const payload = {
        employeeId: formData.employeeId,
        assetType: formData.assetType,
        assignDate: formData.assignDate,
        ...(formData.assetType === "Laptop" && {
          laptopModelId: formData.laptopModelId,
          laptopAssetId: formData.laptopAssetId,
        }),
        ...(formData.assetType === "Software" && {
          softwareId: formData.softwareId,
        }),
      };

const newAssignment = await createAssignmentApi(payload);

      setAssignments((prev) => [newAssignment, ...prev]);

      showToast(
        `${newAssignment.assetName} assigned to ${newAssignment.employeeName}`,
      );

      handleCloseModal();
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "error");
    }
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "assetType") {
      setFormData((prev) => ({
        ...prev,
        assetType: value,
        laptopModelId: "",
        laptopAssetId: "",
        softwareModelId: "",
        softwareId: "",
        purchaseDate: "",
      }));
    }

    // 🔥 IMPORTANT PART
    else if (name === "laptopAssetId") {
      const selectedLaptop = filteredLaptopAssets.find((l) => l._id === value);

      setFormData((prev) => ({
        ...prev,
        laptopAssetId: value,
        purchaseDate: selectedLaptop?.purchaseDate
          ? selectedLaptop.purchaseDate.split("T")[0] // format fix
          : "",
      }));
    }else if (name === "softwareId") {
    const selected = softwareSeats.find(s => s._id === value);

    setFormData((prev) => ({
      ...prev,
      softwareId: selected?._id,
      // optional if you want
    }));
  } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getAssetTypeColor = (type) => {
    return type === "Laptop"
      ? { bg: "#e0e7ff", color: "#6366f1" }
      : { bg: "#fce7f3", color: "#ec4899" };
  };

  const getAvailableAssets = () => {
    return formData.assetType === "Laptop" ? laptops : software;
  };

  const selectedSoftwareDetails = formData.softwareId 
    ? softwareSeats.find((seat) => seat._id === formData.softwareId)
    : null;

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="assign-page">
        {toast && (
          <div className={`assign-toast assign-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
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
              <p className="assign-subtitle">
                Manage laptop and software assignments
              </p>
            </div>
          </div>
          <div className="assign-header-right">
            <button className="assign-btn assign-btn--outline">
              <Download size={16} /> Export
            </button>
            <button
              className="assign-btn assign-btn--primary"
              onClick={handleAddNew}
            >
              <Plus size={18} /> New Assignment
            </button>
          </div>
        </div>

        <div className="assign-stats">
          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
            >
              <ClipboardList size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.total}</div>
              <div className="assign-stat-label">Total Assignments</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
            >
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.assigned}</div>
              <div className="assign-stat-label">Assigned</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(136,146,164,0.12)", color: "#8892A4" }}
            >
              <RotateCcw size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.returned}</div>
              <div className="assign-stat-label">Returned</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
            >
              <Laptop size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.laptops}</div>
              <div className="assign-stat-label">Laptops Assigned</div>
            </div>
          </div>
          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}
            >
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
              <button
                className="assign-search-clear"
                onClick={() => handleSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="assign-filter-group">
            {/* <Filter size={15} className="assign-filter-icon" /> */}
            <span className="assign-filter-label">Category:</span>
            <select
              className="assign-select"
              value={typeFilter}
              onChange={(e) =>
                handleFilterChange(setTypeFilter)(e.target.value)
              }
            >
              {ASSET_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="assign-filter-group">
            <span className="assign-filter-label">Status:</span>

            <select
              className="assign-select"
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

          <span className="assign-result-count">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
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
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="emp-empty">
                    <RefreshCw
                      size={40}
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#6366f1",
                        marginBottom: "10px",
                        opacity: 1,
                      }}
                    />
                    <p>Fetching assignments...</p>
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="assign-empty">
                    <ClipboardList size={48} strokeWidth={1.2} />
                    <p>No assignments found</p>
                    <span>Try adjusting your filters</span>
                  </td>
                </tr>
              ) : (
                assignments.map((assign) => {
                  const typeColor = getAssetTypeColor(assign.assetType);
                  return (
                    <tr key={assign.id} className="assign-row">
                      <td>
                        <div className="assign-employee-cell">
                          <div className="assign-avatar">
                            {assign.employeeName.charAt(0)}
                          </div>
                          <div className="assign-employee-name">
                            {assign.employeeName}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="assign-type-badge"
                          style={{
                            background: typeColor.bg,
                            color: typeColor.color,
                          }}
                        >
                          {assign.assetType === "Laptop" ? (
                            <Laptop size={13} />
                          ) : (
                            <Package size={13} />
                          )}
                          {assign.assetType}
                        </span>
                      </td>
                      <td>
                        <span className="assign-asset-name">
                          {assign.assetName}
                        </span>
                      </td>
                      <td>
                        <div className="assign-date">
                          <Calendar size={13} />
                          {new Date(assign.assignDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </td>
                      <td>
                        {assign.returnDate ? (
                          <div className="assign-date">
                            <Calendar size={13} />
                            {new Date(assign.returnDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        ) : (
                          <span className="assign-no-date">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`assign-status-badge assign-status-badge--${assign.status.toLowerCase()}`}
                        >
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
                          <button
                            className="assign-action-btn assign-action-btn--view"
                            title="View details"
                            onClick={() => handleViewDetails(assign)}
                          >
                            <Eye size={15} />
                          </button>
                          {assign.status === "Assigned" && (
                            <button
                              className="assign-action-btn assign-action-btn--return"
                              title="Return asset"
                              onClick={() => handleReturn(assign)}
                            >
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

        {totalCount > 0 && (
          <div className="assign-pagination">
            <p className="assign-pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of{" "}
              {totalCount} assignments
            </p>
            <div className="assign-pagination-buttons">
              <button
                className="assign-btn-page assign-btn-page-nav"
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
                    className="assign-pagination-ellipsis"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`assign-btn-page ${currentPage === page ? "assign-btn-page--active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className="assign-btn-page assign-btn-page-nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
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
                    <p className="assign-modal-sub">
                      Assign a laptop or software to an employee
                    </p>
                  </div>
                </div>
                <button
                  className="assign-modal-close"
                  onClick={handleCloseModal}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="assign-modal-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="assign-form-row">
                    <div className="assign-form-group assign-form-group--full">
                      <input
                        type="text"
                        name="assignedBy"
                        value={formData.assignedBy}
                        readOnly
                        hidden
                      />
                      <label>
                        Employee <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <div className="assign-select-wrap">
                        <select
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleFormChange}
                          className={
                            formErrors.employeeId
                              ? "assign-input assign-input--error"
                              : "assign-input"
                          }
                        >
                          <option value="">Select employee</option>
                          {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name} - {emp.department}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.employeeId && (
                        <span className="assign-field-error">
                          {formErrors.employeeId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="assign-form-row">
                    <div className="assign-form-group">
                      <label>Asset Type</label>
                      <div className="assign-radio-group">
                        <label
                          className={`assign-radio-option ${
                            formData.assetType === "Laptop"
                              ? "assign-radio-option--active"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="assetType"
                            value="Laptop"
                            checked={formData.assetType === "Laptop"}
                            onChange={handleFormChange}
                          />
                          <Laptop size={18} />
                          <span>Laptop</span>
                        </label>

                        <label
                          className={`assign-radio-option ${
                            formData.assetType === "Software"
                              ? "assign-radio-option--active"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="assetType"
                            value="Software"
                            checked={formData.assetType === "Software"}
                            onChange={handleFormChange}
                          />
                          <Package size={18} />
                          <span>Software</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.assetType === "Laptop" && (
                    <>
                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>
                            Laptop Model{" "}
                            <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <div className="assign-select-wrap">
                            <select
                              name="laptopModelId"
                              value={formData.laptopModelId}
                              onChange={handleFormChange}
                              className={
                                formErrors.laptopModelId
                                  ? "assign-input assign-input--error"
                                  : "assign-input"
                              }
                            >
                              <option value="">Select laptop model</option>
                              {laptopModels.map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.modelName}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formErrors.laptopModelId && (
                            <span className="assign-field-error">
                              {formErrors.laptopModelId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>
                            Individual Laptop Asset{" "}
                            <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <div className="assign-select-wrap">
                            <select
                              name="laptopAssetId"
                              value={formData.laptopAssetId}
                              onChange={handleFormChange}
                              className={
                                formErrors.laptopAssetId
                                  ? "assign-input assign-input--error"
                                  : "assign-input"
                              }
                              disabled={!formData.laptopModelId}
                            >
                              <option value="">
                                {formData.laptopModelId
                                  ? "Select individual laptop asset"
                                  : "First select laptop model"}
                              </option>
                              {filteredLaptopAssets.map((asset) => (
                                <option key={asset._id} value={asset._id}>
                                  {asset.serialNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formErrors.laptopAssetId && (
                            <span className="assign-field-error">
                              {formErrors.laptopAssetId}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {formData.assetType === "Software" && (
                    <>
                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>
                            Software Model{" "}
                            <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <div className="assign-select-wrap">
                            <select
                              name="softwareModelId"
                              value={formData.softwareModelId}
                              onChange={handleFormChange}
                              className={
                                formErrors.softwareModelId
                                  ? "assign-input assign-input--error"
                                  : "assign-input"
                              }
                            >
                              <option value="">Select Software Catalog</option>
                              {softwareModels?.map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formErrors.softwareModelId && (
                            <span className="assign-field-error">
                              {formErrors.softwareModelId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>
                            Software <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <div className="assign-select-wrap">
                            <select
                              name="softwareId"
                              value={formData.softwareId}
                              onChange={handleFormChange}
                              className={
                                formErrors.softwareId
                                  ? "assign-input assign-input--error"
                                  : "assign-input"
                              }
                              disabled={!formData.softwareModelId}
                            >
                              <option value="">
                                {formData.softwareModelId
                                  ? "Select Software Seat (license key)"
                                  : "First select software model"}
                              </option>
                              {[...(softwareSeats || [])]
                                .sort((a, b) =>
                                  a.licenseKeyOrSeatName.localeCompare(b.licenseKeyOrSeatName, undefined, { numeric: true })
                                )
                                .map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.licenseKeyOrSeatName}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formErrors.softwareId && (
                            <span className="assign-field-error">
                              {formErrors.softwareId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>Software Details</label>
                          <input
                            type="text"
                            className="assign-input"
                            readOnly
                            value={
                              selectedSoftwareDetails
                                ? `${selectedSoftwareDetails.softwareName}${selectedSoftwareDetails.version ? ` - ${selectedSoftwareDetails.version}` : ""}`
                                : ""
                            }
                            placeholder="Selected software details will appear here"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="assign-form-row">
                    <div className="assign-form-group">
                      <label>
                        Assignment Date{" "}
                        <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="date"
                        name="assignDate"
                        value={formData.assignDate}
                        onChange={handleFormChange}
                        className={
                          formErrors.assignDate
                            ? "assign-input assign-input--error"
                            : "assign-input"
                        }
                      />
                      {formErrors.assignDate && (
                        <span className="assign-field-error">
                          {formErrors.assignDate}
                        </span>
                      )}
                    </div>
                    {formData.assetType === "Laptop" && (
                      <div className="assign-form-group">
                        <label>
                          Purchase Date{" "}
                          <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          type="date"
                          name="purchaseDate"
                          value={formData.purchaseDate || ""}
                          readOnly
                          className="assign-input assign-input--disabled"
                        />
                        {formErrors.purchaseDate && (
                          <span className="assign-field-error">
                            {formErrors.purchaseDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="assign-modal-footer">
                    <button
                      type="button"
                      className="assign-btn assign-btn--ghost"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="assign-btn assign-btn--primary"
                    >
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
          <div
            className="assign-modal-overlay"
            onClick={() => setShowDetail(null)}
          >
            <div
              className="assign-modal assign-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="assign-modal-header">
                <div className="assign-modal-title-wrap">
                  <div className="assign-avatar assign-avatar--lg">
                    {showDetail.employeeName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="assign-modal-title">Assignment Details</h2>
                    <p className="assign-modal-sub">
                      {showDetail.employeeName} · {showDetail.assetName}
                    </p>
                  </div>
                </div>
                <button
                  className="assign-modal-close"
                  onClick={() => setShowDetail(null)}
                >
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
                      {showDetail.assetType === "Laptop" ? (
                        <Laptop size={14} style={{ marginRight: 6 }} />
                      ) : (
                        <Package size={14} style={{ marginRight: 6 }} />
                      )}
                      {showDetail.assetType}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Asset Name</span>
                    <span className="assign-detail-value">
                      {showDetail.assetName}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Asset ID</span>
                    <span className="assign-detail-value">
                      #{showDetail.assetId}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Assigned Date</span>
                    <span className="assign-detail-value">
                      <Calendar size={14} style={{ marginRight: 6 }} />
                      {new Date(showDetail.assignDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Return Date</span>
                    <span className="assign-detail-value">
                      {showDetail.returnDate ? (
                        <>
                          <Calendar size={14} style={{ marginRight: 6 }} />
                          {new Date(showDetail.returnDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </>
                      ) : (
                        "Not returned"
                      )}
                    </span>
                  </div>
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Status</span>
                    <span
                      className={`assign-status-badge assign-status-badge--${showDetail.status.toLowerCase()}`}
                    >
                      {showDetail.status}
                    </span>
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
                <button
                  className="assign-btn assign-btn--ghost"
                  onClick={() => setShowDetail(null)}
                >
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
