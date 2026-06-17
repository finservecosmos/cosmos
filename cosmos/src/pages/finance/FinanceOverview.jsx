import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../../shared/lib/useConfirm'
import '../../shared/ui/DataPage.css'
import '../../shared/ui/DonutChart.css'
import './FinanceOverview.css'
import { FileText, Receipt, Mail, Edit, Trash2, TrendingUp } from 'lucide-react';

// Helper to calculate due date and urgency dynamically
function getDueInfo(clientDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const cDate = new Date(clientDateStr || new Date());
  const day = cDate.getDate() || 1;
  
  let dueYear = today.getFullYear();
  let dueMonth = today.getMonth();
  
  // If today is past the due day, the next due date is next month
  if (today.getDate() > day) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }
  
  const dueDate = new Date(dueYear, dueMonth, day);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
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

export default function FinanceOverview() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const confirm = useConfirm()
  const { clients, associates, transactions, investments, financeEntries, updateFinanceEntry } = useAppState()

  // Filters state
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  
  // Local overrides/deletions state to preserve manual UI edits safely
  const [removedDueIds, setRemovedDueIds] = useState([])
  const [dueOverrides, setDueOverrides] = useState({}) // id -> overridden fields
  
  // Interactive Donut States
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [donutTooltipPos, setDonutTooltipPos] = useState({ x: 0, y: 0 })

  // Active ellipses menu state
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Modals state
  const [viewRecord, setViewRecord] = useState(null)
  const [editRecord, setEditRecord] = useState(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 8

  useEffect(() => {
    document.title = 'Finance Overview | Cosmos'
  }, [])

  // Auto-close three-dot menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const totalInvestment = useMemo(() => {
    const active = investments || []
    return active
      .filter(inv => inv.status !== 'Inactive')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
  }, [investments])

  const totalPartnerAmount = useMemo(() => {
    const activeInvestments = investments || []
    return activeInvestments
      .filter(inv => inv.status === 'Active')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
  }, [investments])


  const totalIncome = useMemo(() => {
    return (transactions || [])
      .filter(t => t.type === 'Income' && t.status === 'Received')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  }, [transactions])

  const totalExpense = useMemo(() => {
    return (transactions || [])
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  }, [transactions])

  const currentBankBalance = useMemo(() => {
    const totalLent = (financeEntries || [])
      .filter(c => ['Approved', 'Processing', 'Active', 'Disbursed', 'Paid'].includes(c.status))
      .reduce((sum, c) => sum + Number(c.loan_amount || c.amount || 0), 0)
    const netProfit = totalIncome - totalExpense
    return totalInvestment - totalLent + netProfit
  }, [totalInvestment, financeEntries, totalIncome, totalExpense])

  // Derive all due records reactively from global financeEntries state
  const derivedDueRecords = useMemo(() => {
    const activeEntries = (financeEntries || []).filter(
      c => ['Processing', 'Approved', 'Active', 'Disbursed'].includes(c.status) && !removedDueIds.includes(c.id)
    )
    return activeEntries.map(c => {
      if (dueOverrides[c.id]) {
        return {
          id: c.id,
          ...dueOverrides[c.id],
          originalClient: c
        }
      }
      
      const { dueIn, dueClass, date, diffDays } = getDueInfo(c.due_date || c.date)
      const principal = Number(c.loan_amount || c.amount || 0)
      const interest = c.interest_amount !== undefined && c.interest_amount !== null ? Number(c.interest_amount) : Math.round(principal * 0.01)
      const total = principal + interest
      
      return {
        id: c.id,
        client: c.client_name || c.name || '',
        dueIn,
        dueClass,
        principal,
        interest,
        total,
        date,
        diffDays,
        originalClient: c
      }
    }).sort((a, b) => a.diffDays - b.diffDays)
  }, [financeEntries, removedDueIds, dueOverrides])

  // Filter due records by selected dates
  const filteredRecords = useMemo(() => {
    return derivedDueRecords.filter(rec => {
      if (fromDate && rec.date < fromDate) return false
      if (toDate && rec.date > toDate) return false
      return true
    })
  }, [derivedDueRecords, fromDate, toDate])

  const handleApplyFilter = () => {
    setCurrentPage(1)
    addToast('Filters applied successfully.', 'success')
  }

  const handleClearFilter = () => {
    setFromDate('')
    setToDate('')
    setCurrentPage(1)
    addToast('Filters cleared.', 'info')
  }

  // Interactive donut helpers
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const r = 70
  const innerR = 54
  const strokeW = r - innerR
  const circumference = 2 * Math.PI * r

  const formatCenterAmount = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`
    }
    return `₹${(amount / 100000).toFixed(2)}L`
  }

  const donutData = useMemo(() => {
    const total = totalPartnerAmount || 1
    const partnerGroups = {}
    
    const activeInvestments = investments || []
    activeInvestments.forEach(inv => {
      if (inv.status === 'Active') {
        partnerGroups[inv.partner] = (partnerGroups[inv.partner] || 0) + Number(inv.amount || 0)
      }
    })
    
    const colors = ['#c0392b', '#1e293b', '#e74c3c', '#cbd5e1', '#3498db', '#a0c4ff', '#8e44ad', '#2c3e50', '#27ae60']
    
    return Object.entries(partnerGroups).map(([type, count], index) => {
      const percent = Math.round((count / total) * 100)
      return {
        type,
        percent,
        count,
        color: colors[index % colors.length]
      }
    }).sort((a, b) => b.count - a.count)
  }, [investments, totalPartnerAmount])

  const donutSegments = useMemo(() => {
    const total = totalPartnerAmount || 1
    let cumulative = 0
    return donutData.map((item, i) => {
      const fraction = item.count / total
      const dashArray = `${fraction * circumference} ${circumference}`
      const rotation = cumulative * 360 - 90
      cumulative += fraction
      return { ...item, index: i, dashArray, rotation }
    })
  }, [donutData, totalPartnerAmount, circumference])

  const loanDurationDistribution = useMemo(() => {
    const active = [...(clients || []), ...(financeEntries || [])]
      .filter(c => ['Approved', 'Processing', 'Active', 'Disbursed'].includes(c.status))

    const counts = { '< 3 Days': 0, '< 7 Days': 0, '< 15 Days': 0, '< 30 Days': 0, '< 45 Days': 0 }
    let total = 0
    active.forEach(c => {
      if (counts[c.duration] !== undefined) {
        counts[c.duration]++
        total++
      }
    })

    if (total === 0) return { '< 3 Days': 0, '< 7 Days': 0, '< 15 Days': 0, '< 30 Days': 0, '< 45 Days': 0 }

    return {
      '< 3 Days': Math.round((counts['< 3 Days'] / total) * 100),
      '< 7 Days': Math.round((counts['< 7 Days'] / total) * 100),
      '< 15 Days': Math.round((counts['< 15 Days'] / total) * 100),
      '< 30 Days': Math.round((counts['< 30 Days'] / total) * 100),
      '< 45 Days': Math.round((counts['< 45 Days'] / total) * 100),
    }
  }, [clients, financeEntries])

  const handleDonutInteraction = (seg, e) => {
    setHoveredSegment(seg)
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDonutTooltipPos({
      x: clientX - rect.left + 15,
      y: clientY - rect.top + 15
    })
  }

  // Ellipsis actions
  const triggerActionMenu = (e, id) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  const handleViewDetails = (rec) => {
    setViewRecord(rec)
    setActiveMenuId(null)
  }

  const handleEditRecord = (rec) => {
    setEditRecord({ ...rec })
    setActiveMenuId(null)
  }

  const handleSaveEdit = () => {
    const principal = Number(editRecord.principal) || 0
    const interest = Number(editRecord.interest) || 0
    const total = principal + interest
    
    setDueOverrides(prev => ({
      ...prev,
      [editRecord.id]: {
        client: editRecord.client,
        dueIn: editRecord.dueIn,
        dueClass: editRecord.dueClass || 'gray',
        principal,
        interest,
        total,
        date: editRecord.date,
        diffDays: editRecord.diffDays || 15
      }
    }))

    // Synchronize client details back to global context
    const original = (financeEntries || []).find(c => c.id === editRecord.id)
    if (original) {
      updateFinanceEntry({
        ...original,
        client_name: editRecord.client,
        loan_amount: principal,
        interest_amount: interest,
        due_date: editRecord.date
      })
    }

    setEditRecord(null)
    addToast('Due record updated successfully.', 'success')
  }

  const handleDeleteRecord = async (rec) => {
    setActiveMenuId(null)
    const confirmed = await confirm({
      title: 'Remove Due Record',
      message: `Are you sure you want to permanently remove ${rec.client}'s due entry? This action is permanent.`
    })
    if (confirmed) {
      const res = await updateFinanceEntry({
        ...rec.originalClient,
        status: 'Closed'
      })
      if (res.success) {
        addToast('Due record removed successfully.', 'success')
      } else {
        addToast(res.error || 'Failed to remove due record.', 'error')
      }
    }
  }

  const handleSendReminder = (rec) => {
    setActiveMenuId(null)
    addToast(`Compliance reminder successfully dispatched to ${rec.client}.`, 'success')
  }

  const handleGenerateInvoice = (rec) => {
    setActiveMenuId(null)
    // Redirect to Invoice page with pre-filled state
    navigate(`/payments/invoice?client=${encodeURIComponent(rec.client)}&amount=${rec.total}`)
    addToast(`Prefilled invoice builder for ${rec.client}.`, 'info')
  }

  // Pagination math
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE)
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <DashboardLayout>
      <div className="finance-overview">
        {/* KPI Row */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="kpi-tag trend-up">↗ 12.5%</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Investment</div>
              <div className="kpi-value">₹{totalInvestment.toLocaleString('en-IN')}</div>
            </div>
          </div>


          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="kpi-tag muted">Updated 2m ago</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Bank Account Balance</div>
              <div className="kpi-value" style={{ color: currentBankBalance < 0 ? '#dc2626' : undefined }}>₹{currentBankBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="kpi-tag trend-up" style={{ color: 'var(--accent)' }}>+ Income</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Income</div>
              <div className="kpi-value" style={{ color: 'var(--accent)' }}>₹{totalIncome.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Date Filter Card */}
        <div className="filter-card">
          <div className="filter-group">
            <label htmlFor="fromDate">From Date</label>
            <input 
              id="fromDate"
              type="date" 
              className="filter-input" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="toDate">To Date</label>
            <input 
              id="toDate"
              type="date" 
              className="filter-input" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <button className="data-btn data-btn-primary" onClick={handleApplyFilter}>Apply Filter</button>
            <button className="data-btn data-btn-outline" onClick={handleClearFilter}>Clear</button>
          </div>
        </div>

        {/* Middle Section (Donut & Due List) */}
        <div className="overview-middle-row">
          {/* Investment Distribution Chart Panel */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title">Investment Distribution</h3>
                <p className="panel-subtitle">Primary funding segment weights</p>
              </div>
              <button className="panel-more-btn" title="More Options">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>

            <div className="donut-container" style={{ minHeight: 180 }}>
              <div className="donut-wrapper" style={{ flexDirection: 'column', gap: 16 }}>
                <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
                  <svg 
                    width={size} 
                    height={size} 
                    viewBox={`0 0 ${size} ${size}`} 
                    className={`donut-svg${hoveredSegment ? ' has-hover' : ''}`}
                  >
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={strokeW} />
                    {donutSegments.map((seg, i) => {
                      const isHovered = hoveredSegment && hoveredSegment.index === seg.index
                      return (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={isHovered ? strokeW + 4 : strokeW}
                          strokeDasharray={seg.dashArray}
                          strokeDashoffset={0}
                          transform={`rotate(${seg.rotation} ${cx} ${cy})`}
                          strokeLinecap="butt"
                          className={`donut-segment${isHovered ? ' active' : ''}`}
                          style={{
                            transition: 'stroke-width 0.2s, filter 0.2s, opacity 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => handleDonutInteraction(seg, e)}
                          onMouseMove={(e) => handleDonutInteraction(seg, e)}
                          onMouseLeave={() => setHoveredSegment(null)}
                          onTouchStart={(e) => handleDonutInteraction(seg, e)}
                          onTouchMove={(e) => handleDonutInteraction(seg, e)}
                          onTouchEnd={() => setHoveredSegment(null)}
                        />
                      )
                    })}
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: '0 12px' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {hoveredSegment ? formatCenterAmount(hoveredSegment.count) : formatCenterAmount(totalPartnerAmount)}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2, marginTop: 4 }}>
                      {hoveredSegment ? hoveredSegment.type : 'Partner Investments'}
                    </span>
                  </div>

                  {hoveredSegment && (
                    <div className="donut-tooltip" style={{ left: `${donutTooltipPos.x}px`, top: `${donutTooltipPos.y}px` }}>
                      <div className="donut-tooltip-header">
                        <span className="donut-tooltip-dot" style={{ background: hoveredSegment.color }} />
                        <span className="donut-tooltip-type">{hoveredSegment.type}</span>
                      </div>
                      <div className="donut-tooltip-body">
                        <span className="donut-tooltip-count">₹{hoveredSegment.count.toLocaleString('en-IN')}</span>
                        <span className="donut-tooltip-pct">{hoveredSegment.percent}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend list inside card */}
                <div className="donut-legend" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px 16px', width: '100%', marginTop: 8 }}>
                  {donutSegments.map((seg, i) => (
                    <div 
                      key={i} 
                      className={`donut-legend-item${hoveredSegment && hoveredSegment.index === seg.index ? ' active' : ''}`}
                      onMouseEnter={() => setHoveredSegment(seg)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 4, background: hoveredSegment && hoveredSegment.index === seg.index ? 'var(--bg-hover)' : 'transparent', cursor: 'default' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                        <span className="donut-dot" style={{ background: seg.color, width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
                        <span className="donut-label" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{seg.type}</span>
                      </div>
                      <span className="donut-percent" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>{seg.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Due List Urgency Table Panel */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title">Due List Urgency</h3>
                <p className="panel-subtitle">Track upcoming dues and take action on time</p>
              </div>
              <button className="panel-more-btn" onClick={() => navigate('/finance/entry')}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginRight: 4 }}>View All Records</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div style={{ overflowX: 'auto', paddingBottom: 160 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Client Name</th>
                    <th>Due In</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Total Due</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                        No records match the active criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((rec, index) => (
                      <tr key={rec.id}>
                        <td className="cell-muted" style={{ fontWeight: 600 }}>
                          {String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(2, '0')}
                        </td>
                        <td style={{ fontWeight: 600 }}>{rec.client}</td>
                        <td>
                          <span className={`due-badge ${rec.dueClass}`}>
                            {rec.dueIn}
                          </span>
                        </td>
                        <td className="cell-amount">₹{rec.principal.toLocaleString('en-IN')}</td>
                        <td className="cell-amount">₹{rec.interest.toLocaleString('en-IN')}</td>
                        <td className="cell-amount" style={{ fontWeight: 700 }}>₹{rec.total.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-menu-container" style={{ zIndex: activeMenuId === rec.id ? 999 : 1, position: 'relative' }}>
                            <button 
                              type="button" 
                              className="panel-more-btn" 
                              style={{ display: 'inline-flex', alignSelf: 'center' }}
                              onClick={(e) => triggerActionMenu(e, rec.id)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15 }}>
                                <circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>
                              </svg>
                            </button>

                            {activeMenuId === rec.id && (
                              <div className="action-popover" style={{ width: 160 }} onClick={(e) => e.stopPropagation()}>
                                <button className="popover-item" onClick={() => { handleViewDetails(rec); setActiveMenuId(null); }}>
                                  <FileText size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> View Details
                                </button>
                                <button className="popover-item" onClick={() => { handleGenerateInvoice(rec); setActiveMenuId(null); }}>
                                  <Receipt size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Gen Invoice
                                </button>
                                <button className="popover-item" onClick={() => { handleSendReminder(rec); setActiveMenuId(null); }}>
                                  <Mail size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Send Reminder
                                </button>
                                <button className="popover-item" onClick={() => { handleEditRecord(rec); setActiveMenuId(null); }}>
                                  <Edit size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Edit Details
                                </button>
                                <button className="popover-item danger" onClick={() => { handleDeleteRecord(rec); setActiveMenuId(null); }}>
                                  <Trash2 size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredRecords.length > PAGE_SIZE && (
              <div className="data-pagination" style={{ borderTop: 'none', padding: '12px 0 0' }}>
                <span className="data-pagination-info">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(filteredRecords.length, currentPage * PAGE_SIZE)} of {filteredRecords.length} records
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
        </div>

        {/* Bottom Section (Collection Performance) */}
        <div className="overview-bottom-row">
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title"><TrendingUp size={18} style={{marginRight: 6, verticalAlign: "middle"}} /> Loans Collection Performance</h3>
                <p className="panel-subtitle">Collection efficiency breakdown by timeframe</p>
              </div>
            </div>

            <div className="vertical-bar-chart-container">
              {/* Y Axis Gridlines */}
              <div className="chart-vertical-axis">
                <div className="chart-gridline-label"><span>100%</span></div>
                <div className="chart-gridline-label"><span>80%</span></div>
                <div className="chart-gridline-label"><span>60%</span></div>
                <div className="chart-gridline-label"><span>40%</span></div>
                <div className="chart-gridline-label"><span>20%</span></div>
                <div className="chart-gridline-label"><span>0%</span></div>
              </div>

              {/* Graphical Bars */}
              <div className="chart-bars-graphics-container">
                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect income-bar"
                      style={{ height: `${loanDurationDistribution['< 3 Days']}%` }}
                    >
                      <span className="bar-hover-badge">{loanDurationDistribution['< 3 Days']}%</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">&lt; 3 Days</span>
                </div>

                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect income-bar"
                      style={{ height: `${loanDurationDistribution['< 7 Days']}%` }}
                    >
                      <span className="bar-hover-badge">{loanDurationDistribution['< 7 Days']}%</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">&lt; 7 Days</span>
                </div>

                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect profit-bar"
                      style={{ height: `${loanDurationDistribution['< 15 Days']}%` }}
                    >
                      <span className="bar-hover-badge">{loanDurationDistribution['< 15 Days']}%</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">&lt; 15 Days</span>
                </div>

                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect expense-bar"
                      style={{ height: `${loanDurationDistribution['< 30 Days']}%` }}
                    >
                      <span className="bar-hover-badge">{loanDurationDistribution['< 30 Days']}%</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">&lt; 30 Days</span>
                </div>

                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect profit-bar"
                      style={{ height: `${loanDurationDistribution['< 45 Days']}%` }}
                    >
                      <span className="bar-hover-badge">{loanDurationDistribution['< 45 Days']}%</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">&lt; 45 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="overview-footer">
          <span className="overview-footer-copy">© 2026 Cosmos Finserve Elite. All Rights Reserved.</span>
          <div className="overview-footer-links">
            <a href="#" className="overview-footer-link" onClick={(e) => { e.preventDefault(); addToast('Privacy Policy details.', 'info') }}>Privacy Policy</a>
            <a href="#" className="overview-footer-link" onClick={(e) => { e.preventDefault(); addToast('Security parameters.', 'info') }}>Security Center</a>
            <a href="#" className="overview-footer-link" onClick={(e) => { e.preventDefault(); addToast('Terms of Service agreement.', 'info') }}>Terms of Service</a>
          </div>
        </div>

        {/* View Modal */}
        {viewRecord && (
          <Modal title="Due List Record Details" onClose={() => setViewRecord(null)} size="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Client Name:</span>
                <span style={{ fontWeight: 700 }}>{viewRecord.client}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Payment urgency:</span>
                <span className={`due-badge ${viewRecord.dueClass}`}>{viewRecord.dueIn}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Principal amount:</span>
                <span className="cell-amount">₹{viewRecord.principal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Interest accrued:</span>
                <span className="cell-amount">₹{viewRecord.interest.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Due:</span>
                <span className="cell-amount" style={{ fontWeight: 800, color: 'var(--accent)' }}>
                  ₹{viewRecord.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="admin-action-btn" onClick={() => setViewRecord(null)}>Close</button>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {editRecord && (
          <Modal title="Edit Due Record" onClose={() => setEditRecord(null)} size="sm">
            <div className="form-grid">
              <label>
                Client Name
                <input 
                  type="text" 
                  value={editRecord.client || ''} 
                  onChange={(e) => setEditRecord({ ...editRecord, client: e.target.value })} 
                />
              </label>
              <label>
                Due Urgency text
                <input 
                  type="text" 
                  value={editRecord.dueIn || ''} 
                  onChange={(e) => setEditRecord({ ...editRecord, dueIn: e.target.value })} 
                />
              </label>
              <label>
                Principal amount (₹)
                <input 
                  type="number" 
                  value={editRecord.principal || ''} 
                  onChange={(e) => setEditRecord({ ...editRecord, principal: e.target.value })} 
                />
              </label>
              <label>
                Interest accrued (₹)
                <input 
                  type="number" 
                  value={editRecord.interest || ''} 
                  onChange={(e) => setEditRecord({ ...editRecord, interest: e.target.value })} 
                />
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: 24 }}>
              <button type="button" className="admin-action-btn" onClick={() => setEditRecord(null)}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={handleSaveEdit}>Save changes</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
