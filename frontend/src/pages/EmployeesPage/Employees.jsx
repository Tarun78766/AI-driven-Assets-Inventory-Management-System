import { useState, useMemo, useEffect } from "react";
import "./Employees.css";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Shield,
  RefreshCw,
} from "lucide-react";

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import {
  addEmployee,
  getEmployees,
  deleteEmployee,
  updateEmployee,
} from "./EmployeesAPI";

const ITEMS_PER_PAGE = 5;

/* ─── Initial Data ─────────────────────── */
const INITIAL_EMPLOYEES = [
  // { id: 1, name: "Rajesh Kumar", email: "rajesh.kumar@company.com", phone: "+91 98765 43210", role: "Admin", department: "IT Operations", joinDate: "2020-01-15", location: "Mumbai", status: "Active", assignedLaptops: 1, assignedSoftware: 12 },
  // { id: 2, name: "Priya Sharma", email: "priya.sharma@company.com", phone: "+91 98765 43211", role: "Manager", department: "Engineering", joinDate: "2019-03-20", location: "Bangalore", status: "Active", assignedLaptops: 1, assignedSoftware: 15 },
  // { id: 3, name: "Amit Patel", email: "amit.patel@company.com", phone: "+91 98765 43212", role: "Employee", department: "Design", joinDate: "2021-06-10", location: "Ahmedabad", status: "Active", assignedLaptops: 1, assignedSoftware: 8 },
  // { id: 4, name: "Sneha Reddy", email: "sneha.reddy@company.com", phone: "+91 98765 43213", role: "IT Operations", department: "IT Operations", joinDate: "2020-11-25", location: "Hyderabad", status: "Active", assignedLaptops: 1, assignedSoftware: 10 },
  // { id: 5, name: "Vikram Singh", email: "vikram.singh@company.com", phone: "+91 98765 43214", role: "Manager", department: "Sales", joinDate: "2018-07-14", location: "Delhi", status: "Active", assignedLaptops: 1, assignedSoftware: 9 },
  // { id: 6, name: "Ananya Iyer", email: "ananya.iyer@company.com", phone: "+91 98765 43215", role: "Employee", department: "Marketing", joinDate: "2022-02-01", location: "Chennai", status: "Active", assignedLaptops: 1, assignedSoftware: 7 },
  // { id: 7, name: "Rahul Verma", email: "rahul.verma@company.com", phone: "+91 98765 43216", role: "Employee", department: "Engineering", joinDate: "2021-09-18", location: "Pune", status: "Inactive", assignedLaptops: 0, assignedSoftware: 0 },
  // { id: 8, name: "Kavya Nair", email: "kavya.nair@company.com", phone: "+91 98765 43217", role: "Employee", department: "HR", joinDate: "2020-05-22", location: "Kochi", status: "Active", assignedLaptops: 1, assignedSoftware: 6 },
];

