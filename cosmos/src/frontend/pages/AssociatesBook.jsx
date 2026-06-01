import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import './DataPage.css'

function formatAmount(n) {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

const REGIONS = ['All', 'Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad']

const MAJOR_LOCATIONS = [
  'Mumbai, MH', 'Delhi NCR', 'Bengaluru, KA', 'Kolkata, WB', 
  'Chennai, TN', 'Hyderabad, TG', 'Pune, MH', 'Ahmedabad, GJ',
  'Jaipur, RJ', 'Lucknow, UP', 'Indore, MP', 'Kochi, KL', 'Patna, BR'
]

function HybridLocationPicker({ value, onChange, disabled }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        list="indian-major-cities-assoc"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type custom or choose major city..."
        style={{ width: '100%' }}
      />
      <datalist id="indian-major-cities-assoc">
        {MAJOR_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>
    </div>
  )
}

const emptyAssociate = {
  name: '', email: '', phone: '', region: 'Mumbai', clients: 0,
  disbursed: 0, commission: 0, joined: new Date().toISOString().slice(0, 10), status: 'active', id: null,
}

export default function AssociatesBook() {
  const { associates, addAssociate, updateAssociate } = useAppState()
  const { addToast } = useToast()
  const [search, setSearch]       = useState('')
  const [regionFilter, setRegion] = useState('All')
  const [statusFilter, setStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [formData, setFormData]   = useState(emptyAssociate)

  // Stepper Wizard states
  const [showAddWizard, setShowAddWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  // Three-dot ellipsis menu states
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Auto-close three-dot popovers when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  const filtered = associates.filter((a) => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    const matchRegion = regionFilter === 'All' || a.region === regionFilter
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    return matchSearch && matchRegion && matchStatus
  })

  const totalCommission = associates.reduce((s, a) => s + a.commission, 0)
  const totalDisbursed  = associates.reduce((s, a) => s + a.disbursed, 0)

  const openAddModal = () => {
    setModalMode('add')
    setFormData(emptyAssociate)
    setShowAddWizard(true)
    setWizardStep(1)
  }

  const openEditModal = (associate) => {
    setModalMode('edit')
    setFormData(associate)
    setModalOpen(true)
  }

  const openViewModal = (associate) => {
    setModalMode('view')
    setFormData(associate)
    setModalOpen(true)
  }

  const saveAssociate = () => {
    if (!formData.name || !formData.email) {
      addToast('Name and email are required.', 'error')
      return
    }
    const payload = {
      ...formData,
      clients: Number(formData.clients),
      disbursed: Number(formData.disbursed),
      commission: Number(formData.commission),
    }
    if (modalMode === 'edit') {
      updateAssociate(payload)
      addToast('Associate updated successfully.', 'success')
    } else {
      addAssociate(payload)
      addToast('Associate added successfully.', 'success')
    }
    setModalOpen(false)
  }

  if (showAddWizard) {
    return (
      <DashboardLayout>
        <div className="data-page">
          <div className="data-page-header">
            <div>
              <h2 className="data-page-title">Register New Associate</h2>
              <p className="data-page-sub">Step-by-step credentials allocation and region mapping</p>
            </div>
            <button className="data-btn data-btn-outline" onClick={() => setShowAddWizard(false)}>Cancel Registration</button>
          </div>

          <div className="wizard-container">
            <div className="wizard-steps-header">
              <div className={`wizard-step-indicator ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
                <span className="wizard-step-label-num">Step 1</span>
                <span className="wizard-step-label-title">Contact & Regional Mapping</span>
              </div>
              <div className={`wizard-step-indicator ${wizardStep === 2 ? 'active' : ''}`}>
                <span className="wizard-step-label-num">Step 2</span>
                <span className="wizard-step-label-title">Activation & Performance Metrics</span>
              </div>
            </div>

            <div className="wizard-form-body">
              {wizardStep === 1 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title">🤝 Setup Contact & Operation Hub</h3>
                  <div className="form-grid">
                    <label>
                      Associate Name *
                      <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </label>
                    <label>
                      Contact Phone
                      <input type="tel" placeholder="Mobile Number" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </label>
                    <label className="form-grid-full">
                      Email Address *
                      <input type="email" placeholder="associate@email.com" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </label>
                    <label className="form-grid-full">
                      Operation Region / Hub
                      <HybridLocationPicker value={formData.region || ''} onChange={(value) => setFormData({ ...formData, region: value })} />
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title">📈 Metric baselines & Status</h3>
                  <div className="form-grid">
                    <label>
                      Joined Date
                      <input type="date" value={formData.joined || ''} onChange={(e) => setFormData({ ...formData, joined: e.target.value })} />
                    </label>
                    <label>
                      Active Clients
                      <input type="number" min="0" placeholder="Active client count" value={formData.clients || ''} onChange={(e) => setFormData({ ...formData, clients: e.target.value })} />
                    </label>
                    <label>
                      Total Disbursed (₹)
                      <input type="number" min="0" placeholder="Total portfolio disbursed" value={formData.disbursed || ''} onChange={(e) => setFormData({ ...formData, disbursed: e.target.value })} />
                    </label>
                    <label>
                      Commission Paid (₹)
                      <input type="number" min="0" placeholder="Commission earnings to date" value={formData.commission || ''} onChange={(e) => setFormData({ ...formData, commission: e.target.value })} />
                    </label>
                    <label className="form-grid-full">
                      Activation Status
                      <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-actions">
              <button
                type="button"
                className="data-btn data-btn-outline"
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(s => s - 1)}
              >
                Back
              </button>
              {wizardStep < 2 ? (
                <button
                  type="button"
                  className="data-btn data-btn-primary"
                  onClick={() => {
                    if (!formData.name || !formData.email) {
                      addToast('Associate name and email are required to proceed.', 'error');
                      return;
                    }
                    setWizardStep(s => s + 1);
                  }}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="data-btn data-btn-primary"
                  style={{ background: '#10b981' }}
                  onClick={() => {
                    if (!formData.name || !formData.email) {
                      addToast('Associate name and email are required to submit.', 'error');
                      return;
                    }
                    saveAssociate();
                    setShowAddWizard(false);
                  }}
                >
                  Complete Registration & Save
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Associates Book</h2>
            <p className="data-page-sub">{associates.length} registered associates</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openAddModal}>+ Add Associate</button>
        </div>

        {/* Summary */}
        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Total Associates</div>
            <div className="data-summary-value">{associates.length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Active</div>
            <div className="data-summary-value">{associates.filter(a => a.status === 'active').length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Total Disbursed</div>
            <div className="data-summary-value accent">{formatAmount(totalDisbursed)}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Commission Paid</div>
            <div className="data-summary-value">{formatAmount(totalCommission)}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search by name or region..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={regionFilter} onChange={e => setRegion(e.target.value)}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="data-filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option>All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="data-btn data-btn-outline">Export</button>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Associate</th>
                <th>Region</th>
                <th>Clients</th>
                <th>Total Disbursed</th>
                <th>Commission</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="data-empty">
                    <div className="data-empty-icon">🔍</div>
                    <div className="data-empty-title">No associates found</div>
                    <div className="data-empty-sub">Try adjusting your search or filters</div>
                  </div>
                </td></tr>
              ) : filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="cell-name">
                      <div className="cell-avatar blue">{a.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-muted">{a.region}</td>
                  <td style={{ fontWeight: 600 }}>{a.clients}</td>
                  <td className="cell-amount">{formatAmount(a.disbursed)}</td>
                  <td className="cell-amount">{formatAmount(a.commission)}</td>
                  <td className="cell-muted">{a.joined}</td>
                  <td><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                  <td>
                    <div className="action-menu-container">
                      <button
                        type="button"
                        className="three-dot-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === a.id ? null : a.id);
                        }}
                        aria-label="Actions"
                      >
                        ⋮
                      </button>
                      {activeMenuId === a.id && (
                        <div className="action-popover" onClick={(e) => e.stopPropagation()}>
                          <button className="popover-item" onClick={() => { openViewModal(a); setActiveMenuId(null); }}>
                            👁️ View details
                          </button>
                          <button className="popover-item" onClick={() => { openEditModal(a); setActiveMenuId(null); }}>
                            ✏️ Edit record
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="data-pagination">
              <span className="data-pagination-info">Showing {filtered.length} of {associates.length} associates</span>
              <div className="data-pagination-btns">
                <button className="data-page-btn" disabled>‹</button>
                <button className="data-page-btn active">1</button>
                <button className="data-page-btn">›</button>
              </div>
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal title={modalMode === 'view' ? 'Associate details' : modalMode === 'edit' ? 'Edit associate' : 'Add associate'} onClose={() => setModalOpen(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  🤝 Associate Identity
                </h4>
                <div className="form-grid">
                  <label>
                    Associate Name
                    <input type="text" value={formData.name} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </label>
                  <label>
                    Contact Phone
                    <input type="tel" value={formData.phone} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </label>
                  <label>
                    Email Address
                    <input type="email" value={formData.email} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </label>
                  <label>
                    Joined Date
                    <input type="date" value={formData.joined} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, joined: e.target.value })} />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  📈 Performance Metrics
                </h4>
                <div className="form-grid">
                  <label>
                    Operation Region
                    <HybridLocationPicker value={formData.region || ''} disabled={modalMode === 'view'} onChange={(value) => setFormData({ ...formData, region: value })} />
                  </label>
                  <label>
                    Active Clients
                    <input type="number" min="0" value={formData.clients} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, clients: e.target.value })} />
                  </label>
                  <label>
                    Total Disbursed (₹)
                    <input type="number" min="0" value={formData.disbursed} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, disbursed: e.target.value })} />
                  </label>
                  <label>
                    Commission (₹)
                    <input type="number" min="0" value={formData.commission} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, commission: e.target.value })} />
                  </label>
                  <label className="form-grid-full">
                    Activation Status
                    <select value={formData.status} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button type="button" className="admin-primary-btn" onClick={saveAssociate}>Save</button>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
