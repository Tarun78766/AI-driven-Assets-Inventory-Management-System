import { useState, useMemo } from 'react';
import './Software.css';
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
} from 'lucide-react';
import Navbar from '../../components/navBar/NavBar';
import SideBar from '../../components/sideBar/SideBar';

/* ─── Initial Data ─────────────────────── */
const INITIAL_SOFTWARE = [
  {
    id: 1,
    name: 'Microsoft Office 365',
    category: 'Productivity',
    licenseType: 'Subscription',
    vendor: 'Microsoft',
    totalLicenses: 300,
    usedLicenses: 278,
    expiryDate: '2025-12-31',
    renewalStatus: 'Upcoming',
    cost: 12.5,
    assignedTo: ['Engineering', 'HR', 'Finance'],
    version: '16.0',
    notes: 'Enterprise plan, includes Teams & SharePoint',
  },
  {
    id: 2,
    name: 'Adobe Creative Suite',
    category: 'Design',
    licenseType: 'Subscription',
    vendor: 'Adobe',
    totalLicenses: 50,
    usedLicenses: 48,
    expiryDate: '2025-03-15',
    renewalStatus: 'Critical',
    cost: 54.99,
    assignedTo: ['Design', 'Marketing'],
    version: '2024',
    notes: 'Full Creative Cloud access',
  },
  {
    id: 3,
    name: 'Slack',
    category: 'Communication',
    licenseType: 'Subscription',
    vendor: 'Salesforce',
    totalLicenses: 1000,
    usedLicenses: 842,
    expiryDate: '2026-01-15',
    renewalStatus: 'Active',
    cost: 7.25,
    assignedTo: ['All Departments'],
    version: 'Business+',
    notes: 'Company-wide communication tool',
  },
  {
    id: 4,
    name: 'GitHub Enterprise',
    category: 'Development',
    licenseType: 'Per Seat',
    vendor: 'GitHub Inc.',
    totalLicenses: 120,
    usedLicenses: 115,
    expiryDate: '2025-08-30',
    renewalStatus: 'Upcoming',
    cost: 21.0,
    assignedTo: ['Engineering'],
    version: 'Enterprise 3.x',
    notes: 'Includes Actions, Packages, Security',
  },
  {
    id: 5,
    name: 'Zoom Business',
    category: 'Communication',
    licenseType: 'Subscription',
    vendor: 'Zoom',
    totalLicenses: 200,
    usedLicenses: 134,
    expiryDate: '2026-03-01',
    renewalStatus: 'Active',
    cost: 19.99,
    assignedTo: ['Management', 'HR', 'Sales'],
    version: '5.x',
    notes: 'Video conferencing for remote teams',
  },
  {
    id: 6,
    name: 'AutoCAD',
    category: 'Engineering',
    licenseType: 'Perpetual',
    vendor: 'Autodesk',
    totalLicenses: 15,
    usedLicenses: 15,
    expiryDate: '2025-02-28',
    renewalStatus: 'Expired',
    cost: 220.0,
    assignedTo: ['Engineering'],
    version: '2024',
    notes: 'CAD design tool — renewal overdue',
  },
  {
    id: 7,
    name: 'Jira Software',
    category: 'Project Management',
    licenseType: 'Subscription',
    vendor: 'Atlassian',
    totalLicenses: 150,
    usedLicenses: 102,
    expiryDate: '2026-06-30',
    renewalStatus: 'Active',
    cost: 8.15,
    assignedTo: ['Engineering', 'QA', 'Management'],
    version: 'Cloud',
    notes: 'Agile project tracking',
  },
  {
    id: 8,
    name: 'Tableau Desktop',
    category: 'Analytics',
    licenseType: 'Per Seat',
    vendor: 'Salesforce',
    totalLicenses: 25,
    usedLicenses: 22,
    expiryDate: '2025-11-10',
    renewalStatus: 'Upcoming',
    cost: 70.0,
    assignedTo: ['Analytics', 'Finance'],
    version: '2024.1',
    notes: 'Data visualisation and BI',
  },
];

/* ─── Constants ─────────────────────────── */
const CATEGORIES = ['All', 'Productivity', 'Design', 'Communication', 'Development', 'Engineering', 'Project Management', 'Analytics'];
const STATUSES   = ['All', 'Active', 'Upcoming', 'Critical', 'Expired'];
const LIC_TYPES  = ['Subscription', 'Per Seat', 'Perpetual', 'Open Source'];
const VENDORS    = ['Microsoft', 'Adobe', 'Salesforce', 'GitHub Inc.', 'Zoom', 'Autodesk', 'Atlassian', 'Oracle', 'Other'];
const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Design', 'Marketing', 'Management', 'Sales', 'Analytics', 'QA', 'All Departments'];

