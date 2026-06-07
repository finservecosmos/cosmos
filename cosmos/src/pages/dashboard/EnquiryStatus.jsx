import { useState, useEffect } from 'react'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../../shared/lib/useConfirm'
import '../../shared/ui/DataPage.css'
import { Check, X, Phone, ClipboardList, CheckCircle, Ban, Search, AlertTriangle, Calendar, Eye, Edit, Trash2, TrendingUp, MapPin } from 'lucide-react'

/* ─── Constants ─────────────────────────────────────────────── */
const LOAN_TYPES = ['All Loan Types', 'Home Loan', 'Business Loan', 'Personal Loan', 'Gold Loan', 'Mortgage', 'Loan Against Property']
const PROFESSIONS = ['Salaried', 'Self Employed', 'Professional', 'Business Owner']

const MAJOR_LOCATIONS = [
  'Mumbai, MH', 'Delhi NCR', 'Bengaluru, KA', 'Kolkata, WB',
  'Chennai, TN', 'Hyderabad, TG', 'Pune, MH', 'Ahmedabad, GJ',
  'Jaipur, RJ', 'Lucknow, UP', 'Indore, MP', 'Kochi, KL', 'Patna, BR'
]

const STATUS_META = {
  Accepted: { color: '#16a34a', bg: 'var(--bg-hover)', border: '#bbf7d0', icon: <Check size={16} /> },
  Rejected: { color: '#dc2626', bg: 'var(--bg-hover)', border: '#fecaca', icon: <X size={16} /> },
  Callback: { color: '#d97706', bg: 'var(--bg-hover)', border: '#fed7aa', icon: <Phone size={16} /> },
  Others: { color: 'var(--text-muted)', bg: 'var(--bg-input)', border: 'var(--border)', icon: '…' },
  New: { color: '#2563eb', bg: 'var(--bg-hover)', border: '#bfdbfe', icon: '●' },
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatAmount(n) {
  if (!n) return '₹0'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function avatarLetters(name) {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#db2777', '#0891b2', '#65a30d']
function avatarColor(name) {
  if (!name) return '#7c3aed'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ─── Custom Autocomplete Picker ─────────────────────────────── */
function HybridLocationPicker({ value, onChange, disabled }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        list="indian-major-cities-enquiry"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type custom or choose major city..."
        style={{ width: '100%', boxSizing: 'border-box' }}
      />
      <datalist id="indian-major-cities-enquiry">
        {MAJOR_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, iconBg, subColor }) {
  return (
    <div className="kpi-card" style={{ flex: '1 1 0', minWidth: 0 }}>
      <div className="kpi-header">
        <div className="kpi-icon-wrap" style={{ background: iconBg }}>
          {icon}
        </div>
        {sub && <span className="kpi-tag" style={{ color: subColor || 'inherit' }}>{sub}</span>}
      </div>
      <div className="kpi-body">
        <div className="kpi-title">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  )
}

function StatusActionBtn({ status, active, onClick }) {
  const meta = STATUS_META[status] || {}
  const isActive = active === status
  return (
    <button
      onClick={() => onClick(status)}
      style={{
        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
        border: isActive ? `1.5px solid ${meta.color}` : `1.5px solid ${meta.border || 'var(--border)'}`,
        background: isActive ? meta.bg : '#fff',
        color: isActive ? meta.color : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {status === 'Accepted' && <Check size={16} color={meta.color} />}
      {status === 'Rejected' && <X size={16} color={meta.color} />}
      {status === 'Callback' && <Phone size={14} />}
      {status === 'Others' && <span style={{ color: meta.color }}>…</span>}
      {status}
    </button>
  )
}

const emptyEnquiry = {
  client_name: '', co_applicate_name: '', loan_type: 'Home Loan', loan_amount: 0,
  note: '', status: 'New', associate_name: 'Unassigned', profession: 'Salaried',
  id: null, client_mobile_number: '', location: '', bank_name: ''
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function EnquiryStatus() {
  const { enquiries, addEnquiry, updateEnquiry, removeEnquiry, addClient, associates } = useAppState()
  const { addToast } = useToast()
  const confirm = useConfirm()

  // Qualified lead to client record conversion overlay
  const [convertingLead, setConvertingLead] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatus] = useState('All')
  const [loanFilter, setLoan] = useState('All Loan Types')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Modal / wizard
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [formData, setFormData] = useState(emptyEnquiry)

  // Three-dot menu
  const [activeMenuId, setActiveMenuId] = useState(null)
  useEffect(() => {
    const handler = () => setActiveMenuId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  /* ── Filtering & Chronological Sorting ── */
  const applyFilters = (rows) => rows.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || (e.client_name && e.client_name.toLowerCase().includes(q))
      || (e.client_mobile_number && String(e.client_mobile_number).includes(q))
    const matchStatus = statusFilter === 'All' || e.status === statusFilter
    const matchLoan = loanFilter === 'All Loan Types' || e.loan_type === loanFilter
    let matchDate = true
    if (fromDate && e.created_at) matchDate = matchDate && e.created_at.slice(0, 10) >= fromDate
    if (toDate && e.created_at) matchDate = matchDate && e.created_at.slice(0, 10) <= toDate
    return matchSearch && matchStatus && matchLoan && matchDate
  })

  // Sort filtered descending by creation date/ID (newest first)
  const filtered = applyFilters(enquiries).sort((a, b) => {
    const dateA = a.created_at || ''
    const dateB = b.created_at || ''
    if (dateA && dateB) return dateB.localeCompare(dateA)
    return String(b.id || '').localeCompare(String(a.id || ''))
  })

  /* Group by loan type */
  const grouped = filtered.reduce((acc, e) => {
    const key = e.loan_type || 'Others'
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  /* ── Stat counts ── */
  const countBy = (s) => enquiries.filter(e => e.status === s).length
  const stats = [
    { label: 'New Enquiries', value: enquiries.length, sub: 'Total Enquiries', subColor: '#16a34a', icon: <ClipboardList size={20} color="#3b82f6" />, iconBg: 'var(--bg-hover)' },
    { label: 'Accepted', value: countBy('Accepted'), sub: 'Qualified Conversion', subColor: '#16a34a', icon: <CheckCircle size={20} color="#16a34a" />, iconBg: 'var(--bg-hover)' },
    { label: 'Callback', value: countBy('Callback'), sub: 'Follow-up Required', subColor: '#d97706', icon: <Phone size={16} />, iconBg: 'var(--bg-hover)' },
    { label: 'Rejected', value: countBy('Rejected'), sub: 'Not Approved', subColor: '#dc2626', icon: <Ban size={20} color="#dc2626" />, iconBg: 'var(--bg-hover)' },
  ]

  /* ── Inline status update ── */
  const handleInlineStatus = (enquiry, newStatus) => {
    if (enquiry.status === newStatus) return
    const updated = { ...enquiry, status: newStatus }
    updateEnquiry(updated)
    addToast(`Status updated to ${newStatus}`, 'success')

    // Trigger CRM transition if lead has been Accepted
    if (newStatus === 'Accepted') {
      setConvertingLead(updated)
    }
  }

  /* ── Modals ── */
  const openAddModal = () => {
    setModalMode('add')
    setFormData(emptyEnquiry)
    setModalOpen(true)
  }
  const openEditModal = (e) => { setModalMode('edit'); setFormData(e); setModalOpen(true) }
  const openViewModal = (e) => { setModalMode('view'); setFormData(e); setModalOpen(true) }

  const saveEnquiry = () => {
    if (!formData.client_name || !formData.client_mobile_number) {
      addToast('Client name and mobile number are required.', 'error')
      return
    }
    // Validation: Check 10 digit mobile phone number
    if (String(formData.client_mobile_number).length < 10) {
      addToast('Please enter a valid 10-digit mobile number.', 'error')
      return
    }
    // Validation: Duplicate lead check
    const isDuplicate = enquiries.some(
      (e) => e.client_mobile_number === Number(formData.client_mobile_number) && e.id !== formData.id
    )
    if (isDuplicate && modalMode === 'add') {
      addToast('An active enquiry lead already exists for this mobile number.', 'warning')
    }

    const payload = {
      ...formData,
      loan_amount: Number(formData.loan_amount || 0),
      client_mobile_number: Number(formData.client_mobile_number),
      created_at: formData.created_at || new Date().toISOString()
    }
    if (modalMode === 'edit') {
      updateEnquiry(payload)
      addToast('Enquiry updated successfully.', 'success')
      if (payload.status === 'Accepted') {
        setConvertingLead(payload)
      }
    } else {
      addEnquiry(payload)
      addToast('Enquiry added successfully.', 'success')
    }
    setModalOpen(false)
  }

  const clearFilters = () => {
    setSearch(''); setStatus('All'); setLoan('All Loan Types')
    setFromDate(''); setToDate('')
  }

  const handleDelete = async (enquiry) => {
    const ok = await confirm({
      title: 'Remove Enquiry?',
      message: `Are you sure you want to remove the enquiry for ${enquiry.client_name} (${enquiry.loan_type} of ${formatAmount(enquiry.loan_amount)})? This action cannot be undone.`,
      confirmLabel: 'Yes, Remove',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (ok) {
      removeEnquiry(enquiry.id)
      addToast('Enquiry removed successfully.', 'success')
    }
  }

  // Handle lead conversion
  const handleLeadConversion = () => {
    if (!convertingLead) return

    // Generate pre-filled client parameters
    const mockFileNo = `F-${Math.floor(1000 + Math.random() * 9000)}`
    const clientPayload = {
      id: null, // assigned dynamically by client provider
      name: convertingLead.client_name,
      phone: String(convertingLead.client_mobile_number),
      email: `${convertingLead.client_name.toLowerCase().replace(/ /g, '')}@email.com`,
      loan_type: convertingLead.loan_type,
      amount: Number(convertingLead.loan_amount || 0),
      status: 'Processing',
      file_no: mockFileNo,
      date: new Date().toISOString().slice(0, 10),
      associate: convertingLead.associate_name !== 'Unassigned' ? convertingLead.associate_name : '',
      location: convertingLead.location || '',
      employment_status: convertingLead.profession === 'Salaried' ? 'Salaried' : 'Self-Employed',
      pan_card: '',
      aadhaar_number: '',
      residential_status: 'Resident Indian',
      monthly_net_income: '',
      co_applicant_income: '',
      dwelling_status: 'Owned',
      tenure_at_address: ''
    }

    addClient(clientPayload)
    addToast(`Successfully converted ${convertingLead.client_name} into a qualified Client Record file!`, 'success')
    setConvertingLead(null)
  }

  /* ══════════════════════════════════════════
     Main List View
  ══════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="data-page">

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Enquiry Status</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Track and manage the status of all loan enquiries.</p>
          </div>
          <button
            onClick={openAddModal}
            style={{
              background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(229,62,62,0.3)'
            }}
          >
            + Add New Enquiry
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="kpi-row" style={{ marginBottom: 24 }}>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Filter Panel ── */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid #f0f0f0',
          padding: '20px 24px', marginBottom: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Date + Search + Category row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-surface)', outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-surface)', outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Customer Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px 8px 32px',
                    fontSize: 13, color: 'var(--text-secondary)', width: '100%', outline: 'none', background: 'var(--bg-surface)'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Category</label>
              <select
                value={loanFilter}
                onChange={(e) => setLoan(e.target.value)}
                style={{
                  border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-surface)', outline: 'none', cursor: 'pointer'
                }}
              >
                {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button
              onClick={clearFilters}
              style={{
                background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                alignSelf: 'flex-end'
              }}
            >
              Clear
            </button>
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginRight: 4 }}>Filter Status:</span>
            {['All', 'Accepted', 'Rejected', 'Callback', 'Others'].map((s) => {
              const isActive = statusFilter === s
              const meta = STATUS_META[s] || {}
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    border: isActive
                      ? (s === 'All' ? '2px solid #e53e3e' : `1.5px solid ${meta.color}`)
                      : '1.5px solid #e5e7eb',
                    background: isActive
                      ? (s === 'All' ? '#e53e3e' : meta.bg)
                      : '#fff',
                    color: isActive
                      ? (s === 'All' ? '#fff' : meta.color)
                      : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Grouped Enquiry List ── */}
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-faint)', fontSize: 15 }}>
            No enquiries found. Try adjusting your filters.
          </div>
        ) : (
          Object.entries(grouped).map(([loanType, rows]) => (
            <div key={loanType} style={{ marginBottom: 28 }}>
              {/* Loan Type Section Header */}
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: 10
              }}>
                {loanType}
              </div>

              <div style={{
                background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid #f0f0f0',
                overflow: 'visible', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}>
                {rows.map((e, idx) => {
                  const initials = avatarLetters(e.client_name)
                  const bgColor = avatarColor(e.client_name)
                  const meta = STATUS_META[e.status] || STATUS_META['Others']

                  // Calculate SLA stale status (> 48 hours for New/Callback)
                  const isStale = (e.status === 'New' || e.status === 'Callback') && e.created_at && (
                    (Date.now() - new Date(e.created_at).getTime()) > 48 * 60 * 60 * 1000
                  )

                  return (
                    <div
                      key={e.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 20px',
                        borderTop: idx > 0 ? '1px solid #f5f5f5' : 'none',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: bgColor, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, flexShrink: 0
                      }}>
                        {initials}
                      </div>

                      {/* Name + phone + date */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{e.client_name}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                            background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`
                          }}>
                            {e.status === 'Accepted' ? '● ' : ''}
                            {e.status}
                          </span>
                          {isStale && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                              background: 'var(--bg-hover)', color: '#b45309', border: '1px solid #fde68a',
                              display: 'inline-flex', alignItems: 'center', gap: 3
                            }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} /> SLA Breach</span>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                          {e.profession} • +91 {e.client_mobile_number}
                          {e.created_at ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}> • <Calendar size={12} /> {e.created_at.slice(0, 10)}</span> : ''}
                          {e.location ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}> • <MapPin size={12} /> {e.location}</span> : ''}
                        </div>
                      </div>

                      {/* Inline status action buttons */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                        {['Accepted', 'Rejected', 'Callback', 'Others'].map((s) => (
                          <StatusActionBtn key={s} status={s} active={e.status} onClick={(ns) => handleInlineStatus(e, ns)} />
                        ))}
                      </div>

                      {/* Amount + bank */}
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 110 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                          {formatAmount(e.loan_amount)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                          {e.bank_name || '—'}
                          {e.associate_name && e.associate_name !== 'Unassigned' ? ` • ${e.associate_name}` : ''}
                        </div>
                      </div>

                      {/* Three-dot menu */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); setActiveMenuId(activeMenuId === e.id ? null : e.id) }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 20, color: 'var(--text-faint)', padding: '4px 6px', borderRadius: 6,
                            lineHeight: 1
                          }}
                          aria-label="Actions"
                        >
                          ⋮
                        </button>
                        {activeMenuId === e.id && (
                          <div
                            onClick={(ev) => ev.stopPropagation()}
                            style={{
                              position: 'absolute', right: 0, top: '110%', zIndex: 999,
                              background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid #e5e7eb',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: 180, overflow: 'visible'
                            }}
                          >
                            <button
                              className="popover-item"
                              style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text-secondary)' }}
                              onClick={() => { openViewModal(e); setActiveMenuId(null) }}
                            >
                              <Eye size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> View details
                            </button>
                            <button
                              className="popover-item"
                              style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text-secondary)' }}
                              onClick={() => { openEditModal(e); setActiveMenuId(null) }}
                            >
                              <Edit size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Update / Assign
                            </button>
                            <div style={{ borderTop: '1px solid #f5f5f5', margin: '4px 0' }} />
                            <button
                              className="popover-item"
                              style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#dc2626' }}
                              onClick={() => { handleDelete(e); setActiveMenuId(null) }}
                            >
                              <Trash2 size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Remove Enquiry
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* ── View / Edit / Add Modal ── */}
        {modalOpen && (
          <Modal
            title={modalMode === 'view' ? 'Enquiry Details' : modalMode === 'edit' ? 'Update Enquiry' : 'Add New Enquiry'}
            onClose={() => setModalOpen(false)}
          >
            <div className="form-grid">
              <label>Applicant Name
                <input type="text" value={formData.client_name} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
              </label>
              <label>Co-Applicant Name
                <input type="text" value={formData.co_applicate_name || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, co_applicate_name: e.target.value })} />
              </label>
              <label>Mobile Number
                <input type="number" value={formData.client_mobile_number || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, client_mobile_number: e.target.value })} />
              </label>
              <label>Profession
                <select value={formData.profession || 'Salaried'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, profession: e.target.value })}>
                  {PROFESSIONS.map((prof) => <option key={prof} value={prof}>{prof}</option>)}
                </select>
              </label>
              <label>Location / City
                <HybridLocationPicker value={formData.location || ''} disabled={modalMode === 'view'} onChange={(value) => setFormData({ ...formData, location: value })} />
              </label>
              <label>Bank Name
                <input type="text" placeholder="e.g. HDFC Bank" value={formData.bank_name || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} />
              </label>
              <label>Loan Type
                <select value={formData.loan_type} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}>
                  {LOAN_TYPES.slice(1).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label>Loan Amount (₹)
                <input type="number" min="0" value={formData.loan_amount || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })} />
              </label>
              <label>Assigned Associate
                <select
                  value={formData.associate_name || 'Unassigned'}
                  disabled={modalMode === 'view'}
                  onChange={(e) => setFormData({ ...formData, associate_name: e.target.value })}
                >
                  <option value="Unassigned">Unassigned</option>
                  {associates.map((assoc) => (
                    <option key={assoc.id} value={assoc.name}>
                      {assoc.name} ({assoc.clients} active clients)
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-grid-full">Notes & Description
                <textarea rows={4} value={formData.note} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Loan details, remarks, follow-up notes..." />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button type="button" className="admin-primary-btn" onClick={saveEnquiry}>Save</button>
              )}
            </div>
          </Modal>
        )}


        {/* ── Convert Lead to Client Confirmation Overlay ── */}
        {convertingLead && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
            onClick={() => setConvertingLead(null)}
          >
            <div
              onClick={(ev) => ev.stopPropagation()}
              style={{
                background: 'var(--bg-surface)', borderRadius: 16, width: 440, maxWidth: '90vw',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden'
              }}
            >
              {/* Green top bar */}
              <div style={{ background: 'var(--bg-hover)', padding: '24px 24px 16px', borderBottom: '1px solid #bbf7d0' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#dcfce7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 12
                }}><TrendingUp size={24} /></div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#14532d' }}>Convert to Client Record?</div>
                <div style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>
                  This qualified lead will automatically be converted to a Client File.
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{
                  background: 'var(--bg-input)', borderRadius: 10, padding: '14px 16px',
                  border: '1px solid #f0f0f0', marginBottom: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: avatarColor(convertingLead.client_name),
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13, flexShrink: 0
                    }}>
                      {avatarLetters(convertingLead.client_name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{convertingLead.client_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {convertingLead.loan_type} • {formatAmount(convertingLead.loan_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setConvertingLead(null)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e5e7eb',
                      background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                    }}
                  >
                    Keep as Lead
                  </button>
                  <button
                    onClick={handleLeadConversion}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                      background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
                    }}
                  >
                    Yes, Convert Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
