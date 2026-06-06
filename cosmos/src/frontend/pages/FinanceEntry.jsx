import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../hooks/useConfirm'
import './FinanceEntry.css'
import { X, Plus, Check, Save, FileText, Edit, Trash2 } from 'lucide-react';

// Helper to calculate due date and urgency dynamically
function getDueInfo(clientDateStr) {
  const today = new Date('2026-06-06') // Reference system date
  const cDate = new Date(clientDateStr || '2026-06-01')
  const day = cDate.getDate() || 15
  
  // Create due date in June 2026
  let dueYear = 2026
  let dueMonth = 5 // June is 5 (0-indexed)
  
  // If today (June 6) is past the due day (e.g., day is 5), then due date is in July
  if (day < 6) {
    dueMonth = 6 // July
  }
  
  const dueDate = new Date(dueYear, dueMonth, day)
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let dueIn = ''
  let dueClass = 'gray'
  
  if (diffDays <= 0) {
    dueIn = 'Due Today'
    dueClass = 'red'
  } else if (diffDays === 1) {
    dueIn = '1 Day Left'
    dueClass = 'red'
  } else if (diffDays <= 3) {
    dueIn = `${diffDays} Days Left`
    dueClass = 'orange'
  } else if (diffDays <= 7) {
    dueIn = `${diffDays} Days Left`
    dueClass = 'yellow'
  } else if (diffDays <= 15) {
    dueIn = `${diffDays} Days Left`
    dueClass = 'green'
  } else if (diffDays <= 30) {
    dueIn = `${diffDays} Days Left`
    dueClass = 'blue'
  } else {
    dueIn = '30+ Days Left'
    dueClass = 'gray'
  }
  
  const yyyy = dueDate.getFullYear()
  const mm = String(dueDate.getMonth() + 1).padStart(2, '0')
  const dd = String(dueDate.getDate()).padStart(2, '0')
  const dateStr = `${yyyy}-${mm}-${dd}`
  
  return { dueIn, dueClass, date: dateStr, diffDays }
}