const ROLES = ["Admin", "IT Operations", "Manager", "Employee"];
const DEPARTMENTS = [
  "Engineering",
  "IT Operations",
  "HR",
  "Finance",
  "Design",
  "Marketing",
  "Sales",
  "Analytics",
  "QA",
];
const LOCATIONS = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Ahmedabad",
  "Kochi",
];
const STATUSES = ["All", "Active", "Inactive"];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "Employee",
  department: "",
  joinDate: "",
  location: "",
  status: "Active",
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalLaptops: 0,
    totalSoftware: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEmployees = async () => {

    try {
      setIsLoading(true);
      const limitNum = Math.min(50, Number(ITEMS_PER_PAGE));
      const pageNum = Math.max(1, Number(currentPage));
      const response = await getEmployees(
        pageNum,
        limitNum,
        debouncedSearch,
        statusFilter,
      );
      setEmployees(response.data.data);
      setTotalPages(response.data.totalPages);
      setStats(response.data.stats);

      setTotalEmployees(response.data.totalEmployees);
    } catch (error) {
      console.log("Failed to fetch employees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, [currentPage, debouncedSearch, statusFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };


  // Pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEmployees = employees;

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
    if (!f.name.trim()) e.name = "Name is required";
    if (!f.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      e.email = "Invalid email format";
    if (!f.department) e.department = "Department is required";
    if (!f.joinDate) e.joinDate = "Join date is required";
    if (!f.location) e.location = "Location is required";
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
    joinDate: item.joinDate ? item.joinDate.split("T")[0] : "", // ✅ trims to yyyy-MM-dd
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

  // ✅ Fix — clean version
  const handleDelete = async (id) => {
    const name = employees.find((e) => e._id === id)?.name;
    try {
      await deleteEmployee(id);
      await fetchEmployees();
      setDeleteConfirm(null);
      showToast(`"${name}" removed`, "error");
    } catch (error) {
      showToast("Failed to delete employee.", "error");
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
        await updateEmployee(editItem._id, formData);
        showToast(`"${formData.name}" updated successfully`);
      } else {
        await addEmployee(formData);
        showToast(`"${formData.name}" added successfully`);
      }
      await fetchEmployees();
      handleCloseModal();
    } catch (error) {
      showToast("Failed to save employee.", "error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Admin: { bg: "#fef3c7", color: "#f59e0b" },
      "IT Operations": { bg: "#dbeafe", color: "#3b82f6" },
      Manager: { bg: "#e0e7ff", color: "#6366f1" },
      Employee: { bg: "#d1fae5", color: "#10b981" },
    };
    return colors[role] || colors.Employee;
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="emp-page">
        {toast && (
          <div className={`emp-toast emp-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="emp-header">
          <div className="emp-header-left">
            <div className="emp-header-icon">
              <Users size={26} />
            </div>
            <div>
              <h1 className="emp-title">Employees</h1>
              <p className="emp-subtitle">
                Manage employee records and assignments
              </p>
            </div>
          </div>
          <button className="emp-btn emp-btn--primary" onClick={handleAddNew}>
            <Plus size={18} /> Add Employee
          </button>
        </div>

        <div className="emp-stats">
          <div className="emp-stat-card">
            <div
              className="emp-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
            >
              <Users size={22} />
            </div>
            <div>
              <div className="emp-stat-value">{stats.total}</div>
              <div className="emp-stat-label">Total Employees</div>
            </div>
          </div>
          <div className="emp-stat-card">
            <div
              className="emp-stat-icon"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
            >
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="emp-stat-value">{stats.active}</div>
              <div className="emp-stat-label">Active</div>
            </div>
          </div>
          <div className="emp-stat-card">
            <div
              className="emp-stat-icon"
              style={{ background: "rgba(136,146,164,0.12)", color: "#8892A4" }}
            >
              <AlertCircle size={22} />
            </div>
            <div>
              <div className="emp-stat-value">{stats.inactive}</div>
              <div className="emp-stat-label">Inactive</div>
            </div>
          </div>
          <div className="emp-stat-card">
            <div
              className="emp-stat-icon"
              style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}
            >
              <Briefcase size={22} />
            </div>
            <div>
              <div className="emp-stat-value">{stats.totalLaptops}</div>
              <div className="emp-stat-label">Laptops Assigned</div>
            </div>
          </div>
          <div className="emp-stat-card">
            <div
              className="emp-stat-icon"
              style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}
            >
              <Shield size={22} />
            </div>
            <div>
              <div className="emp-stat-value">{stats.totalSoftware}</div>
              <div className="emp-stat-label">Software Licenses</div>
            </div>
          </div>
        </div>

        <div className="emp-filters">
          <div className="emp-search-wrap">
            <Search size={17} className="emp-search-icon" />
            <input
              className="emp-search"
              placeholder="Search by name, email or department..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="emp-search-clear"
                onClick={() => handleSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="emp-filter-group">
            <span className="emp-filter-label">Status:</span>
          <div className="emp-search-wrap">

            <select
              className="emp-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
              </select>
              </div>
          </div>

          <span className="emp-result-count">
            {/* {filtered.length} result{filtered.length !== 1 ? "s" : ""} */}
          </span>
        </div>

        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Location</th>
                <th>Join Date</th>
                <th>Assets</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="emp-empty">
                    <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: '#6366f1', marginBottom: '10px', opacity: 1 }} />
                    <p>Fetching employees...</p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="emp-empty">
                    <Users size={48} strokeWidth={1.2} />
                    <p>No employees found</p>
                    <span>Try adjusting your search</span>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const roleColor = getRoleBadgeColor(emp.role);
                  return (
                    <tr key={emp._id} className="emp-row">
                      <td>
                        <div className="emp-name-cell">
                          <div className="emp-avatar">{emp.name.charAt(0)}</div>
                          <div>
                            <div className="emp-name">{emp.name}</div>
                            <div className="emp-email">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="emp-role-badge"
                          style={{
                            background: roleColor.bg,
                            color: roleColor.color,
                          }}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td>{emp.department}</td>
                      <td>
                        <div className="emp-location">
                          <MapPin size={13} />
                          <span>{emp.location}</span>
                        </div>
                      </td>
                      <td>
                        {new Date(emp.joinDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="emp-assets">
                          <span className="emp-asset-chip">
                            {emp.assignedLaptops} Laptop
                            {emp.assignedLaptops !== 1 ? "s" : ""}
                          </span>
                          <span className="emp-asset-chip">
                            {emp.assignedSoftware} Software
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`emp-status-badge emp-status-badge--${emp.status.toLowerCase()}`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div className="emp-actions">
                          <button
                            className="emp-action-btn emp-action-btn--view"
                            title="View details"
                            onClick={() => handleViewDetails(emp)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="emp-action-btn emp-action-btn--edit"
                            title="Edit"
                            onClick={() => handleEdit(emp)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="emp-action-btn emp-action-btn--delete"
                            title="Delete"
                            onClick={() => handleDeleteConfirm(emp)}
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

        {employees.length > 0 && (
          <div className="emp-pagination">
            <p className="emp-pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, totalEmployees)} of{" "}
              {totalEmployees} employees
            </p>
            <div className="emp-pagination-buttons">
              <button
                className="emp-btn-page emp-btn-page-nav"
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
                    className="emp-pagination-ellipsis"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`emp-btn-page ${currentPage === page ? "emp-btn-page--active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className="emp-btn-page emp-btn-page-nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="emp-modal-overlay" onClick={handleCloseModal}>
            <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="emp-modal-header">
                <div className="emp-modal-title-wrap">
                  <div className="emp-modal-icon">
                    <Users size={22} />
                  </div>
                  <div>
                    <h2 className="emp-modal-title">
                      {editItem ? "Edit Employee" : "Add New Employee"}
                    </h2>
                    <p className="emp-modal-sub">
                      {editItem
                        ? "Update employee information"
                        : "Register a new employee"}
                    </p>
                  </div>
                </div>
                <button className="emp-modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="emp-modal-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="emp-form-row">
                    <div className="emp-form-group emp-form-group--full">
                      <label>
                        Full Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g. Rajesh Kumar"
                        className={
                          formErrors.name
                            ? "emp-input emp-input--error"
                            : "emp-input"
                        }
                      />
                      {formErrors.name && (
                        <span className="emp-field-error">
                          {formErrors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="emp-form-row">
                    <div className="emp-form-group">
                      <label>
                        Email <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="name@company.com"
                        className={
                          formErrors.email
                            ? "emp-input emp-input--error"
                            : "emp-input"
                        }
                      />
                      {formErrors.email && (
                        <span className="emp-field-error">
                          {formErrors.email}
                        </span>
                      )}
                    </div>
                    <div className="emp-form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="+91 98765 43210"
                        className="emp-input"
                      />
                    </div>
                  </div>

                  <div className="emp-form-row">
                    <div className="emp-form-group">
                      <label>Role</label>
                      <div className="emp-select-wrap">
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleFormChange}
                          className="emp-input"
                        >
                          {ROLES.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="emp-form-group">
                      <label>
                        Department <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="emp-select-wrap">
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleFormChange}
                          className={
                            formErrors.department
                              ? "emp-input emp-input--error"
                              : "emp-input"
                          }
                        >
                          <option value="">Select department</option>
                          {DEPARTMENTS.map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      {formErrors.department && (
                        <span className="emp-field-error">
                          {formErrors.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="emp-form-row">
                    <div className="emp-form-group">
                      <label>
                        Join Date <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="date"
                        name="joinDate"
                        value={formData.joinDate}
                        onChange={handleFormChange}
                        className={
                          formErrors.joinDate
                            ? "emp-input emp-input--error"
                            : "emp-input"
                        }
                      />
                      {formErrors.joinDate && (
                        <span className="emp-field-error">
                          {formErrors.joinDate}
                        </span>
                      )}
                    </div>
                    <div className="emp-form-group">
                      <label>
                        Location <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="emp-select-wrap">
                        <select
                          name="location"
                          value={formData.location}
                          onChange={handleFormChange}
                          className={
                            formErrors.location
                              ? "emp-input emp-input--error"
                              : "emp-input"
                          }
                        >
                          <option value="">Select location</option>
                          {LOCATIONS.map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                      {formErrors.location && (
                        <span className="emp-field-error">
                          {formErrors.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="emp-form-row">
                    <div className="emp-form-group">
                      <label>Status</label>
                      <div className="emp-select-wrap">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleFormChange}
                          className="emp-input"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="emp-modal-footer">
                    <button
                      type="button"
                      className="emp-btn emp-btn--ghost"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="emp-btn emp-btn--primary">
                      {editItem ? (
                        <>
                          <CheckCircle size={16} /> Update
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Add Employee
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
          <div
            className="emp-modal-overlay"
            onClick={() => setShowDetail(null)}
          >
            <div
              className="emp-modal emp-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="emp-modal-header">
                <div className="emp-modal-title-wrap">
                  <div className="emp-avatar emp-avatar--lg">
                    {showDetail.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="emp-modal-title">{showDetail.name}</h2>
                    <p className="emp-modal-sub">
                      {showDetail.role} · {showDetail.department}
                    </p>
                  </div>
                </div>
                <button
                  className="emp-modal-close"
                  onClick={() => setShowDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="emp-modal-body">
                <div className="emp-detail-grid">
                  <div className="emp-detail-card">
                    <span className="emp-detail-label">Email</span>
                    <span className="emp-detail-value">
                      <Mail size={14} style={{ marginRight: 6 }} />
                      {showDetail.email}
                    </span>
                  </div>
                  <div className="emp-detail-card">
                    <span className="emp-detail-label">Phone</span>
                    <span className="emp-detail-value">
                      <Phone size={14} style={{ marginRight: 6 }} />
                      {showDetail.phone || "—"}
                    </span>
                  </div>
                  <div className="emp-detail-card">
                    <span className="emp-detail-label">Department</span>
                    <span className="emp-detail-value">
                      <Briefcase size={14} style={{ marginRight: 6 }} />
                      {showDetail.department}
                    </span>
                  </div>
                  <div className="emp-detail-card">
                    <span className="emp-detail-label">Location</span>
                    <span className="emp-detail-value">
                      <MapPin size={14} style={{ marginRight: 6 }} />
                      {showDetail.location}
                    </span>
                  </div>
                  <div className="emp-detail-card">
                    <span className="emp-detail-label">Join Date</span>
                    <span className="emp-detail-value">
                      <Calendar size={14} style={{ marginRight: 6 }} />
                      {new Date(showDetail.joinDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="emp-detail-card">
                    <span className="emp-detail-label">Status</span>
                    <span
                      className={`emp-status-badge emp-status-badge--${showDetail.status.toLowerCase()}`}
                    >
                      {showDetail.status}
                    </span>
                  </div>
                </div>

                <div className="emp-detail-asset-summary">
                  <p className="emp-detail-section-title">Asset Assignment</p>
                  <div className="emp-asset-summary-row">
                    <div
                      className="emp-asset-detail-chip"
                      style={{ background: "#e0e7ff", color: "#6366f1" }}
                    >
                      <span className="emp-asset-chip-num">
                        {showDetail.assignedLaptops}
                      </span>
                      <span className="emp-asset-chip-label">Laptops</span>
                    </div>
                    <div
                      className="emp-asset-detail-chip"
                      style={{ background: "#fce7f3", color: "#ec4899" }}
                    >
                      <span className="emp-asset-chip-num">
                        {showDetail.assignedSoftware}
                      </span>
                      <span className="emp-asset-chip-label">
                        Software Licenses
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="emp-modal-footer">
                <button
                  className="emp-btn emp-btn--ghost"
                  onClick={() => setShowDetail(null)}
                >
                  Close
                </button>
                <button
                  className="emp-btn emp-btn--primary"
                  onClick={() => {
                    setShowDetail(null);
                    handleEdit(showDetail);
                  }}
                >
                  <Edit2 size={15} /> Edit Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div
            className="emp-modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="emp-modal emp-modal--confirm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="emp-confirm-icon">
                <Trash2 size={28} color="#ef4444" />
              </div>
              <h3 className="emp-confirm-title">Delete Employee?</h3>
              <p className="emp-confirm-text">
                Are you sure you want to remove{" "}
                <strong>"{deleteConfirm.name}"</strong>? This action cannot be
                undone.
              </p>
              <div className="emp-confirm-actions">
                <button
                  className="emp-btn emp-btn--ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="emp-btn emp-btn--danger"
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

export default Employees;
