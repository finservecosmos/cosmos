import { useState, useEffect } from 'react'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { nextClientId } from '../../shared/lib/idGenerator'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../../shared/lib/useConfirm'
import '../../shared/ui/DataPage.css'
import { Check, X, Phone, ClipboardList, CheckCircle, Ban, Search, AlertTriangle, Calendar, Eye, Edit, Trash2, TrendingUp, MapPin } from 'lucide-react'

/* ─── Constants ─────────────────────────────────────────────── */
const LOAN_TYPES = ['All Loan Types', 'Housing', 'Business OD/CC', 'Loan Against Property', 'Others']
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
  client_name: '', co_applicate_name: '', loan_type: 'Housing', loan_amount: 0,
  note: '', status: 'New', associate_name: 'Unassigned',
  id: null, client_mobile_number: '',
  google_drive_link: ''
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function EnquiryStatus() {
  const { enquiries, addEnquiry, updateEnquiry, removeEnquiry, addClient, associates } = useAppState()
  const { addToast } = useToast()
  const confirm = useConfirm()

  // Qualified lead to client record conversion overlay
  const [convertingLead, setConvertingLead] = useState(null)
  const [convertFormData, setConvertFormData] = useState(null)
  const [generatedClientId, setGeneratedClientId] = useState(null)

  useEffect(() => {
    if (convertingLead) {
      // Generate the next sequential client ID immediately when the modal opens
      nextClientId().then(id => setGeneratedClientId(id))
      setConvertFormData({
        // Basic
        client_name: convertingLead.client_name || '',
        co_applicate_name: convertingLead.co_applicate_name || '',
        loan_type: convertingLead.loan_type || 'Housing',
        loan_amount: convertingLead.loan_amount || '',
        associate_name: convertingLead.associate_name !== 'Unassigned' ? (convertingLead.associate_name || '') : '',
        client_mobile_number: String(convertingLead.client_mobile_number || ''),
        google_drive_link: convertingLead.google_drive_link || '',
        professional_type: 'Job',
        // Job fields
        company_name: '',
        salary_type: 'Account Credit',
        job_title: '',
        years_in_company: '',
        esi_pf: 'Yes',
        urn: '',
        manager_name: '',
        manager_mobile: '',
        // Self Employed fields
        gst: '',
        gst_total_year: '',
        udyam: 'No',
        udyam_vintage: '',
        other_gov_cert: '',
        vintage_proof: '',
        // Common
        proprietor_type: 'Solo Proprietor',
        others: '',
        property_value: '',
        banker_name: '',
        bank_manager_name: '',
        bank_manager_number: '',
        cibil_applicant: '',
        cibil_co_applicant: '',
        applicant_total_loans: '',
        co_applicant_total_loans: '',
        applicant_cibil_briefing: '',
        co_applicant_cibil_briefing: '',
        document_issues: 'None',
        business_issues: 'None',
        family_issues: 'None',
        convert_notes: convertingLead.note || '',
      })
    } else {
      setConvertFormData(null)
      setGeneratedClientId(null)
    }
  }, [convertingLead])

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
      if (payload.status === 'Accepted') {
        setConvertingLead(payload)
      }
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
    if (!convertFormData) return

    const clientPayload = {
      id: generatedClientId,
      name: convertFormData.client_name,
      phone: convertFormData.client_mobile_number,
      loan_type: convertFormData.loan_type,
      amount: Number(convertFormData.loan_amount || 0),
      status: 'Processing',
      date: new Date().toISOString().slice(0, 10),
      associate: convertFormData.associate_name || '',
      location: '',
      employment_status: convertFormData.professional_type === 'Job' ? 'Salaried' : 'Self-Employed',
      pan_card: '',
      aadhaar_number: '',
      residential_status: 'Resident Indian',
      monthly_net_income: '',
      co_applicant_income: '',
      dwelling_status: 'Owned',
      tenure_at_address: '',
      drive_link: convertFormData.google_drive_link || '',
      extended_data: {
        co_applicate_name: convertFormData.co_applicate_name || '',
        professional_type: convertFormData.professional_type || 'Job',
        company_name: convertFormData.company_name || '',
        job_title: convertFormData.job_title || '',
        years_in_company: convertFormData.years_in_company || '',
        salary_type: convertFormData.salary_type || '',
        esi_pf: convertFormData.esi_pf || '',
        urn: convertFormData.urn || '',
        manager_name: convertFormData.manager_name || '',
        manager_mobile: convertFormData.manager_mobile || '',
        gst: convertFormData.gst || '',
        gst_total_year: convertFormData.gst_total_year || '',
        udyam: convertFormData.udyam || '',
        udyam_vintage: convertFormData.udyam_vintage || '',
        other_gov_cert: convertFormData.other_gov_cert || '',
        vintage_proof: convertFormData.vintage_proof || '',
        proprietor_type: convertFormData.proprietor_type || '',
        others: convertFormData.others || '',
        property_value: convertFormData.property_value || '',
        banker_name: convertFormData.banker_name || '',
        bank_manager_name: convertFormData.bank_manager_name || '',
        bank_manager_number: convertFormData.bank_manager_number || '',
        cibil_applicant: convertFormData.cibil_applicant || '',
        cibil_co_applicant: convertFormData.cibil_co_applicant || '',
        applicant_total_loans: convertFormData.applicant_total_loans || '',
        co_applicant_total_loans: convertFormData.co_applicant_total_loans || '',
        applicant_cibil_briefing: convertFormData.applicant_cibil_briefing || '',
        co_applicant_cibil_briefing: convertFormData.co_applicant_cibil_briefing || '',
        document_issues: convertFormData.document_issues || 'None',
        business_issues: convertFormData.business_issues || 'None',
        family_issues: convertFormData.family_issues || 'None',
        convert_notes: convertFormData.convert_notes || '',
      }
    }

    addClient(clientPayload)
    if (convertingLead && convertingLead.id) {
      removeEnquiry(convertingLead.id)
    }
    addToast(`Successfully converted ${convertFormData.client_name} into a Client Record!`, 'success')
    setConvertingLead(null)
  }

  /* ══════════════════════════════════════════
     Main List View
  ══════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="data-page" style={{ paddingBottom: 120 }}>

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

                  return (
                    <div
                      key={e.id}
                      className="flex flex-wrap xl:flex-nowrap items-start xl:items-center gap-4 py-4 px-4 sm:px-5"
                      style={{
                        borderTop: idx > 0 ? '1px solid #f5f5f5' : 'none',
                      }}
                    >
                      {/* Left: Avatar + Info */}
                      <div className="flex items-center gap-4 w-full xl:w-auto xl:flex-1 min-w-0">
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
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                            <span>+91 {e.client_mobile_number}</span>
                            {e.created_at ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>•<Calendar size={12} style={{ marginLeft: 2 }} /> {e.created_at.slice(0, 10)}</span> : ''}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions + Amount + Menu */}
                      <div className="flex items-center flex-wrap gap-4 w-full xl:w-auto justify-between xl:justify-end mt-2 xl:mt-0">
                        {/* Inline status action buttons */}
                        <div className="flex flex-wrap gap-2">
                          {['Accepted', 'Rejected', 'Callback', 'Others'].map((s) => (
                            <StatusActionBtn key={s} status={s} active={e.status} onClick={(ns) => handleInlineStatus(e, ns)} />
                          ))}
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                          {/* Amount + bank */}
                          <div className="text-left sm:text-right" style={{ flexShrink: 0, minWidth: 90 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                              {formatAmount(e.loan_amount)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                              {e.associate_name && e.associate_name !== 'Unassigned' ? `${e.associate_name}` : 'Unassigned'}
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
                  </div>
                </div>
              )
                })}
              </div>
            </div>
          ))
        )}

        {modalOpen && (
          <Modal
            title={modalMode === 'view' ? 'Enquiry Details' : modalMode === 'edit' ? 'Update Enquiry' : 'Add New Enquiry'}
            onClose={() => setModalOpen(false)}
          >
            <div className="form-grid">
              <label>Client Name
                <input type="text" value={formData.client_name} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
              </label>
              <label>Co-Applicant Name
                <input type="text" value={formData.co_applicate_name || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, co_applicate_name: e.target.value })} />
              </label>
              <label>Mobile Number
                <input type="number" value={formData.client_mobile_number || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, client_mobile_number: e.target.value })} />
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
              <label>Client Status
                <select
                  value={formData.status || 'New'}
                  disabled={modalMode === 'view'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="New">New</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Callback">Callback</option>
                  <option value="Others">Others</option>
                </select>
              </label>
              <label>Google Drive Link
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={formData.google_drive_link || ''} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, google_drive_link: e.target.value })} placeholder="https://drive.google.com/..." style={{ flex: 1 }} />
                  {formData.google_drive_link && (
                    <button type="button" className="admin-action-btn" onClick={() => window.open(formData.google_drive_link, '_blank', 'noopener,noreferrer')} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      Open Drive
                    </button>
                  )}
                </div>
              </label>
              <label className="form-grid-full">Notes & Description
                <textarea rows={4} value={formData.note} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Loan details, remarks, follow-up notes..." />
              </label>
            </div>
            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button type="button" className="btn-submit" onClick={saveEnquiry}>Save</button>
              )}
            </div>
          </Modal>
        )}

        {convertingLead && convertFormData && (
          <Modal
            size="lg"
            title="Convert to Client Record"
            subtitle="Fill in the details to create a full client file."
            icon={<TrendingUp size={20} />}
            headerTheme="success"
            onClose={() => setConvertingLead(null)}
          >
            {/* Client ID reference badge */}
            {generatedClientId && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-muted)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 14px', marginBottom: 16,
                fontSize: 12, color: 'var(--text-muted)'
              }}>
                <span style={{ fontWeight: 600 }}>Client ID</span>
                <span style={{
                  fontFamily: 'monospace', fontWeight: 800, fontSize: 14,
                  color: 'var(--accent)', letterSpacing: '0.5px'
                }}>{generatedClientId}</span>
                <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>· Auto-generated · Read only</span>
              </div>
            )}

            {/* Form Details */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Client Details</h3>
            <div className="form-grid">
              <label>Client Name
                <input type="text" value={convertFormData.client_name} onChange={(e) => setConvertFormData({ ...convertFormData, client_name: e.target.value })} />
              </label>
              <label>Co-Applicant Name
                <input type="text" value={convertFormData.co_applicate_name} onChange={(e) => setConvertFormData({ ...convertFormData, co_applicate_name: e.target.value })} />
              </label>
              <label>Type of Loan
                <select value={convertFormData.loan_type} onChange={(e) => setConvertFormData({ ...convertFormData, loan_type: e.target.value })}>
                  <option value="Housing">Housing</option>
                  <option value="Business OD/CC">Business OD/CC</option>
                  <option value="Loan Against Property">Loan Against Property</option>
                  <option value="Others">Others</option>
                </select>
              </label>
              <label>Loan Amount
                <input type="number" min="0" value={convertFormData.loan_amount} onChange={(e) => setConvertFormData({ ...convertFormData, loan_amount: e.target.value })} />
              </label>
              <label>Associate Name
                <input type="text" value={convertFormData.associate_name} onChange={(e) => setConvertFormData({ ...convertFormData, associate_name: e.target.value })} />
              </label>
              <label>Client Mobile Number
                <input type="text" value={convertFormData.client_mobile_number} onChange={(e) => setConvertFormData({ ...convertFormData, client_mobile_number: e.target.value })} />
              </label>
              <label className="form-grid-full">Google Drive Link
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={convertFormData.google_drive_link || ''} onChange={(e) => setConvertFormData({ ...convertFormData, google_drive_link: e.target.value })} placeholder="https://drive.google.com/..." style={{ flex: 1 }} />
                  {convertFormData.google_drive_link && (
                    <button type="button" className="admin-action-btn" onClick={() => window.open(convertFormData.google_drive_link, '_blank', 'noopener,noreferrer')} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      Open Drive
                    </button>
                  )}
                </div>
              </label>
              <label className="form-grid-full">Professional Type
                <select value={convertFormData.professional_type} onChange={(e) => setConvertFormData({ ...convertFormData, professional_type: e.target.value })}>
                  <option value="Job">Job</option>
                  <option value="Self Employed">Self Employed</option>
                </select>
              </label>

              {convertFormData.professional_type === 'Job' && (<>
                <label>Name of Company
                  <input type="text" value={convertFormData.company_name} onChange={(e) => setConvertFormData({ ...convertFormData, company_name: e.target.value })} />
                </label>
                <label>Salary Type
                  <select value={convertFormData.salary_type} onChange={(e) => setConvertFormData({ ...convertFormData, salary_type: e.target.value })}>
                    <option value="Account Credit">Account Credit</option>
                    <option value="Cash on Hand">Cash on Hand</option>
                  </select>
                </label>
                <label>Job Title
                  <input type="text" value={convertFormData.job_title} onChange={(e) => setConvertFormData({ ...convertFormData, job_title: e.target.value })} />
                </label>
                <label>Years in the Company
                  <input type="text" value={convertFormData.years_in_company} onChange={(e) => setConvertFormData({ ...convertFormData, years_in_company: e.target.value })} />
                </label>
                <label>ESI & PF
                  <select value={convertFormData.esi_pf} onChange={(e) => setConvertFormData({ ...convertFormData, esi_pf: e.target.value })}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label>URN
                  <input type="text" value={convertFormData.urn} onChange={(e) => setConvertFormData({ ...convertFormData, urn: e.target.value })} />
                </label>
                <label>Manager Name
                  <input type="text" value={convertFormData.manager_name} onChange={(e) => setConvertFormData({ ...convertFormData, manager_name: e.target.value })} />
                </label>
                <label>Manager Mobile Number
                  <input type="text" value={convertFormData.manager_mobile} onChange={(e) => setConvertFormData({ ...convertFormData, manager_mobile: e.target.value })} />
                </label>
              </>)}
              
              {convertFormData.professional_type === 'Self Employed' && (<>
                <label>GST
                  <input type="text" value={convertFormData.gst} onChange={(e) => setConvertFormData({ ...convertFormData, gst: e.target.value })} />
                </label>
                <label>GST Total Year
                  <input type="text" value={convertFormData.gst_total_year} onChange={(e) => setConvertFormData({ ...convertFormData, gst_total_year: e.target.value })} />
                </label>
                <label>UDYAM
                  <select value={convertFormData.udyam} onChange={(e) => setConvertFormData({ ...convertFormData, udyam: e.target.value })}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label>UDYAM Vintage
                  <input type="text" value={convertFormData.udyam_vintage} onChange={(e) => setConvertFormData({ ...convertFormData, udyam_vintage: e.target.value })} />
                </label>
                <label>Other Government Certificate
                  <input type="text" value={convertFormData.other_gov_cert} onChange={(e) => setConvertFormData({ ...convertFormData, other_gov_cert: e.target.value })} />
                </label>
                <label>Vintage Proof
                  <input type="text" value={convertFormData.vintage_proof} onChange={(e) => setConvertFormData({ ...convertFormData, vintage_proof: e.target.value })} />
                </label>
              </>)}

              {/* Common for both */}
              <label>Proprietor Type
                <select value={convertFormData.proprietor_type} onChange={(e) => setConvertFormData({ ...convertFormData, proprietor_type: e.target.value })}>
                  <option value="Solo Proprietor">Solo Proprietor</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </label>
              <label>Others
                <input type="text" value={convertFormData.others} onChange={(e) => setConvertFormData({ ...convertFormData, others: e.target.value })} />
              </label>
              <label>Property Value
                <input type="text" value={convertFormData.property_value} onChange={(e) => setConvertFormData({ ...convertFormData, property_value: e.target.value })} />
              </label>
              <label>Name of Banker
                <input type="text" value={convertFormData.banker_name} onChange={(e) => setConvertFormData({ ...convertFormData, banker_name: e.target.value })} />
              </label>
              <label>CIBIL Score (Applicant)
                <input type="text" value={convertFormData.cibil_applicant} onChange={(e) => setConvertFormData({ ...convertFormData, cibil_applicant: e.target.value })} />
              </label>
              <label>CIBIL Score (Co-Applicant)
                <input type="text" value={convertFormData.cibil_co_applicant} onChange={(e) => setConvertFormData({ ...convertFormData, cibil_co_applicant: e.target.value })} />
              </label>
              <label>Applicant Number of Loan
                <input type="text" value={convertFormData.applicant_total_loans} onChange={(e) => setConvertFormData({ ...convertFormData, applicant_total_loans: e.target.value })} />
              </label>
              <label>Co-Applicant Total Loan
                <input type="text" value={convertFormData.co_applicant_total_loans} onChange={(e) => setConvertFormData({ ...convertFormData, co_applicant_total_loans: e.target.value })} />
              </label>
              <label className="form-grid-full">Applicant CIBIL Briefing
                <input type="text" value={convertFormData.applicant_cibil_briefing} onChange={(e) => setConvertFormData({ ...convertFormData, applicant_cibil_briefing: e.target.value })} />
              </label>
              <label className="form-grid-full">Co-Applicant CIBIL Briefing
                <input type="text" value={convertFormData.co_applicant_cibil_briefing} onChange={(e) => setConvertFormData({ ...convertFormData, co_applicant_cibil_briefing: e.target.value })} />
              </label>
              <label>Document Related Issues
                <select value={convertFormData.document_issues} onChange={(e) => setConvertFormData({ ...convertFormData, document_issues: e.target.value })}>
                  <option value="None">None</option>
                  <option value="Private Finance Holding">Private Finance Holding</option>
                  <option value="Relative Base Holding">Relative Base Holding</option>
                  <option value="Join Family Issue">Join Family Issue</option>
                  <option value="Document Not Available">Document Not Available</option>
                  <option value="Other Issues">Other Issues</option>
                </select>
              </label>
              <label>Business Related Issues
                <select value={convertFormData.business_issues} onChange={(e) => setConvertFormData({ ...convertFormData, business_issues: e.target.value })}>
                  <option value="None">None</option>
                  <option value="Partner Not Accepted">Partner Not Accepted</option>
                  <option value="Vintage Proof Not Supported">Vintage Proof Not Supported</option>
                  <option value="Others">Others</option>
                </select>
              </label>
              <label>Family Related Issues
                <select value={convertFormData.family_issues} onChange={(e) => setConvertFormData({ ...convertFormData, family_issues: e.target.value })}>
                  <option value="None">None</option>
                  <option value="Wife Not Support">Wife Not Support</option>
                  <option value="Parent Not Support">Parent Not Support</option>
                  <option value="Others">Others</option>
                </select>
              </label>
              <label className="form-grid-full">Notes
                <textarea rows={3} value={convertFormData.convert_notes} onChange={(e) => setConvertFormData({ ...convertFormData, convert_notes: e.target.value })} />
              </label>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setConvertingLead(null)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, border: '1px solid #d1d5db',
                  background: '#fff', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                }}
              >
                Cancel / Keep as Lead
              </button>
              <button
                onClick={handleLeadConversion}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, border: 'none',
                  background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
                }}
              >
                Submit to Login File
              </button>
            </div>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  )
}


