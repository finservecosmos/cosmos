import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../hooks/useConfirm'
import './FinanceInvestment.css'

function getDaysRemainingInfo(endDateStr) {
  const today = new Date('2026-06-06') // Reference system date
  const eDate = new Date(endDateStr || '2026-12-31')
  const diffTime = eDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let barColor = 'green'
  if (diffDays <= 30) {
    barColor = 'red'
  } else if (diffDays <= 90) {
    barColor = 'orange'
  }
  
  return { remainingDays: Math.max(0, diffDays), barColor }
}

export default function FinanceInvestment() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const confirm = useConfirm()
  const { investments, addInvestment, updateInvestment, removeInvestment } = useAppState()

  // Form toggle states
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Form inputs state
  const [partnerName, setPartnerName] = useState('')
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [duration, setDuration] = useState('12 Months')
  const [mobileNumber, setMobileNumber] = useState('')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [startDate, setStartDate] = useState('2026-06-06')
  const [endDate, setEndDate] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [nomineeName, setNomineeName] = useState('')
  const [remarks, setRemarks] = useState('')
  const [nomineeAadhaar, setNomineeAadhaar] = useState('')
  const [nomineePan, setNomineePan] = useState('')
  const [address, setAddress] = useState('')

  // Edit Mode state
  const [editId, setEditId] = useState(null)

  // Toolbar filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 8

  // Action Menu active row ID
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Details Modal
  const [viewRecord, setViewRecord] = useState(null)

  useEffect(() => {
    document.title = 'Investment Management | Cosmos'
  }, [])

  // Auto-close three-dot actions menu on click elsewhere
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  // Auto-calculate end date & estimated interest based on durational months
  useEffect(() => {
    if (!startDate) return
    const sDate = new Date(startDate)
    let monthsToAdd = 12

    if (duration === '6 Months') {
      monthsToAdd = 6
    } else if (duration === '12 Months') {
      monthsToAdd = 12
    } else if (duration === '24 Months') {
      monthsToAdd = 24
    } else if (duration === '36 Months') {
      monthsToAdd = 36
    }

    sDate.setMonth(sDate.getMonth() + monthsToAdd)
    setEndDate(sDate.toISOString().slice(0, 10))
  }, [startDate, duration])

  // KPI calculations
  const totalInvestmentAmount = useMemo(() => {
    const active = investments || []
    return active.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
  }, [investments])

  const activePartnersCount = useMemo(() => {
    const active = investments || []
    return active.filter(inv => inv.status === 'Active').length
  }, [investments])

  const maturingThisMonthCount = useMemo(() => {
    const active = investments || []
    return active.filter(inv => {
      const { remainingDays } = getDaysRemainingInfo(inv.end_date || inv.endDate)
      return remainingDays >= 0 && remainingDays <= 30
    }).length
  }, [investments])

  // Map and sort investor rows
  const derivedRecordsList = useMemo(() => {
    const active = investments || []
    return active.map(inv => {
      const start = inv.start_date || inv.startDate || '2026-06-06'
      const end = inv.end_date || inv.endDate || '2027-06-06'
      const amount = Number(inv.amount) || 0
      
      // Calculate interest rate
      let rate = 0.08
      if (inv.duration === '6 Months') rate = 0.07
      else if (inv.duration === '12 Months') rate = 0.08
      else if (inv.duration === '24 Months') rate = 0.09
      else if (inv.duration === '36 Months') rate = 0.10
      
      const interest = Math.round(amount * rate)
      const { remainingDays, barColor } = getDaysRemainingInfo(end)

      // Format end date for table display
      const eDateObj = new Date(end)
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      const formattedEndDate = eDateObj.toLocaleDateString('en-GB', options)

      return {
        id: inv.id,
        partner: inv.partner,
        amount,
        interest,
        duration: inv.duration || '12 Months',
        endDate: end,
        displayEndDate: formattedEndDate,
        remainingDays,
        barColor,
        status: inv.status || 'Active',
        originalInvestment: inv
      }
    }).sort((a, b) => a.remainingDays - b.remainingDays)
  }, [investments])

  // Filter records
  const filteredRecords = useMemo(() => {
    return derivedRecordsList.filter(rec => {
      const query = searchQuery.toLowerCase().trim()
      const matchSearch = !query ||
        rec.partner.toLowerCase().includes(query) ||
        rec.id.toLowerCase().includes(query)
      
      const matchStatus = statusFilter === 'All' || rec.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [derivedRecordsList, searchQuery, statusFilter])

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE)
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleResetForm = () => {
    setPartnerName('')
    setInvestmentAmount('')
    setDuration('12 Months')
    setMobileNumber('')
    setAadhaarNumber('')
    setStartDate('2026-06-06')
    setPanNumber('')
    setNomineeName('')
    setRemarks('')
    setNomineeAadhaar('')
    setNomineePan('')
    setAddress('')
  }

  const handleCancel = () => {
    handleResetForm()
    setEditId(null)
    setIsFormOpen(false)
  }

  const handleSaveInvestment = () => {
    if (!partnerName.trim() || !investmentAmount || !startDate) {
      addToast('Partner Name, Investment Amount, and Start Date are required.', 'error')
      return
    }
    if (mobileNumber.trim() && !/^\d{10}$/.test(mobileNumber.trim())) {
      addToast('Mobile number must be exactly 10 digits.', 'error')
      return
    }
    if (aadhaarNumber.trim() && !/^\d{12}$/.test(aadhaarNumber.trim())) {
      addToast('Aadhaar number must be exactly 12 digits.', 'error')
      return
    }
    if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase())) {
      addToast('Invalid PAN Card format.', 'error')
      return
    }

    const payload = {
      partner: partnerName,
      amount: Number(investmentAmount),
      duration,
      start_date: startDate,
      end_date: endDate,
      mobile: mobileNumber,
      aadhaar_number: aadhaarNumber,
      pan_card: panNumber.toUpperCase(),
      nominee_name: nomineeName,
      remarks,
      nominee_aadhaar: nomineeAadhaar,
      nominee_pan: nomineePan.toUpperCase(),
      address,
      status: 'Active'
    }

    if (editId) {
      const original = investments.find(x => x.id === editId)
      updateInvestment({
        ...original,
        ...payload,
        id: editId
      })
      addToast('Partner investment record updated.', 'success')
    } else {
      addInvestment(payload)
      addToast('New partner investment recorded.', 'success')
    }

    handleCancel()
  }

  const handleEditRecord = (rec) => {
    const orig = rec.originalInvestment
    setEditId(rec.id)
    setPartnerName(orig.partner)
    setInvestmentAmount(String(orig.amount))
    setDuration(orig.duration || '12 Months')
    setMobileNumber(orig.mobile || '')
    setAadhaarNumber(orig.aadhaar_number || '')
    setStartDate(orig.start_date || orig.startDate || '2026-06-06')
    setPanNumber(orig.pan_card || '')
    setNomineeName(orig.nominee_name || '')
    setRemarks(orig.remarks || '')
    setNomineeAadhaar(orig.nominee_aadhaar || '')
    setNomineePan(orig.nominee_pan || '')
    setAddress(orig.address || '')

    setIsFormOpen(true)
    setActiveMenuId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteRecord = async (rec) => {
    setActiveMenuId(null)
    const confirmed = await confirm({
      title: 'Remove Investment Record',
      message: `Are you sure you want to permanently remove ${rec.partner}'s investment record?`
    })
    if (confirmed) {
      updateInvestment({
        ...rec.originalInvestment,
        status: 'Inactive'
      })
      addToast('Investment record set to Inactive.', 'success')
    }
  }

  const handleExportCSV = () => {
    const headers = ['Partner Name', 'Investment Amount', 'Interest Amount', 'Duration', 'End Date', 'Status']
    const rows = filteredRecords.map(rec => [
      rec.partner,
      rec.amount,
      rec.interest,
      rec.duration,
      rec.endDate,
      rec.status
    ])

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Partner_Investments_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Records exported successfully.', 'success')
  }

  const triggerActionMenu = (e, id) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  return (
    <DashboardLayout>
      <div className="finance-investment-page">
        {/* Toggle shortcut row */}
        <div className="finance-investment-actions-row">
          <button 
            type="button" 
            className="data-btn data-btn-primary"
            onClick={() => {
              if (isFormOpen && editId) {
                setEditId(null)
                handleResetForm()
              } else {
                setIsFormOpen(!isFormOpen)
              }
            }}
          >
            {isFormOpen ? '✕ Close Form' : '+ New Investment'}
          </button>
        </div>

        {/* KPI metrics row */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="kpi-tag trend-up">↗ +12.5% vs last month</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">TOTAL INVESTMENTS</div>
              <div className="kpi-value">₹{totalInvestmentAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="kpi-tag trend-up">↗ +4 new this week</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">ACTIVE PARTNERS</div>
              <div className="kpi-value">{activePartnersCount}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="kpi-tag critical">Action required on {maturingThisMonthCount}</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">MATURING THIS MONTH</div>
              <div className="kpi-value">{maturingThisMonthCount}</div>
            </div>
          </div>
        </div>

        {/* Collapsible Entry Form */}
        {isFormOpen && (
          <div className="investment-form-card">
            <div className="form-header-row">
              <div className="form-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>{editId ? 'Modify Investment Record' : 'Investment Entry Form'}</span>
              </div>
              <span className="entry-id-badge" style={{ background: '#fde8e8', color: '#c0392b' }}>
                {editId ? `ID: ${editId}` : 'NEW ENTRY'}
              </span>
            </div>

            <div className="investment-form-grid">
              <label>
                Partner Name *
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  value={partnerName} 
                  onChange={e => setPartnerName(e.target.value)} 
                />
              </label>

              <label>
                Investment Amount (₹) *
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={investmentAmount} 
                  onChange={e => setInvestmentAmount(e.target.value)} 
                />
              </label>

              <label className="span-2">
                Investment Duration
                <select value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                  <option value="24 Months">24 Months</option>
                  <option value="36 Months">36 Months</option>
                </select>
              </label>

              <label>
                Partner Mobile
                <input 
                  type="text" 
                  placeholder="+91 XXXXX XXXXX" 
                  value={mobileNumber} 
                  onChange={e => setMobileNumber(e.target.value)} 
                />
              </label>

              <label>
                Partner Aadhaar
                <input 
                  type="text" 
                  placeholder="XXXX XXXX XXXX" 
                  value={aadhaarNumber} 
                  onChange={e => setAadhaarNumber(e.target.value)} 
                />
              </label>

              <label>
                Start Date *
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                />
              </label>

              <label>
                End Date (Auto)
                <input 
                  type="date" 
                  value={endDate} 
                  disabled 
                  style={{ background: 'var(--bg-muted)', cursor: 'not-allowed' }}
                />
              </label>

              <label>
                Partner PAN
                <input 
                  type="text" 
                  placeholder="ABCDE1234F" 
                  value={panNumber} 
                  onChange={e => setPanNumber(e.target.value)} 
                />
              </label>

              <label>
                Nominee Name
                <input 
                  type="text" 
                  placeholder="Relationship Holder" 
                  value={nomineeName} 
                  onChange={e => setNomineeName(e.target.value)} 
                />
              </label>

              <label className="span-2">
                Remarks
                <input 
                  type="text" 
                  placeholder="Internal notes..." 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                />
              </label>

              <label>
                Nominee Aadhaar
                <input 
                  type="text" 
                  placeholder="XXXX XXXX XXXX" 
                  value={nomineeAadhaar} 
                  onChange={e => setNomineeAadhaar(e.target.value)} 
                />
              </label>

              <label>
                Nominee PAN
                <input 
                  type="text" 
                  placeholder="PAN NUMBER" 
                  value={nomineePan} 
                  onChange={e => setNomineePan(e.target.value)} 
                />
              </label>

              <div className="span-2" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <button type="button" className="admin-action-btn" onClick={handleCancel} style={{ textDecoration: 'none', color: '#ef4444', border: 'none', background: 'transparent' }}>Cancel</button>
                <button type="button" className="data-btn data-btn-outline" onClick={handleResetForm}>Reset</button>
                <button type="button" className="admin-primary-btn" onClick={handleSaveInvestment} style={{ minWidth: 150 }}>Save Investment</button>
              </div>

              <label className="span-2" style={{ marginTop: -8 }}>
                Address
                <textarea 
                  rows={3} 
                  placeholder="Residential/Business address details..." 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  style={{ resize: 'none' }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Investment Records Table Card */}
        <div className="investment-form-card" style={{ padding: '20px 24px' }}>
          <div className="client-records-header-row" style={{ marginBottom: 16 }}>
            <div className="records-title-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18, color: 'var(--accent)' }}>
                <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
              </svg>
              <h2 className="records-title">Partner Investment Records</h2>
            </div>

            <div className="records-filter-toolbar">
              <select 
                className="data-filter-select" 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="records-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search partner..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                type="button" 
                className="data-btn data-btn-outline" 
                onClick={handleExportCSV}
                style={{ display: 'inline-flex', alignSelf: 'center', gap: 6 }}
              >
                📥 Export Excel
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Partner Name</th>
                  <th>Investment Amount</th>
                  <th>Int Amount</th>
                  <th>Duration</th>
                  <th>End Date</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px var(--border)' }}>
                      No partner investment records found.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 700 }}>{rec.partner}</td>
                      <td className="cell-amount">₹{rec.amount.toLocaleString('en-IN')}</td>
                      <td className="cell-amount" style={{ color: 'var(--text-secondary)' }}>₹{rec.interest.toLocaleString('en-IN')}</td>
                      <td className="cell-muted">{rec.duration}</td>
                      <td className="cell-muted">{rec.displayEndDate}</td>
                      <td>
                        <div className="remaining-days-bar-container">
                          <span className="remaining-days-text">{rec.remainingDays} Days</span>
                          <div className="remaining-days-bar-bg">
                            <div 
                              className={`remaining-days-bar-fill ${rec.barColor}`} 
                              style={{ width: `${Math.min(100, (rec.remainingDays / 540) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${rec.status.toLowerCase()}`}>
                          {rec.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <div style={{ display: 'inline-flex', gap: 10 }}>
                          <button 
                            type="button" 
                            className="panel-more-btn" 
                            title="View Details"
                            onClick={() => setViewRecord(rec)}
                          >
                            👁️
                          </button>
                          <button 
                            type="button" 
                            className="panel-more-btn" 
                            title="Edit Record"
                            onClick={() => handleEditRecord(rec)}
                          >
                            ✏️
                          </button>
                          <button 
                            type="button" 
                            className="panel-more-btn" 
                            title="More Actions"
                            onClick={(e) => triggerActionMenu(e, rec.id)}
                          >
                            ⋮
                          </button>
                        </div>

                        {activeMenuId === rec.id && (
                          <div className="profile-dropdown" style={{ top: 'auto', right: 0, bottom: '100%', zIndex: 100, width: 140 }}>
                            <button type="button" className="profile-dropdown-item danger" onClick={() => handleDeleteRecord(rec)}>
                              🗑️ Deactivate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > PAGE_SIZE && (
            <div className="data-pagination" style={{ borderTop: 'none', padding: '16px 0 0' }}>
              <span className="data-pagination-info">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(filteredRecords.length, currentPage * PAGE_SIZE)} of {filteredRecords.length} active records
              </span>
              <div className="data-pagination-btns">
                <button className="data-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={`data-page-btn${currentPage === i + 1 ? ' active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="data-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
              </div>
            </div>
          )}
        </div>

        {/* View Modal */}
        {viewRecord && (
          <Modal title="Investor Details View" onClose={() => setViewRecord(null)} size="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner Name:</span>
                <span style={{ fontWeight: 700 }}>{viewRecord.partner}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner Mobile:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.mobile || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner PAN Card:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.pan_card || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Partner Aadhaar:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.aadhaar_number || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Investment Principal:</span>
                <span className="cell-amount">₹{viewRecord.amount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Accrued Interest:</span>
                <span className="cell-amount">₹{viewRecord.interest.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Nominee Name:</span>
                <span style={{ fontWeight: 600 }}>{viewRecord.originalInvestment.nominee_name || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Nominee PAN:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.nominee_pan || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Nominee Aadhaar:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalInvestment.nominee_aadhaar || '—'}</span>
              </div>
              {viewRecord.originalInvestment.address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Billing Address:</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>{viewRecord.originalInvestment.address}</span>
                </div>
              )}
              {viewRecord.originalInvestment.remarks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Remarks:</span>
                  <span style={{ fontSize: 12.5, fontStyle: 'italic' }}>{viewRecord.originalInvestment.remarks}</span>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="admin-action-btn" onClick={() => setViewRecord(null)}>Close</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