export default function FinanceEntry() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const confirm = useConfirm()
  const { clients, addClient, updateClient } = useAppState()

  // Collapsible Form State
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Form Fields State
  const [clientName, setClientName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [emailId, setEmailId] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [duration, setDuration] = useState('< 3 Days')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [interestAmount, setInterestAmount] = useState('')
  const [coApplicantName, setCoApplicantName] = useState('')
  const [address, setAddress] = useState('')
  const [coApplicantAadhaar, setCoApplicantAadhaar] = useState('')
  const [ebNo, setEbNo] = useState('')
  const [remarks, setRemarks] = useState('')

  // Edit Mode state
  const [editId, setEditId] = useState(null)

  // Filter toolbar states
  const [searchQuery, setSearchQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 8

  // Action ellipses menu active row ID
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Detail Modal views
  const [viewRecord, setViewRecord] = useState(null)

  useEffect(() => {
    document.title = 'Finance Entry | Cosmos'
  }, [])

  // Auto-close three-dot menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  // Automatically calculate interest and due date on duration/loan amount updates
  useEffect(() => {
    if (!loanAmount || isNaN(Number(loanAmount))) {
      setInterestAmount('')
      setDueDate('')
      return
    }
    
    let interestPct = 0.01
    let daysToAdd = 15

    if (duration === '< 3 Days') {
      interestPct = 0.005
      daysToAdd = 2
    } else if (duration === '< 7 Days') {
      interestPct = 0.01
      daysToAdd = 5
    } else if (duration === '< 15 Days') {
      interestPct = 0.015
      daysToAdd = 12
    } else if (duration === '< 30 Days') {
      interestPct = 0.02
      daysToAdd = 25
    } else {
      interestPct = 0.03
      daysToAdd = 45
    }

    setInterestAmount(String(Math.round(Number(loanAmount) * interestPct)))
    
    const calculatedDate = new Date()
    calculatedDate.setDate(calculatedDate.getDate() + daysToAdd)
    setDueDate(calculatedDate.toISOString().slice(0, 10))
  }, [loanAmount, duration])

  // Derive dynamic client lists
  const activeClients = useMemo(() => {
    return clients.filter(c => ['Approved', 'Processing'].includes(c.status))
  }, [clients])

  // KPI calculations
  const totalInvestments = useMemo(() => {
    return clients.reduce((sum, c) => sum + Number(c.amount || 0), 0)
  }, [clients])

  const dueThisWeekCount = useMemo(() => {
    return activeClients.filter(c => {
      const { diffDays } = getDueInfo(c.date)
      return diffDays >= 0 && diffDays <= 7
    }).length
  }, [activeClients])

  const totalInterestPayable = useMemo(() => {
    return activeClients.reduce((sum, c) => {
      const interest = c.interest_amount || Math.round(c.amount * 0.01)
      return sum + interest
    }, 0)
  }, [activeClients])

  // Reactive derived list representing the design's Table Row items
  const derivedRecordsList = useMemo(() => {
    return activeClients.map(c => {
      const { dueIn, dueClass, date, diffDays } = getDueInfo(c.date)
      const principal = c.amount
      const interest = c.interest_amount || Math.round(c.amount * 0.01)
      const total = principal + interest
      
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        principal,
        interest,
        total,
        dueDate: date,
        daysRemaining: dueIn,
        dueClass,
        diffDays,
        status: c.status,
        originalClient: c
      }
    }).sort((a, b) => a.diffDays - b.diffDays)
  }, [activeClients])

  // Filter list by searchQuery and from/to date ranges
  const filteredRecords = useMemo(() => {
    return derivedRecordsList.filter(rec => {
      const query = searchQuery.toLowerCase().trim()
      const matchSearch = !query ||
        rec.name.toLowerCase().includes(query) ||
        rec.phone.includes(query) ||
        rec.id.toLowerCase().includes(query)
        
      const matchFrom = !fromDate || rec.dueDate >= fromDate
      const matchTo = !toDate || rec.dueDate <= toDate
      
      return matchSearch && matchFrom && matchTo
    })
  }, [derivedRecordsList, searchQuery, fromDate, toDate])

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE)
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset pagination on filter updates
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, fromDate, toDate])

  const displayEntryId = useMemo(() => {
    if (editId) return `ENTRY ID: ${editId}`
    return `ENTRY ID: CF-2026-${String(clients.length + 1).padStart(3, '0')}`
  }, [editId, clients.length])

  // Resets all form fields
  const handleResetForm = () => {
    setClientName('')
    setMobileNumber('')
    setEmailId('')
    setLoanAmount('')
    setDuration('< 3 Days')
    setAadhaarNumber('')
    setPanNumber('')
    setDueDate('')
    setInterestAmount('')
    setCoApplicantName('')
    setAddress('')
    setCoApplicantAadhaar('')
    setEbNo('')
    setRemarks('')
  }

  // Cancel and close form
  const handleCancel = () => {
    handleResetForm()
    setEditId(null)
    setIsFormOpen(false)
  }

  // Save the form entry
  const handleSaveEntry = () => {
    if (!clientName.trim() || !mobileNumber.trim() || !loanAmount) {
      addToast('Client Name, Mobile Number, and Loan Amount are required.', 'error')
      return
    }
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      addToast('Mobile number must be exactly 10 digits.', 'error')
      return
    }
    if (aadhaarNumber.trim() && !/^\d{12}$/.test(aadhaarNumber.trim())) {
      addToast('Aadhaar number must be exactly 12 digits.', 'error')
      return
    }
    if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase())) {
      addToast('Invalid PAN Card format (e.g. ABCDE1234F).', 'error')
      return
    }

    const payload = {
      name: clientName,
      phone: mobileNumber,
      email: emailId || `${clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      amount: Number(loanAmount),
      date: dueDate || new Date().toISOString().slice(0, 10),
      loan_type: 'Home Loan',
      status: 'Approved',
      associate: 'Unassigned',
      pan_card: panNumber.toUpperCase(),
      aadhaar_number: aadhaarNumber,
      residential_status: 'Resident Indian',
      employment_status: 'Salaried',
      monthly_net_income: '',
      co_applicant_income: '',
      dwelling_status: 'Owned',
      tenure_at_address: '',
      location: 'Mumbai, MH',
      // Custom entry meta attributes
      duration,
      interest_amount: Number(interestAmount) || Math.round(Number(loanAmount) * 0.01),
      co_applicant_name: coApplicantName,
      address,
      co_applicant_aadhaar: coApplicantAadhaar,
      eb_no: ebNo,
      remarks
    }

    if (editId) {
      const original = clients.find(c => c.id === editId)
      updateClient({
        ...original,
        ...payload,
        id: editId
      })
      addToast('Finance entry updated successfully.', 'success')
    } else {
      addClient(payload)
      addToast('New finance entry recorded successfully.', 'success')
    }

    handleCancel()
  }

  // Export records to CSV
  const handleExportCSV = () => {
    const headers = ['Client Name', 'Mobile Number', 'Principal Amount', 'Interest', 'Total Payable', 'Due Date', 'Status']
    const rows = filteredRecords.map(rec => [
      rec.name,
      rec.phone,
      rec.principal,
      rec.interest,
      rec.total,
      rec.dueDate,
      rec.status
    ])

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Finance_Entry_Records_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Records exported to CSV successfully.', 'success')
  }

  // Loading client details back into the form editor
  const handleEditRecord = (rec) => {
    setEditId(rec.id)
    setClientName(rec.name)
    setMobileNumber(rec.phone)
    setEmailId(rec.email)
    setLoanAmount(String(rec.principal))
    setDuration(rec.originalClient.duration || '< 3 Days')
    setAadhaarNumber(rec.originalClient.aadhaar_number || '')
    setPanNumber(rec.originalClient.pan_card || '')
    setDueDate(rec.dueDate)
    setInterestAmount(String(rec.interest))
    setCoApplicantName(rec.originalClient.co_applicant_name || '')
    setAddress(rec.originalClient.address || '')
    setCoApplicantAadhaar(rec.originalClient.co_applicant_aadhaar || '')
    setEbNo(rec.originalClient.eb_no || '')
    setRemarks(rec.originalClient.remarks || '')
    
    setIsFormOpen(true)
    setActiveMenuId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Record deletions
  const handleDeleteRecord = async (rec) => {
    setActiveMenuId(null)
    const confirmed = await confirm({
      title: 'Remove Finance Entry',
      message: `Are you sure you want to permanently remove ${rec.name}'s finance record? This action cannot be undone.`
    })
    if (confirmed) {
      updateClient({
        ...rec.originalClient,
        status: 'Closed' // Transition to Closed so it is hidden from active lists
      })
      addToast('Finance record removed successfully.', 'success')
    }
  }

  const triggerActionMenu = (e, id) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  return (
    <DashboardLayout>
      <div className="finance-entry-page">
        {/* Toggle shortcut block */}
        <div className="finance-entry-actions-row">
          <button 
            type="button" 
            className="data-btn data-btn-primary" 
            onClick={() => {
              if (isFormOpen && editId) {
                // If open in edit mode, cancel edit mode but keep open
                setEditId(null)
                handleResetForm()
              } else {
                setIsFormOpen(!isFormOpen)
              }
            }}
          >
            {isFormOpen ? '<X size={16} style={{marginRight: 6, verticalAlign: "middle"}} /> Close Form' : '<Plus size={16} style={{marginRight: 6, verticalAlign: "middle"}} /> New Client Entry'}
          </button>
        </div>

        {/* KPI Row */}
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
              <div className="kpi-value">₹{totalInvestments.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="kpi-tag trend-up"><Check size={14} style={{marginRight: 4, verticalAlign: "middle"}} /> 94% retention rate</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">ACTIVE INVESTMENTS</div>
              <div className="kpi-value">{activeClients.length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="kpi-tag critical">Action required</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">DUE THIS WEEK</div>
              <div className="kpi-value">{dueThisWeekCount}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="kpi-tag muted">Accrued this cycle</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">TOTAL INTEREST PAYABLE</div>
              <div className="kpi-value">₹{totalInterestPayable.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Collapsible Client Form */}
        {isFormOpen && (
          <div className="new-client-form-card">
            <div className="form-header-row">
              <div className="form-title-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                <span>{editId ? 'Edit Finance Record' : 'New Client Form'}</span>
              </div>
              <span className="entry-id-badge">{displayEntryId}</span>
            </div>

            <div className="entry-form-grid">
              <label className="span-2">
                Client Name *
                <input 
                  type="text" 
                  placeholder="Full legal name" 
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)} 
                />
              </label>

              <label>
                Mobile Number *
                <input 
                  type="text" 
                  placeholder="+91 XXXXX XXXXX" 
                  value={mobileNumber} 
                  onChange={e => setMobileNumber(e.target.value)} 
                />
              </label>

              <label>
                Email ID
                <input 
                  type="email" 
                  placeholder="client@example.com" 
                  value={emailId} 
                  onChange={e => setEmailId(e.target.value)} 
                />
              </label>

              <label>
                Loan Amount (₹) *
                <input 
                  type="number" 
                  placeholder="e.g. 50000" 
                  value={loanAmount} 
                  onChange={e => setLoanAmount(e.target.value)} 
                />
              </label>

              <label>
                Duration
                <select value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="< 3 Days">&lt; 3 Days</option>
                  <option value="< 7 Days">&lt; 7 Days</option>
                  <option value="< 15 Days">&lt; 15 Days</option>
                  <option value="< 30 Days">&lt; 30 Days</option>
                  <option value="30+ Days">30+ Days</option>
                </select>
              </label>

              <label>
                Aadhaar Number
                <input 
                  type="text" 
                  placeholder="XXXX XXXX XXXX" 
                  value={aadhaarNumber} 
                  onChange={e => setAadhaarNumber(e.target.value)} 
                />
              </label>

              <label>
                PAN Number
                <input 
                  type="text" 
                  placeholder="ABCDE1234F" 
                  value={panNumber} 
                  onChange={e => setPanNumber(e.target.value)} 
                />
              </label>

              <label>
                Due Date (Calculated)
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                />
              </label>

              <label>
                Interest Amount (₹)
                <input 
                  type="number" 
                  placeholder="Calculated interest" 
                  value={interestAmount} 
                  onChange={e => setInterestAmount(e.target.value)} 
                />
              </label>

              <label className="span-2">
                Co-Applicant Name
                <input 
                  type="text" 
                  placeholder="Secondary holder name" 
                  value={coApplicantName} 
                  onChange={e => setCoApplicantName(e.target.value)} 
                />
              </label>

              <label className="span-2 row-span-2">
                Address
                <textarea 
                  rows={4}
                  placeholder="Residential/Business address" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  style={{ resize: 'none', height: '100%' }}
                />
              </label>

              <label className="span-2">
                Co-Applicant Aadhaar Number
                <input 
                  type="text" 
                  placeholder="XXXX XXXX XXXX" 
                  value={coApplicantAadhaar} 
                  onChange={e => setCoApplicantAadhaar(e.target.value)} 
                />
              </label>

              <label className="span-2">
                EB - No
                <input 
                  type="text" 
                  placeholder="XXXX XXXX XXXX" 
                  value={ebNo} 
                  onChange={e => setEbNo(e.target.value)} 
                />
              </label>

              <label className="span-2">
                Remarks
                <input 
                  type="text" 
                  placeholder="Any additional notes..." 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                />
              </label>
            </div>

            <div className="modal-actions" style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button type="button" className="admin-action-btn" onClick={handleCancel}>Cancel</button>
              <button type="button" className="data-btn data-btn-outline" onClick={handleResetForm}>Reset</button>
              <button type="button" className="admin-primary-btn" onClick={handleSaveEntry}>Save Entry</button>
            </div>
          </div>
        )}

        {/* Client Records Table Panel */}
        <div className="new-client-form-card" style={{ padding: '20px 24px' }}>
          <div className="client-records-header-row">
            <div className="records-title-wrap">
              <h2 className="records-title">Client Records</h2>
              <span className="records-badge">{filteredRecords.length} TOTAL</span>
            </div>

            <div className="records-filter-toolbar">
              <div className="date-range-picker">
                <input 
                  type="date" 
                  className="date-range-input" 
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  title="From Date"
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>to</span>
                <input 
                  type="date" 
                  className="date-range-input" 
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  title="To Date"
                />
              </div>

              <div className="records-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by name, phone, or ID..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                type="button" 
                className="data-btn data-btn-outline" 
                onClick={handleExportCSV}
              >
                <Save size={16} style={{marginRight: 6, verticalAlign: "middle"}} /> Export Excel
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Mobile Number</th>
                  <th>Principal Amount</th>
                  <th>Interest</th>
                  <th>Total Payable</th>
                  <th>Due Date</th>
                  <th>Days Remaining</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px var(--border)' }}>
                      No active finance records found.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 700 }}>{rec.name}</td>
                      <td className="cell-muted" style={{ fontFamily: 'monospace' }}>{rec.phone}</td>
                      <td className="cell-amount">₹{rec.principal.toLocaleString('en-IN')}</td>
                      <td className="cell-amount" style={{ color: 'var(--text-secondary)' }}>₹{rec.interest.toLocaleString('en-IN')}</td>
                      <td className="cell-amount" style={{ fontWeight: 800 }}>₹{rec.total.toLocaleString('en-IN')}</td>
                      <td className="cell-muted">{rec.dueDate}</td>
                      <td>
                        <span className={`due-badge ${rec.dueClass}`}>
                          {rec.daysRemaining}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge status-active">
                          ACTIVE
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <button 
                          type="button" 
                          className="panel-more-btn" 
                          style={{ display: 'inline-flex', alignSelf: 'center' }}
                          onClick={(e) => triggerActionMenu(e, rec.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15 }}>
                            <circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>
                          </svg>
                        </button>

                        {activeMenuId === rec.id && (
                          <div className="profile-dropdown" style={{ top: 'auto', right: 0, bottom: '100%', zIndex: 100, width: 140 }}>
                            <button type="button" className="profile-dropdown-item" onClick={() => { setViewRecord(rec); setActiveMenuId(null) }}>
                              <FileText size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> View Details
                            </button>
                            <button type="button" className="profile-dropdown-item" onClick={() => handleEditRecord(rec)}>
                              <Edit size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Edit Details
                            </button>
                            <div className="profile-dropdown-divider" />
                            <button type="button" className="profile-dropdown-item danger" onClick={() => handleDeleteRecord(rec)}>
                              <Trash2 size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Delete Record
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

          {/* Pagination controls */}
          {filteredRecords.length > PAGE_SIZE && (
            <div className="data-pagination" style={{ borderTop: 'none', padding: '16px 0 0' }}>
              <span className="data-pagination-info">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(filteredRecords.length, currentPage * PAGE_SIZE)} of {filteredRecords.length} entries
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

        {/* View Details Modal */}
        {viewRecord && (
          <Modal title="Finance Record Details" onClose={() => setViewRecord(null)} size="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Client Name:</span>
                <span style={{ fontWeight: 700 }}>{viewRecord.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Mobile Number:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Email ID:</span>
                <span>{viewRecord.email || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Principal Amount:</span>
                <span className="cell-amount">₹{viewRecord.principal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Interest Payable:</span>
                <span className="cell-amount">₹{viewRecord.interest.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Payable:</span>
                <span className="cell-amount" style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{viewRecord.total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>PAN Card:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.pan_card || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Aadhaar Number:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.aadhaar_number || '—'}</span>
              </div>
              {viewRecord.originalClient.co_applicant_name && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Co-Applicant:</span>
                    <span style={{ fontWeight: 600 }}>{viewRecord.originalClient.co_applicant_name}</span>
                  </div>
                  {viewRecord.originalClient.co_applicant_aadhaar && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Co-Applicant Aadhaar:</span>
                      <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.co_applicant_aadhaar}</span>
                    </div>
                  )}
                </div>
              )}
              {viewRecord.originalClient.eb_no && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>EB - Consumer No:</span>
                  <span style={{ fontFamily: 'monospace' }}>{viewRecord.originalClient.eb_no}</span>
                </div>
              )}
              {viewRecord.originalClient.address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Billing Address:</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>{viewRecord.originalClient.address}</span>
                </div>
              )}
              {viewRecord.originalClient.remarks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Remarks:</span>
                  <span style={{ fontSize: 12.5, fontStyle: 'italic' }}>{viewRecord.originalClient.remarks}</span>
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
