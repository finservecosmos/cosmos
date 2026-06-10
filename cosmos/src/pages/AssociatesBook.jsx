import { useState, useEffect } from 'react'
import DashboardLayout from '../widgets/DashboardLayout'
import Modal from '../shared/ui/Modal'
import { useAppState } from '../context/AppStateContext'
import { nextAssociateId } from '../context/AppStateContext'
import { useToast } from '../context/ToastContext'
import '../shared/ui/DataPage.css'
import { Users, TrendingUp, Search, Eye, Edit, Banknote, Coins } from 'lucide-react'

function formatAmount(n) {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}



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
  name: '', email: '', phone: '', clients: 0,
  disbursed: 0, commission: 0, joined: new Date().toISOString().slice(0, 10), id: null,
  associate_id: '', expertise: '', vintage: '', financial_institution: '', institution_type: 'Bank', branch: ''
}

export default function AssociatesBook() {
  const { associates, addAssociate, updateAssociate } = useAppState()
  const { addToast } = useToast()
  const [search, setSearch]       = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [formData, setFormData]   = useState(emptyAssociate)



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
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    return matchSearch
  })

  const totalCommission = associates.reduce((s, a) => s + a.commission, 0)
  const totalDisbursed  = associates.reduce((s, a) => s + a.disbursed, 0)

  const openAddModal = async () => {
    setModalMode('add')
    const generatedId = await nextAssociateId()
    setFormData({ ...emptyAssociate, associate_id: generatedId })
    setModalOpen(true)
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
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#3b82f6', background: '#dbeafe' }}>
                <Users size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Associates</div>
              <div className="kpi-value">{associates.length}</div>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a', background: '#dcfce7' }}>
                <Banknote size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Disbursed</div>
              <div className="kpi-value">{formatAmount(totalDisbursed)}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#d97706', background: '#fef3c7' }}>
                <Coins size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Commission Paid</div>
              <div className="kpi-value">{formatAmount(totalCommission)}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="data-btn data-btn-outline">Export</button>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Associate</th>

                <th>Clients</th>
                <th>Total Disbursed</th>
                <th>Commission</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="data-empty">
                    <div className="data-empty-icon"><Search size={48} /></div>
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
                        <div style={{ fontWeight: 600 }}>{a.name} {a.associate_id ? `(${a.associate_id})` : ''}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>{a.email}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ fontWeight: 600 }}>{a.clients}</td>
                  <td className="cell-amount">{formatAmount(a.disbursed)}</td>
                  <td className="cell-amount">{formatAmount(a.commission)}</td>
                  <td className="cell-muted">{a.joined}</td>
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
                            <Eye size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> View details
                          </button>
                          <button className="popover-item" onClick={() => { openEditModal(a); setActiveMenuId(null); }}>
                            <Edit size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Edit record
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
                  <Users size={14} style={{marginRight: 6, verticalAlign: "middle"}} /> Associate Identity
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
                  <label>
                    Associate ID
                    <input
                      type="text"
                      value={formData.associate_id || ''}
                      disabled
                      style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', cursor: 'not-allowed', fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </label>
                  <label>
                    Field of Expertise
                    <input type="text" value={formData.expertise || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, expertise: e.target.value })} />
                  </label>
                  <label>
                    Vintage
                    <input type="text" value={formData.vintage || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, vintage: e.target.value })} />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <Banknote size={14} style={{marginRight: 6, verticalAlign: "middle"}} /> Financial Institution Details
                </h4>
                <div className="form-grid">
                  <label>
                    Name of Financial Institution
                    <input type="text" value={formData.financial_institution || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, financial_institution: e.target.value })} />
                  </label>
                  <label>
                    Type of Financial Institution
                    <select value={formData.institution_type || 'Bank'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}>
                      <option value="Bank">Bank</option>
                      <option value="Non-bank">Non-bank</option>
                      <option value="Private Finance">Private Finance</option>
                    </select>
                  </label>
                  <label className="form-grid-full">
                    Branch
                    <input type="text" value={formData.branch || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <TrendingUp size={14} style={{marginRight: 6, verticalAlign: "middle"}} /> Performance Metrics
                </h4>
                <div className="form-grid">

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
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
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