const EMPTY_FORM = {
  name: '', category: 'Productivity', licenseType: 'Subscription',
  vendor: '', totalLicenses: '', usedLicenses: '', expiryDate: '',
  renewalStatus: 'Active', cost: '', assignedTo: [], version: '', notes: '',
};

/* ─── Helpers ─────────────────────────── */
const usagePercent   = (s) => Math.round((s.usedLicenses / s.totalLicenses) * 100);
const daysUntilExpiry = (d) => Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

const statusConfig = {
  Active:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle  },
  Upcoming: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: Clock        },
  Critical: { color: '#F43F5E', bg: 'rgba(244,63,94,0.12)',   icon: AlertTriangle },
  Expired:  { color: '#8892A4', bg: 'rgba(136,146,164,0.1)',  icon: XCircle      },
};

/* ════════════════════════════════════════
   SOFTWARE COMPONENT
════════════════════════════════════════ */
const Software = () => {
  const [software, setSoftware]         = useState(INITIAL_SOFTWARE);
  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal]       = useState(false);
  const [showDetail, setShowDetail]     = useState(null);
  const [editItem, setEditItem]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]     = useState({});
  const [toast, setToast]               = useState(null);

  /* ── Toast ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return software.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.vendor.toLowerCase().includes(search.toLowerCase());
      const matchCat    = catFilter === 'All'    || s.category      === catFilter;
      const matchStatus = statusFilter === 'All' || s.renewalStatus === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [software, search, catFilter, statusFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:    software.length,
    active:   software.filter((s) => s.renewalStatus === 'Active').length,
    critical: software.filter((s) => s.renewalStatus === 'Critical' || s.renewalStatus === 'Expired').length,
    upcoming: software.filter((s) => s.renewalStatus === 'Upcoming').length,
    totalLic: software.reduce((a, s) => a + s.totalLicenses, 0),
    usedLic:  software.reduce((a, s) => a + s.usedLicenses,  0),
  }), [software]);

  /* ── Validation ── */
  const validate = (f) => {
    const e = {};
    if (!f.name.trim())                               e.name          = 'Software name is required';
    if (!f.vendor.trim())                             e.vendor        = 'Vendor is required';
    if (!f.totalLicenses || f.totalLicenses < 1)     e.totalLicenses = 'Must be at least 1';
    if (Number(f.usedLicenses) > Number(f.totalLicenses)) e.usedLicenses = 'Cannot exceed total';
    if (!f.expiryDate)                                e.expiryDate    = 'Expiry date is required';
    if (!f.cost || f.cost < 0)                        e.cost          = 'Enter a valid cost';
    return e;
  };

  /* ── Open Add modal ── */
  const handleAddNew = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  /* ── Open Edit modal ── */
  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ ...item, assignedTo: [...item.assignedTo] });
    setFormErrors({});
    setShowModal(true);
  };

  /* ── View Details ── */
  const handleViewDetails = (item) => {
    setShowDetail(item);
  };

  /* ── Delete ── */
  const handleDeleteConfirm = (item) => {
    setDeleteConfirm(item);
  };

  const handleDelete = (id) => {
    const name = software.find((s) => s.id === id)?.name;
    setSoftware((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
    showToast(`"${name}" removed`, 'error');
  };

  /* ── Close modal ── */
  const handleCloseModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  /* ── Submit Add / Edit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    if (editItem) {
      setSoftware((prev) =>
        prev.map((s) =>
          s.id === editItem.id
            ? { ...formData, id: editItem.id, totalLicenses: Number(formData.totalLicenses), usedLicenses: Number(formData.usedLicenses), cost: Number(formData.cost) }
            : s
        )
      );
      showToast(`"${formData.name}" updated successfully`);
    } else {
      setSoftware((prev) => [
        { ...formData, id: Date.now(), totalLicenses: Number(formData.totalLicenses), usedLicenses: Number(formData.usedLicenses), cost: Number(formData.cost) },
        ...prev,
      ]);
      showToast(`"${formData.name}" added successfully`);
    }
    handleCloseModal();
  };

  /* ── Form helpers ── */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleDept = (dept) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(dept)
        ? prev.assignedTo.filter((d) => d !== dept)
        : [...prev.assignedTo, dept],
    }));
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <>
      <Navbar />
      <SideBar/>
    <div className="sw-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`sw-toast sw-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="sw-header">
        <div className="sw-header-left">
          <div className="sw-header-icon">
            <Package size={26} />
          </div>
          <div>
            <h1 className="sw-title">Software Licenses</h1>
            <p className="sw-subtitle">Manage software inventory, licenses &amp; renewals</p>
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

      {/* ── Stats Cards ── */}
      <div className="sw-stats">
        <div className="sw-stat-card">
          <div className="sw-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}>
            <Package size={22} />
          </div>
          <div>
            <div className="sw-stat-value">{stats.total}</div>
            <div className="sw-stat-label">Total Software</div>
          </div>
        </div>
        <div className="sw-stat-card">
          <div className="sw-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="sw-stat-value">{stats.active}</div>
            <div className="sw-stat-label">Active Licenses</div>
          </div>
        </div>
        <div className="sw-stat-card">
          <div className="sw-stat-icon" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="sw-stat-value">{stats.critical}</div>
            <div className="sw-stat-label">Critical / Expired</div>
          </div>
        </div>
        <div className="sw-stat-card">
          <div className="sw-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="sw-stat-value">{stats.upcoming}</div>
            <div className="sw-stat-label">Upcoming Renewals</div>
          </div>
        </div>
        <div className="sw-stat-card">
          <div className="sw-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
            <Key size={22} />
          </div>
          <div>
            <div className="sw-stat-value">
              {stats.usedLic}<span>/{stats.totalLic}</span>
            </div>
            <div className="sw-stat-label">Licenses Used</div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="sw-filters">
        <div className="sw-search-wrap">
          <Search size={17} className="sw-search-icon" />
          <input
            className="sw-search"
            placeholder="Search software or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="sw-search-clear" onClick={() => setSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>

        <div className="sw-filter-group">
          <Filter size={15} className="sw-filter-icon" />
          <select className="sw-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="sw-select-arrow" />
        </div>

        <div className="sw-filter-group">
          <select className="sw-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="sw-select-arrow" />
        </div>

        <span className="sw-result-count">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="sw-empty">
                  <Package size={48} strokeWidth={1.2} />
                  <p>No software found</p>
                  <span>Try adjusting your filters</span>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const pct  = usagePercent(item);
                const days = daysUntilExpiry(item.expiryDate);
                const cfg  = statusConfig[item.renewalStatus];
                const Icon = cfg.icon;

                return (
                  <tr key={item.id} className="sw-row">
                    <td>
                      <div className="sw-name-cell">
                        <div className="sw-name-avatar">{item.name.charAt(0)}</div>
                        <div>
                          <div className="sw-name">{item.name}</div>
                          <div className="sw-vendor">{item.vendor} · v{item.version}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sw-category-badge">{item.category}</span>
                    </td>
                    <td>
                      <div className="sw-lic-type">
                        <Key size={13} /><span>{item.licenseType}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sw-lic-count">
                        <span className="sw-lic-used">{item.usedLicenses}</span>
                        <span className="sw-lic-sep">/</span>
                        <span className="sw-lic-total">{item.totalLicenses}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sw-usage-wrap">
                        <div className="sw-usage-bar-bg">
                          <div
                            className="sw-usage-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 95 ? '#F43F5E' : pct >= 80 ? '#F59E0B' : '#6366F1',
                            }}
                          />
                        </div>
                        <span
                          className="sw-usage-pct"
                          style={{ color: pct >= 95 ? '#F43F5E' : pct >= 80 ? '#F59E0B' : '#6366F1' }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="sw-expiry">
                        <Calendar size={13} />
                        <span>
                          {new Date(item.expiryDate).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                      {days <= 90 && days > 0 && (
                        <div className="sw-days-left" style={{ color: days <= 30 ? '#F43F5E' : '#F59E0B' }}>
                          {days}d left
                        </div>
                      )}
                      {days <= 0 && (
                        <div className="sw-days-left" style={{ color: '#8892A4' }}>Expired</div>
                      )}
                    </td>
                    <td>
                      <span className="sw-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={12} />{item.renewalStatus}
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

      {/* ── Pagination ── */}
      <div className="sw-pagination">
        <p className="sw-pagination-info">
          Showing {filtered.length} of {software.length} software
        </p>
        <div className="sw-pagination-buttons">
          <button className="sw-btn-page" disabled>Previous</button>
          <button className="sw-btn-page sw-btn-page--active">1</button>
          <button className="sw-btn-page">2</button>
          <button className="sw-btn-page">Next</button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="sw-modal-overlay" onClick={handleCloseModal}>
          <div className="sw-modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="sw-modal-header">
              <div className="sw-modal-title-wrap">
                <div className="sw-modal-icon"><Package size={22} /></div>
                <div>
                  <h2 className="sw-modal-title">
                    {editItem ? 'Edit Software' : 'Add New Software'}
                  </h2>
                  <p className="sw-modal-sub">
                    {editItem ? 'Update license details' : 'Register a new software license'}
                  </p>
                </div>
              </div>
              <button className="sw-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="sw-modal-body">
              <form onSubmit={handleSubmit} noValidate>

                <div className="sw-form-row">
                  <div className="sw-form-group sw-form-group--full">
                    <label>Software Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Microsoft Office 365"
                      className={formErrors.name ? 'sw-input sw-input--error' : 'sw-input'}
                    />
                    {formErrors.name && <span className="sw-field-error">{formErrors.name}</span>}
                  </div>
                </div>

                <div className="sw-form-row">
                  <div className="sw-form-group">
                    <label>Vendor <span style={{ color: '#ef4444' }}>*</span></label>
                    <div className="sw-select-wrap">
                      <select
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleFormChange}
                        className={formErrors.vendor ? 'sw-input sw-input--error' : 'sw-input'}
                      >
                        <option value="">Select vendor</option>
                        {VENDORS.map((v) => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    {formErrors.vendor && <span className="sw-field-error">{formErrors.vendor}</span>}
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
                      <select name="category" value={formData.category} onChange={handleFormChange} className="sw-input">
                        {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="sw-form-group">
                    <label>License Type</label>
                    <div className="sw-select-wrap">
                      <select name="licenseType" value={formData.licenseType} onChange={handleFormChange} className="sw-input">
                        {LIC_TYPES.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sw-form-row">
                  <div className="sw-form-group">
                    <label>Total Licenses <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="number"
                      name="totalLicenses"
                      value={formData.totalLicenses}
                      onChange={handleFormChange}
                      placeholder="e.g. 100"
                      min="1"
                      className={formErrors.totalLicenses ? 'sw-input sw-input--error' : 'sw-input'}
                    />
                    {formErrors.totalLicenses && <span className="sw-field-error">{formErrors.totalLicenses}</span>}
                  </div>
                  <div className="sw-form-group">
                    <label>Used Licenses</label>
                    <input
                      type="number"
                      name="usedLicenses"
                      value={formData.usedLicenses}
                      onChange={handleFormChange}
                      placeholder="e.g. 80"
                      min="0"
                      className={formErrors.usedLicenses ? 'sw-input sw-input--error' : 'sw-input'}
                    />
                    {formErrors.usedLicenses && <span className="sw-field-error">{formErrors.usedLicenses}</span>}
                  </div>
                </div>

                <div className="sw-form-row">
                  <div className="sw-form-group">
                    <label>Expiry Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleFormChange}
                      className={formErrors.expiryDate ? 'sw-input sw-input--error' : 'sw-input'}
                    />
                    {formErrors.expiryDate && <span className="sw-field-error">{formErrors.expiryDate}</span>}
                  </div>
                  <div className="sw-form-group">
                    <label>Cost / Month ($) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      step="0.01"
                      onChange={handleFormChange}
                      placeholder="e.g. 12.50"
                      min="0"
                      className={formErrors.cost ? 'sw-input sw-input--error' : 'sw-input'}
                    />
                    {formErrors.cost && <span className="sw-field-error">{formErrors.cost}</span>}
                  </div>
                </div>

                <div className="sw-form-row">
                  <div className="sw-form-group">
                    <label>Renewal Status</label>
                    <div className="sw-select-wrap">
                      <select name="renewalStatus" value={formData.renewalStatus} onChange={handleFormChange} className="sw-input">
                        {STATUSES.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
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
                        className={`sw-dept-chip ${formData.assignedTo.includes(d) ? 'sw-dept-chip--active' : ''}`}
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
                  <button type="button" className="sw-btn sw-btn--ghost" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="sw-btn sw-btn--primary">
                    {editItem
                      ? <><RefreshCw size={16} /> Update</>
                      : <><Plus size={16} /> Add Software</>
                    }
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
        <div className="sw-modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="sw-modal sw-modal--detail" onClick={(e) => e.stopPropagation()}>

            <div className="sw-modal-header">
              <div className="sw-modal-title-wrap">
                <div className="sw-name-avatar sw-name-avatar--lg">{showDetail.name.charAt(0)}</div>
                <div>
                  <h2 className="sw-modal-title">{showDetail.name}</h2>
                  <p className="sw-modal-sub">{showDetail.vendor} · Version {showDetail.version}</p>
                </div>
              </div>
              <button className="sw-modal-close" onClick={() => setShowDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="sw-modal-body">
              <div className="sw-detail-grid">
                <div className="sw-detail-card">
                  <span className="sw-detail-label">Category</span>
                  <span className="sw-detail-value">{showDetail.category}</span>
                </div>
                <div className="sw-detail-card">
                  <span className="sw-detail-label">License Type</span>
                  <span className="sw-detail-value">{showDetail.licenseType}</span>
                </div>
                <div className="sw-detail-card">
                  <span className="sw-detail-label">Total Licenses</span>
                  <span className="sw-detail-value">{showDetail.totalLicenses}</span>
                </div>
                <div className="sw-detail-card">
                  <span className="sw-detail-label">Used Licenses</span>
                  <span className="sw-detail-value">
                    {showDetail.usedLicenses}
                    <span style={{ color: '#6366F1', fontSize: '13px', marginLeft: 6 }}>
                      ({usagePercent(showDetail)}%)
                    </span>
                  </span>
                </div>
                <div className="sw-detail-card">
                  <span className="sw-detail-label">Expiry Date</span>
                  <span className="sw-detail-value">
                    {new Date(showDetail.expiryDate).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="sw-detail-card">
                  <span className="sw-detail-label">Monthly Cost</span>
                  <span className="sw-detail-value">${showDetail.cost.toFixed(2)} / license</span>
                </div>
                <div className="sw-detail-card">
                  <span className="sw-detail-label">Renewal Status</span>
                  <span
                    className="sw-status-badge"
                    style={{ background: statusConfig[showDetail.renewalStatus].bg, color: statusConfig[showDetail.renewalStatus].color }}
                  >
                    {showDetail.renewalStatus}
                  </span>
                </div>
                <div className="sw-detail-card">
                  <span className="sw-detail-label">Total Monthly Cost</span>
                  <span className="sw-detail-value" style={{ color: '#6366F1', fontWeight: 700 }}>
                    ${(showDetail.cost * showDetail.totalLicenses).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="sw-detail-usage">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>License Usage</span>
                  <span style={{ fontSize: 13, color: '#6366F1', fontWeight: 700 }}>{usagePercent(showDetail)}%</span>
                </div>
                <div className="sw-usage-bar-bg" style={{ height: 10, borderRadius: 8 }}>
                  <div
                    className="sw-usage-bar-fill"
                    style={{
                      width: `${usagePercent(showDetail)}%`,
                      height: '100%',
                      borderRadius: 8,
                      background: usagePercent(showDetail) >= 95 ? '#F43F5E' : usagePercent(showDetail) >= 80 ? '#F59E0B' : '#6366F1',
                    }}
                  />
                </div>
              </div>

              <div className="sw-detail-section">
                <span className="sw-detail-label">Assigned Departments</span>
                <div className="sw-dept-tags">
                  {showDetail.assignedTo.map((d) => (
                    <span key={d} className="sw-dept-tag">{d}</span>
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
                <button className="sw-btn sw-btn--ghost" onClick={() => setShowDetail(null)}>Close</button>
                <button
                  className="sw-btn sw-btn--primary"
                  onClick={() => { setShowDetail(null); handleEdit(showDetail); }}
                >
                  <Edit2 size={15} /> Edit License
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="sw-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="sw-modal sw-modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="sw-confirm-icon">
              <Trash2 size={28} color="#F43F5E" />
            </div>
            <h3 className="sw-confirm-title">Delete Software?</h3>
            <p className="sw-confirm-text">
              Are you sure you want to remove <strong>"{deleteConfirm.name}"</strong>?
              This action cannot be undone.
            </p>
            <div className="sw-confirm-actions">
              <button className="sw-btn sw-btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="sw-btn sw-btn--danger" onClick={() => handleDelete(deleteConfirm.id)}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div></>
  );
};

export default Software;