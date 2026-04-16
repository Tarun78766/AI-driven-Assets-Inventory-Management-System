import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Laptop, Package, Users,
  ClipboardList, FileText, Bell, Mail, Globe,
  Settings, Plus, Edit2, Trash2, X, Search,
  Eye, CheckCircle, Clock, AlertCircle,
  Monitor, Calendar, ChevronDown, Download,
  RefreshCw, Filter, Wrench, Archive, ChevronLeft
  
} from 'lucide-react';
import './IndividualLaptops.css';
import Navbar from '../../../components/navBar/NavBar';
import Sidebar from '../../../components/sideBar/SideBar';
import { getIndividualLaptops, addIndividualLaptop, updateIndividualLaptop, deleteIndividualLaptop } from './IndividualLaptopAPI';
import { getLaptopModels } from '../LaptopModelAPI';

/* ─────────────────────────────────────────
   API CONFIGURATION
───────────────────────────────────────── */


/* ─────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     id: 'dashboard'     },
  { icon: Laptop,          label: 'Laptops',       id: 'laptops'       },
  { icon: Package,         label: 'Software',      id: 'software'      },
  { icon: Users,           label: 'Employees',     id: 'employees'     },
  { icon: ClipboardList,   label: 'Assignments',   id: 'assignments'   },
  { icon: FileText,        label: 'Reports',       id: 'reports'       },
  { icon: Bell,            label: 'Notifications', id: 'notifications' },
];

const STATUSES = ['All', 'Available', 'Assigned', 'Under Repair', 'Retired'];

const EMPTY_FORM = {
  laptopModelId: '',
  modelName: '',
  serialNumber: '',
  status: 'Available',
  assignedTo: null,
  purchaseDate: '',
  conditionNotes: '',
};

/* ════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════ */
export default function IndividualLaptops() {
  const location = useLocation();
  const navigate = useNavigate();
  const filterByModelId = location.state?.filterByModelId;

  const [laptops, setLaptops]         = useState([]);
  const [laptopModels, setLaptopModels] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activePage, setActivePage]   = useState('laptops');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // -- Pagination States --
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalItems, setTotalItems]   = useState(0);

  const [showModal, setShowModal]     = useState(false);
  const [showDetail, setShowDetail]   = useState(null);
  const [editItem, setEditItem]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [toast, setToast]             = useState(null);

  /* ── Load data on mount/changes ── */
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLaptops();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, search, statusFilter, filterByModelId]);

  useEffect(() => {
    fetchLaptopModels();
  }, []);

  /* ── Fetch all individual laptops ── */
  const fetchLaptops = async () => {
    try {
      setLoading(true);
      const customFilters = {};
      
      // If we arrived here from the parent model page!
      if (filterByModelId) {
        customFilters.laptopModelId = filterByModelId;
      }
      
      if (search) customFilters.search = search;
      if (statusFilter && statusFilter !== 'All') customFilters.status = statusFilter;

      const response = await getIndividualLaptops(currentPage, 10, customFilters);
      setLaptops(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalModels || 0);
    } catch (error) {
      console.error('Error fetching laptops:', error);
      showToast('Failed to load laptops', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch laptop models for dropdown ── */
  const fetchLaptopModels = async () => {
    try {
      const response = await getLaptopModels(1, 100);
      setLaptopModels(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching laptop models:', error);
    }
  };

  /* ── Filtered list ── */
  const filtered = laptops;

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:      totalItems,
    available:  totalItems, // Stats should really be queried from DB separately, but we'll reflect current list scope for now.
    assigned:   0,
    repair:     0,
    retired:    0,
  }), [totalItems]);

  /* ── Toast notification ── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Validation ── */
  const validate = (f) => {
    const e = {};
    if (!f.laptopModelId) e.laptopModelId = 'Laptop model is required';
    if (!f.serialNumber.trim()) e.serialNumber = 'Serial number is required';
    if (!f.purchaseDate) e.purchaseDate = 'Purchase date is required';
    return e;
  };

  /* ── Actions ── */
  const openAdd = () => {
    setEditItem(null);
    
    let defaultModelId = '';
    let defaultModelName = '';
    
    if (filterByModelId) {
      defaultModelId = filterByModelId;
      const selectedModel = laptopModels.find(m => m._id === filterByModelId);
      if (selectedModel) defaultModelName = selectedModel.modelName;
    }

    setFormData({
      ...EMPTY_FORM,
      laptopModelId: defaultModelId,
      modelName: defaultModelName
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      laptopModelId: item.laptopModelId?._id || item.laptopModelId || '',
      modelName: item.modelName,
      serialNumber: item.serialNumber,
      status: item.status,
      assignedTo: item.assignedTo,
      purchaseDate: item.purchaseDate || '',
      conditionNotes: item.conditionNotes || '',
    });
    setFormErrors({});
    setShowModal(true);
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
        await updateIndividualLaptop(editItem._id, formData);
        showToast('Laptop updated successfully', 'success');
      } else {
        await addIndividualLaptop(formData);
        showToast('Laptop added successfully', 'success');
      }
      setShowModal(false);
      fetchLaptops();
    } catch (error) {
      console.error('Save error:', error);
      showToast(error.response?.data?.message || 'Failed to save laptop', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIndividualLaptop(id);
      showToast('Laptop deleted successfully', 'success');
      setDeleteConfirm(null);
      fetchLaptops();
    } catch (error) {
      console.error('Delete error:', error);
      showToast(error.response?.data?.message || 'Failed to delete laptop', 'error');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill modelName when laptopModelId changes
    if (name === 'laptopModelId') {
      const selectedModel = laptopModels.find(m => m._id === value);
      setFormData(prev => ({
        ...prev,
        laptopModelId: value,
        modelName: selectedModel ? selectedModel.modelName : '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setFormErrors(prev => ({ ...prev, [name]: '' }));
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

  /* ════════════════ RENDER ════════════════ */

  return (
    <>
    <Navbar />
      <Sidebar />
    <div className="il-root">

      {/* ══════════ SIDEBAR ══════════ */}
      {/* <aside className="il-sidebar">
        <div className="il-sidebar-brand">
          <div className="il-brand-logo">i</div>
          <span className="il-brand-name">InventoryHub</span>
        </div>
        <nav className="il-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              className={`il-nav-item ${activePage === id ? 'il-nav-item--active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside> */}

      {/* ══════════ MAIN ══════════ */}
      <div className="il-main">

        {/* ── Topbar ── */}
        {/* <header className="il-topbar">
          <div className="il-topbar-left">
            <div className="il-topbar-logo">i</div>
            <span className="il-topbar-name">InventoryHub</span>
          </div>
          <div className="il-topbar-right">
            <button className="il-tb-icon-btn"><Mail size={20} /></button>
            <button className="il-tb-icon-btn"><Globe size={20} /></button>
            <button className="il-tb-icon-btn il-tb-notif-btn">
              <Bell size={20} />
              <span className="il-tb-badge">3</span>
            </button>
            <div className="il-topbar-user">
              <div className="il-topbar-avatar">AU</div>
              <div className="il-topbar-user-info">
                <span className="il-topbar-uname">Admin User</span>
                <span className="il-topbar-urole">Administrator</span>
              </div>
            </div>
            <button className="il-tb-settings-btn"><Settings size={20} /></button>
          </div>
        </header> */}

        {/* ── Page Body ── */}
        <div className="il-body">

          {/* Page Header */}
          <div className="il-page-hdr">
            <div className="il-page-hdr-left">
              <div className="il-page-icon">
                <Laptop size={22} />
              </div>
              <div>
                <h1 className="il-page-title">Individual Laptops</h1>
                <p className="il-page-sub">Manage physical laptop inventory with serial numbers</p>
              </div>
            </div>
            <div className="il-page-hdr-actions">
              <button className="il-btn il-btn--outline" onClick={() => navigate('/laptops')}>
                <ChevronLeft size={16} /> Back to Models
              </button>
              <button className="il-btn il-btn--outline">
                <Download size={15} /> Export
              </button>
              <button className="il-btn il-btn--primary" onClick={openAdd}>
                <Plus size={16} /> Add Laptop
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="il-stats-row">
            <div className="il-stat-card">
              <div className="il-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}>
                <Laptop size={20} />
              </div>
              <div>
                <div className="il-stat-value">{stats.total}</div>
                <div className="il-stat-label">Total Laptops</div>
              </div>
            </div>
            <div className="il-stat-card">
              <div className="il-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="il-stat-value">{stats.available}</div>
                <div className="il-stat-label">Available</div>
              </div>
            </div>
            <div className="il-stat-card">
              <div className="il-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="il-stat-value">{stats.assigned}</div>
                <div className="il-stat-label">Assigned</div>
              </div>
            </div>
            <div className="il-stat-card">
              <div className="il-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                <Wrench size={20} />
              </div>
              <div>
                <div className="il-stat-value">{stats.repair}</div>
                <div className="il-stat-label">Under Repair</div>
              </div>
            </div>
            <div className="il-stat-card">
              <div className="il-stat-icon" style={{ background: 'rgba(107,114,128,0.12)', color: '#6B7280' }}>
                <Archive size={20} />
              </div>
              <div>
                <div className="il-stat-value">{stats.retired}</div>
                <div className="il-stat-label">Retired</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="il-filters">
            <div className="il-search-wrap">
              <Search size={16} className="il-search-icon" />
              <input
                className="il-search"
                placeholder="Search by serial number or model..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button className="il-search-clear" onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="il-filter-group">
              <Filter size={14} className="il-filter-icon" />
              <select className="il-select" value={statusFilter} onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="il-select-arrow" />
            </div>

            <span className="il-result-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="il-table-wrap">
            <table className="il-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Purchase Date</th>
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="il-empty">
                      <RefreshCw size={40} className="il-loading-icon" style={{ animation: 'spin 1s linear infinite', color: '#6366f1', marginBottom: '10px', opacity: 1 }} />
                      <p>Fetching data...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="il-empty">
                      <Laptop size={40} strokeWidth={1.2} />
                      <p>No laptops found</p>
                      <span>Try adjusting your filters or add a new laptop</span>
                    </td>
                  </tr>
                ) : (
                  filtered.map(l => (
                    <tr key={l._id} className="il-row">
                      <td>
                        <span className="il-serial">{l.serialNumber}</span>
                      </td>
                      <td>
                        <div className="il-model-cell">
                          <Monitor size={16} />
                          <span>{l.modelName}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="il-status-badge"
                          style={{
                            background: 
                              l.status === 'Available' ? 'rgba(16,185,129,0.12)' :
                              l.status === 'Assigned' ? 'rgba(99,102,241,0.12)' :
                              l.status === 'Under Repair' ? 'rgba(245,158,11,0.12)' :
                              'rgba(107,114,128,0.12)',
                            color:
                              l.status === 'Available' ? '#10B981' :
                              l.status === 'Assigned' ? '#6366F1' :
                              l.status === 'Under Repair' ? '#F59E0B' :
                              '#6B7280',
                          }}
                        >
                          {l.status === 'Available' && <CheckCircle size={12} />}
                          {l.status === 'Assigned' && <Users size={12} />}
                          {l.status === 'Under Repair' && <Wrench size={12} />}
                          {l.status === 'Retired' && <Archive size={12} />}
                          {l.status}
                        </span>
                      </td>
                      <td>
                        <span className="il-date">
                          {l.purchaseDate ? new Date(l.purchaseDate).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="il-condition">
                          {l.conditionNotes || 'Good'}
                        </span>
                      </td>
                      <td>
                        <div className="il-actions">
                          <button
                            className="il-action-btn il-action-btn--view"
                            title="View"
                            onClick={() => setShowDetail(l)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="il-action-btn il-action-btn--edit"
                            title="Edit"
                            onClick={() => openEdit(l)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="il-action-btn il-action-btn--delete"
                            title="Delete"
                            onClick={() => setDeleteConfirm(l)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Pagination */}
          {totalItems > 0 && (
            <div className="pagination" style={{ marginTop: '20px' }}>
              <p className="pagination-info">
                Showing {((currentPage - 1) * 10) + 1}-
                {Math.min(currentPage * 10, totalItems)} of{" "}
                {totalItems} laptops
              </p>
              <div className="pagination-buttons">
                <button
                  className="btn-pagination btn-pagination-nav"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
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
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════
          ADD/EDIT MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="il-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="il-modal" onClick={e => e.stopPropagation()}>
            <div className="il-modal-hdr">
              <div className="il-modal-title-wrap">
                <div className="il-modal-icon"><Laptop size={20} /></div>
                <div>
                  <h2 className="il-modal-title">{editItem ? 'Edit Laptop' : 'Add New Laptop'}</h2>
                  <p className="il-modal-sub">{editItem ? 'Update laptop details' : 'Register a new physical laptop'}</p>
                </div>
              </div>
              <button className="il-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="il-modal-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="il-form-row">
                  <div className="il-form-group">
                    <label>Laptop Model *</label>
                    <select
                      name="laptopModelId"
                      value={formData.laptopModelId}
                      onChange={handleFormChange} 
                      disabled={!!filterByModelId || !!editItem}
                      className={formErrors.laptopModelId ? 'il-input il-input--error' : 'il-input'}
                    >
                      <option value="">Select Model</option>
                      {laptopModels.map(m => (
                        <option key={m._id} value={m._id}>{m.modelName}</option>
                      ))}
                    </select>
                    {formErrors.laptopModelId && <span className="il-field-error">{formErrors.laptopModelId}</span>}
                  </div>
                  <div className="il-form-group">
                    <label>Serial Number *</label>
                    <input
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleFormChange}
                      placeholder="e.g. DX15-2024-0891"
                      className={formErrors.serialNumber ? 'il-input il-input--error' : 'il-input'}
                    />
                    {formErrors.serialNumber && <span className="il-field-error">{formErrors.serialNumber}</span>}
                  </div>
                </div>

                <div className="il-form-row">
                  <div className="il-form-group">
                    <label>Purchase Date *</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleFormChange}
                      className={formErrors.purchaseDate ? 'il-input il-input--error' : 'il-input'}
                    />
                    {formErrors.purchaseDate && <span className="il-field-error">{formErrors.purchaseDate}</span>}
                  </div>
                  <div className="il-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="il-input"
                    >
                      <option>Available</option>
                      <option>Assigned</option>
                      <option>Under Repair</option>
                      <option>Retired</option>
                    </select>
                  </div>
                </div>

                <div className="il-form-group il-form-group--full">
                  <label>Condition Notes</label>
                  <textarea
                    name="conditionNotes"
                    value={formData.conditionNotes}
                    onChange={handleFormChange}
                    placeholder="Any scratches, damages, or special notes..."
                    className="il-textarea"
                    rows={3}
                  />
                </div>

                <div className="il-modal-footer">
                  <button type="button" className="il-btn il-btn--ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="il-btn il-btn--primary">
                    {editItem ? <><RefreshCw size={15} /> Update</> : <><Plus size={15} /> Create</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════ */}
      {showDetail && (
        <div className="il-modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="il-modal il-modal--detail" onClick={e => e.stopPropagation()}>
            <div className="il-modal-hdr">
              <div className="il-modal-title-wrap">
                <div className="il-modal-icon"><Monitor size={20} /></div>
                <div>
                  <h2 className="il-modal-title">{showDetail.serialNumber}</h2>
                  <p className="il-modal-sub">{showDetail.modelName}</p>
                </div>
              </div>
              <button className="il-modal-close" onClick={() => setShowDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="il-modal-body">
              <div className="il-detail-grid">
                <div className="il-detail-card">
                  <span className="il-detail-label">Model Name</span>
                  <span className="il-detail-value">{showDetail.modelName}</span>
                </div>
                <div className="il-detail-card">
                  <span className="il-detail-label">Serial Number</span>
                  <span className="il-detail-value">{showDetail.serialNumber}</span>
                </div>
                <div className="il-detail-card">
                  <span className="il-detail-label">Status</span>
                  <span className="il-status-badge" style={{
                    background: showDetail.status === 'Available' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                    color: showDetail.status === 'Available' ? '#10B981' : '#6366F1',
                  }}>{showDetail.status}</span>
                </div>
                <div className="il-detail-card">
                  <span className="il-detail-label">Purchase Date</span>
                  <span className="il-detail-value">
                    {showDetail.purchaseDate ? new Date(showDetail.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>

              {showDetail.conditionNotes && (
                <div className="il-detail-section">
                  <span className="il-detail-label">Condition Notes</span>
                  <p className="il-detail-notes">{showDetail.conditionNotes}</p>
                </div>
              )}

              <div className="il-modal-footer">
                <button className="il-btn il-btn--ghost" onClick={() => setShowDetail(null)}>Close</button>
                <button className="il-btn il-btn--primary" onClick={() => { setShowDetail(null); openEdit(showDetail); }}>
                  <Edit2 size={15} /> Edit Laptop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DELETE CONFIRM
      ══════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="il-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="il-modal il-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="il-confirm-icon"><Trash2 size={28} color="#F43F5E" /></div>
            <h3 className="il-confirm-title">Delete Laptop?</h3>
            <p className="il-confirm-text">
              Are you sure you want to remove laptop <strong>{deleteConfirm.serialNumber}</strong> ({deleteConfirm.modelName})?
              This action cannot be undone.
            </p>
            <div className="il-confirm-actions">
              <button className="il-btn il-btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="il-btn il-btn--danger" onClick={() => handleDelete(deleteConfirm._id)}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TOAST NOTIFICATION
      ══════════════════════════════════════ */}
      {toast && (
        <div className={`il-toast il-toast--${toast.type}`}>
          <div className="il-toast-icon">
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          </div>
          <span className="il-toast-message">{toast.message}</span>
          <button className="il-toast-close" onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}
      </div>
      </>
  );
}