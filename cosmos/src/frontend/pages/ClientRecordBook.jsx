import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import './DataPage.css'

const statusClass = (s) => 'status-badge status-' + s.toLowerCase().replace(' ', '-')

function formatAmount(n) {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

const LOAN_TYPES = ['All', 'Home Loan', 'Business Loan', 'Personal Loan', 'Gold Loan', 'Mortgage']
const STATUSES   = ['All', 'Enquiry', 'Processing', 'Approved', 'Disbursed', 'Closed']

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
        list="indian-major-cities"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type custom or choose major city..."
        style={{ width: '100%' }}
      />
      <datalist id="indian-major-cities">
        {MAJOR_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>
    </div>
  )
}

const emptyClient = {
  name: '', phone: '', email: '', loan_type: 'Home Loan', amount: 0,
  status: 'Enquiry', file_no: '', date: new Date().toISOString().slice(0, 10), associate: '', id: null,
  pan_card: '', aadhaar_number: '', residential_status: 'Resident Indian',
  employment_status: 'Salaried', monthly_net_income: '', co_applicant_income: '',
  dwelling_status: 'Owned', tenure_at_address: '', location: ''
}

export default function ClientRecordBook() {
  const { clients, addClient, updateClient } = useAppState()
  const { addToast } = useToast()
  const [search, setSearch]     = useState('')
  const [loanFilter, setLoan]   = useState('All')
  const [statusFilter, setStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [formData, setFormData]   = useState(emptyClient)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 5

  // Stepper Wizard states
  const [showAddWizard, setShowAddWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  // Three-dot ellipsis menu states
  const [activeMenuId, setActiveMenuId] = useState(null)

  // KYC Mock document upload statuses per client ID
  const [clientDocs, setClientDocs] = useState({
    'C001': { 'PAN Card': 'success', 'Aadhaar Card': 'success', 'IT Return': 'success', 'Bank Statement': 'pending' },
    'C002': { 'PAN Card': 'success', 'Aadhaar Card': 'success', 'IT Return': 'pending', 'Bank Statement': 'success' },
    'C003': { 'PAN Card': 'success', 'Aadhaar Card': 'success', 'IT Return': 'pending', 'Bank Statement': 'pending' },
  })
  const [uploadProgress, setUploadProgress] = useState({}) // { docType: progress }

  // Auto-close three-dot popovers when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, loanFilter, statusFilter])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.file_no.includes(q) || c.phone.includes(q)
    const matchLoan   = loanFilter === 'All' || c.loan_type === loanFilter
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchLoan && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedClients = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const totalDisbursed = clients
    .filter(c => ['Approved','Disbursed'].includes(c.status))
    .reduce((s, c) => s + c.amount, 0)

  const openAddModal = () => {
    setModalMode('add')
    setFormData(emptyClient)
    setShowAddWizard(true)
    setWizardStep(1)
  }

  const openEditModal = (client) => {
    setModalMode('edit')
    setFormData(client)
    setModalOpen(true)
  }

  const openViewModal = (client) => {
    setModalMode('view')
    setFormData(client)
    setModalOpen(true)
  }

  const saveClient = () => {
    if (!formData.name || !formData.file_no) {
      addToast('Client name and file number are required.', 'error')
      return
    }
    const payload = { ...formData, amount: Number(formData.amount) }
    if (modalMode === 'edit') {
      updateClient(payload)
      addToast('Client updated successfully.', 'success')
    } else {
      addClient(payload)
      addToast('Client added successfully.', 'success')
    }
    setModalOpen(false)
  }

  if (showAddWizard) {
    return (
      <DashboardLayout>
        <div className="data-page">
          <div className="data-page-header">
            <div>
              <h2 className="data-page-title">Onboard New Client</h2>
              <p className="data-page-sub">Step-by-step institutional compliance and profiling wizard</p>
            </div>
            <button className="data-btn data-btn-outline" onClick={() => setShowAddWizard(false)}>Cancel Onboarding</button>
          </div>

          <div className="wizard-container">
            <div className="wizard-steps-header">
              <div className={`wizard-step-indicator ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
                <span className="wizard-step-label-num">Step 1</span>
                <span className="wizard-step-label-title">Identity & Contacts</span>
              </div>
              <div className={`wizard-step-indicator ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
                <span className="wizard-step-label-num">Step 2</span>
                <span className="wizard-step-label-title">Financial & Income Profile</span>
              </div>
              <div className={`wizard-step-indicator ${wizardStep === 3 ? 'active' : ''}`}>
                <span className="wizard-step-label-num">Step 3</span>
                <span className="wizard-step-label-title">Lending & Assignment</span>
              </div>
            </div>

            <div className="wizard-form-body">
              {wizardStep === 1 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title">👤 Verify Identity & Setup Contacts</h3>
                  <div className="form-grid">
                    <label>
                      Client Name *
                      <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </label>
                    <label>
                      Phone Number
                      <input type="text" placeholder="Mobile Number" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </label>
                    <label className="form-grid-full">
                      Email Address
                      <input type="email" placeholder="client@email.com" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </label>
                    <label>
                      PAN Card Number
                      <input type="text" placeholder="ABCDE1234F" value={formData.pan_card || ''} onChange={(e) => setFormData({ ...formData, pan_card: e.target.value.toUpperCase() })} />
                    </label>
                    <label>
                      Aadhaar Number
                      <input type="text" placeholder="12-digit Aadhaar number" value={formData.aadhaar_number || ''} onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })} />
                    </label>
                    <label>
                      Residential Status
                      <select value={formData.residential_status || 'Resident Indian'} onChange={(e) => setFormData({ ...formData, residential_status: e.target.value })}>
                        <option value="Resident Indian">Resident Indian</option>
                        <option value="NRI">NRI</option>
                        <option value="PIO">PIO</option>
                        <option value="Foreign National">Foreign National</option>
                      </select>
                    </label>
                    <label>
                      Location / City
                      <HybridLocationPicker value={formData.location || ''} onChange={(value) => setFormData({ ...formData, location: value })} />
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title">💼 Employment, Income & Stability Profile</h3>
                  <div className="form-grid">
                    <label>
                      Employment Status
                      <select value={formData.employment_status || 'Salaried'} onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}>
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Professional">Professional</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </label>
                    <label>
                      Monthly Net Income (₹)
                      <input type="number" min="0" placeholder="Monthly Take Home" value={formData.monthly_net_income || ''} onChange={(e) => setFormData({ ...formData, monthly_net_income: e.target.value })} />
                    </label>
                    <label>
                      Co-Applicant Net Income (₹)
                      <input type="number" min="0" placeholder="Co-Applicant Monthly Take Home" value={formData.co_applicant_income || ''} onChange={(e) => setFormData({ ...formData, co_applicant_income: e.target.value })} />
                    </label>
                    <label>
                      Dwelling Ownership Status
                      <select value={formData.dwelling_status || 'Owned'} onChange={(e) => setFormData({ ...formData, dwelling_status: e.target.value })}>
                        <option value="Owned">Owned</option>
                        <option value="Rented">Rented</option>
                        <option value="Company Provided">Company Provided</option>
                        <option value="Mortgaged">Mortgaged</option>
                      </select>
                    </label>
                    <label className="form-grid-full">
                      Tenure at Current Address (Years)
                      <input type="number" min="0" placeholder="Years of occupancy" value={formData.tenure_at_address || ''} onChange={(e) => setFormData({ ...formData, tenure_at_address: e.target.value })} />
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title">💰 Lending Parameters & Office Assignment</h3>
                  <div className="form-grid">
                    <label>
                      File No. *
                      <input type="text" placeholder="e.g. F-983" value={formData.file_no || ''} onChange={(e) => setFormData({ ...formData, file_no: e.target.value })} />
                    </label>
                    <label>
                      Loan Type
                      <select value={formData.loan_type} onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}>
                        {LOAN_TYPES.slice(1).map((loan) => <option key={loan} value={loan}>{loan}</option>)}
                      </select>
                    </label>
                    <label>
                      Amount (₹)
                      <input type="number" min="0" placeholder="Requested Amount" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                    </label>
                    <label>
                      Application Date
                      <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                    </label>
                    <label>
                      Assigned Associate
                      <input type="text" placeholder="Associate Name" value={formData.associate || ''} onChange={(e) => setFormData({ ...formData, associate: e.target.value })} />
                    </label>
                    <label>
                      Workflow Status
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        {STATUSES.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}
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
              {wizardStep < 3 ? (
                <button
                  type="button"
                  className="data-btn data-btn-primary"
                  onClick={() => {
                    if (wizardStep === 1 && !formData.name) {
                      addToast('Client name is required to proceed.', 'error');
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
                    if (!formData.name || !formData.file_no) {
                      addToast('Client name and file number are required to submit.', 'error');
                      return;
                    }
                    saveClient();
                    setShowAddWizard(false);
                  }}
                >
                  Complete Onboarding & Save
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

        {/* Header */}
        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Client Record Book</h2>
            <p className="data-page-sub">{clients.length} total clients</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openAddModal}>+ Add Client</button>
        </div>

        {/* Summary */}
        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Total Clients</div>
            <div className="data-summary-value">{clients.length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Active Files</div>
            <div className="data-summary-value">{clients.filter(c => c.status === 'Processing').length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Approved</div>
            <div className="data-summary-value">{clients.filter(c => c.status === 'Approved').length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Total Disbursed</div>
            <div className="data-summary-value accent">{formatAmount(totalDisbursed)}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search by name, file no, phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={loanFilter} onChange={e => setLoan(e.target.value)}>
            {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="data-filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="data-btn data-btn-outline">Export</button>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>File No.</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Associate</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="data-empty">
                    <div className="data-empty-icon">🔍</div>
                    <div className="data-empty-title">No clients found</div>
                    <div className="data-empty-sub">Try adjusting your search or filters</div>
                  </div>
                </td></tr>
              ) : paginatedClients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-name">
                      <div className="cell-avatar">{c.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-muted">{c.file_no}</td>
                  <td>{c.loan_type}</td>
                  <td className="cell-amount">{formatAmount(c.amount)}</td>
                  <td className="cell-muted">{c.associate}</td>
                  <td className="cell-muted">{c.date}</td>
                  <td><span className={statusClass(c.status)}>{c.status}</span></td>
                  <td>
                    <div className="action-menu-container">
                      <button
                        type="button"
                        className="three-dot-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === c.id ? null : c.id);
                        }}
                        aria-label="Actions"
                      >
                        ⋮
                      </button>
                      {activeMenuId === c.id && (
                        <div className="action-popover" onClick={(e) => e.stopPropagation()}>
                          <button className="popover-item" onClick={() => { openViewModal(c); setActiveMenuId(null); }}>
                            👁️ View details
                          </button>
                          <button className="popover-item" onClick={() => { openEditModal(c); setActiveMenuId(null); }}>
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
              <span className="data-pagination-info">
                Showing {Math.min(filtered.length, (currentPage - 1) * PAGE_SIZE + 1)} to {Math.min(filtered.length, currentPage * PAGE_SIZE)} of {filtered.length} clients
              </span>
              <div className="data-pagination-btns">
                <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={`data-page-btn${currentPage === i + 1 ? ' active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal title={modalMode === 'view' ? 'Client details' : modalMode === 'edit' ? 'Edit client' : 'Add client'} onClose={() => setModalOpen(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  👤 Personal Details
                </h4>
                <div className="form-grid">
                  <label>
                    Client Name
                    <input type="text" value={formData.name} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </label>
                  <label>
                    Phone Number
                    <input type="text" value={formData.phone} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </label>
                  <label className="form-grid-full">
                    Email Address
                    <input type="email" value={formData.email} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  📋 KYC & Identification Profile
                </h4>
                <div className="form-grid">
                  <label>
                    PAN Card Number
                    <input type="text" placeholder="e.g. ABCDE1234F" value={formData.pan_card || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, pan_card: e.target.value.toUpperCase() })} />
                  </label>
                  <label>
                    Aadhaar Number
                    <input type="text" placeholder="12-digit Aadhaar number" value={formData.aadhaar_number || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })} />
                  </label>
                  <label>
                    Residential Status
                    <select value={formData.residential_status || 'Resident Indian'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, residential_status: e.target.value })}>
                      <option value="Resident Indian">Resident Indian</option>
                      <option value="NRI">NRI</option>
                      <option value="PIO">PIO</option>
                      <option value="Foreign National">Foreign National</option>
                    </select>
                  </label>
                  <label>
                    Location / City
                    <HybridLocationPicker value={formData.location || ''} disabled={modalMode === 'view'} onChange={(value) => setFormData({ ...formData, location: value })} />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  💼 Employment & Financial Profile
                </h4>
                <div className="form-grid">
                  <label>
                    Employment Status
                    <select value={formData.employment_status || 'Salaried'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}>
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Professional">Professional</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </label>
                  <label>
                    Monthly Net Income (₹)
                    <input type="number" min="0" value={formData.monthly_net_income || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, monthly_net_income: e.target.value })} />
                  </label>
                  <label>
                    Co-Applicant Net Income (₹)
                    <input type="number" min="0" value={formData.co_applicant_income || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, co_applicant_income: e.target.value })} />
                  </label>
                  <label>
                    Dwelling Ownership Status
                    <select value={formData.dwelling_status || 'Owned'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, dwelling_status: e.target.value })}>
                      <option value="Owned">Owned</option>
                      <option value="Rented">Rented</option>
                      <option value="Company Provided">Company Provided</option>
                      <option value="Mortgaged">Mortgaged</option>
                    </select>
                  </label>
                  <label className="form-grid-full">
                    Tenure at Current Address (Years)
                    <input type="number" min="0" value={formData.tenure_at_address || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, tenure_at_address: e.target.value })} />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  💰 Lending Parameters
                </h4>
                <div className="form-grid">
                  <label>
                    File No.
                    <input type="text" value={formData.file_no} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, file_no: e.target.value })} />
                  </label>
                  <label>
                    Loan Type
                    <select value={formData.loan_type} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}>
                      {LOAN_TYPES.slice(1).map((loan) => <option key={loan} value={loan}>{loan}</option>)}
                    </select>
                  </label>
                  <label>
                    Amount (₹)
                    <input type="number" min="0" value={formData.amount} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                  </label>
                  <label>
                    Application Date
                    <input type="date" value={formData.date} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  🏢 Status & Assignment
                </h4>
                <div className="form-grid">
                  <label>
                    Assigned Associate
                    <input type="text" value={formData.associate} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, associate: e.target.value })} />
                  </label>
                  <label>
                    Workflow Status
                    <select value={formData.status} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      {STATUSES.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>
            {modalMode !== 'add' && (
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                  <span>📁</span> KYC Documents Verification
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {['PAN Card', 'Aadhaar Card', 'IT Return', 'Bank Statement'].map((doc) => {
                    const clientKey = formData.id || 'new'
                    const clientDocStatus = (clientDocs[clientKey] && clientDocs[clientKey][doc]) || 'pending'
                    const progress = uploadProgress[doc]

                    return (
                      <div key={doc} style={{
                        display: 'flex', alignItems: 'center',
                        padding: '10px 14px', borderRadius: 8, background: 'var(--bg-muted)',
                        border: '1px solid var(--border)', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>
                            {clientDocStatus === 'success' ? '✅' : progress !== undefined ? '⏳' : '📄'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>{doc}</div>
                            {progress !== undefined && progress < 100 && (
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Uploading: {progress}%</div>
                            )}
                          </div>
                        </div>

                        <div>
                          {clientDocStatus === 'success' ? (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                              background: '#dcfce7', color: '#16a34a'
                            }}>Verified</span>
                          ) : progress !== undefined && progress < 100 ? (
                            <div style={{ width: 80, height: 6, background: 'var(--border-input)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)' }} />
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="row-btn"
                              style={{ padding: '3px 8px', fontSize: 11, background: 'var(--bg-surface)' }}
                              onClick={() => {
                                setUploadProgress(prev => ({ ...prev, [doc]: 0 }))
                                let currentProgress = 0
                                const interval = setInterval(() => {
                                  currentProgress += 20
                                  setUploadProgress(prev => ({ ...prev, [doc]: currentProgress }))
                                  if (currentProgress >= 100) {
                                    clearInterval(interval)
                                    setClientDocs(prev => {
                                      const old = prev[clientKey] || {}
                                      return {
                                        ...prev,
                                        [clientKey]: { ...old, [doc]: 'success' }
                                      }
                                    })
                                    setUploadProgress(prev => {
                                      const copy = { ...prev }
                                      delete copy[doc]
                                      return copy
                                    })
                                    addToast(`${doc} uploaded and verified successfully.`, 'success')
                                  }
                                }, 150)
                              }}
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button type="button" className="admin-primary-btn" onClick={saveClient}>Save</button>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
