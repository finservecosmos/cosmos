import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../../shared/lib/useConfirm'
import DonutChart from '../../shared/ui/DonutChart'
import '../../shared/ui/DataPage.css'
import './FinanceIncomeExpenses.css'
import { X, Plus, Download, Edit, Trash2, FileText } from 'lucide-react';

export default function FinanceIncomeExpenses() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const confirm = useConfirm()
  const { transactions, addTransaction, updateTransaction, removeTransaction, clients, financeEntries, investments } = useAppState()

  // Date range selectors (Page Header)
  const [headerFromDate, setHeaderFromDate] = useState('2026-06-01')
  const [headerToDate, setHeaderToDate] = useState('2026-06-30')

  // Form toggle state
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Form state
  const [entryType, setEntryType] = useState('Income') // 'Income' or 'Expense'
  const [entryDate, setEntryDate] = useState('2026-06-20')
  const [entryName, setEntryName] = useState('')
  const [entryCategory, setEntryCategory] = useState('Processing Fee')
  const [entryAmount, setEntryAmount] = useState('')
  const [entryRemarks, setEntryRemarks] = useState('')

  // Edit mode state
  const [editId, setEditId] = useState(null)
  const [viewRecord, setViewRecord] = useState(null)

  // Table filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [tableFromDate, setTableFromDate] = useState('2026-06-01')
  const [tableToDate, setTableToDate] = useState('2026-06-30')
  const [filterType, setFilterType] = useState('All')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 8

  // Action Menu active row ID
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    document.title = 'Income & Expenses | Cosmos'
  }, [])

  // Auto-close actions menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  // Default category sync when switching Entry Type
  useEffect(() => {
    if (entryType === 'Income') {
      setEntryCategory('Processing Fee')
    } else {
      setEntryCategory('Office Rent')
    }
  }, [entryType])

  // Reactively filter transactions based on selected date ranges
  const dateFilteredTransactions = useMemo(() => {
    const list = transactions || []
    return list.filter(t => {
      const d = t.date || ''
      return d >= headerFromDate && d <= headerToDate
    })
  }, [transactions, headerFromDate, headerToDate])

  // KPI calculations
  const totalIncome = useMemo(() => {
    return dateFilteredTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  }, [dateFilteredTransactions])

  const totalExpenses = useMemo(() => {
    return dateFilteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  }, [dateFilteredTransactions])

  const netProfit = useMemo(() => {
    return totalIncome - totalExpenses
  }, [totalIncome, totalExpenses])

  const baseBankBalance = useMemo(() => {
    const totalInv = (investments || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    const totalLent = [...(clients || []), ...(financeEntries || [])]
      .filter(c => ['Approved', 'Processing', 'Active', 'Disbursed', 'Paid'].includes(c.status))
      .reduce((sum, c) => sum + Number(c.loan_amount || c.amount || 0), 0)
    return Math.max(0, totalInv - totalLent)
  }, [investments, clients, financeEntries])

  const currentBalance = useMemo(() => {
    const allTimeIncome = (transactions || [])
      .filter(t => t.type === 'Income' && t.status === 'Received')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const allTimeExpense = (transactions || [])
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const allTimeNetProfit = allTimeIncome - allTimeExpense
    
    return baseBankBalance + allTimeNetProfit
  }, [baseBankBalance, transactions])

  const lastMonthStats = useMemo(() => {
    const fromD = new Date(headerFromDate)
    const prevMonthFrom = new Date(fromD.getFullYear(), fromD.getMonth() - 1, 1)
    const prevMonthTo = new Date(fromD.getFullYear(), fromD.getMonth(), 0)
    
    const prevFromStr = prevMonthFrom.toISOString().slice(0, 10)
    const prevToStr = prevMonthTo.toISOString().slice(0, 10)

    const prevTx = (transactions || []).filter(t => {
      const d = t.date || ''
      return d >= prevFromStr && d <= prevToStr
    })

    const income = prevTx.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const expenses = prevTx.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const profit = income - expenses

    return { income, expenses, profit }
  }, [transactions, headerFromDate])

  const calcPct = (current, prev) => {
    if (prev === 0) return 0
    return ((current - prev) / prev) * 100
  }

  const incomePct = calcPct(totalIncome, lastMonthStats.income)
  const expensePct = calcPct(totalExpenses, lastMonthStats.expenses)
  const profitPct = calcPct(netProfit, lastMonthStats.profit)

  const renderKpiTag = (pct) => {
    if (pct === 0) {
      return <span className="kpi-tag muted" style={{ background: '#f1f5f9', color: '#64748b' }}>0% vs last month</span>
    }
    if (pct > 0) {
      return <span className="kpi-tag trend-up">↗ +{pct.toFixed(1)}% vs last month</span>
    }
    return <span className="kpi-tag trend-down">↘ {pct.toFixed(1)}% vs last month</span>
  }

  // Table display records (further filtered by search & table toolbar dates)
  const derivedRecordsList = useMemo(() => {
    return dateFilteredTransactions.filter(t => {
      const d = t.date || ''
      const matchDates = d >= tableFromDate && d <= tableToDate

      const query = searchQuery.toLowerCase().trim()
      const matchSearch = !query ||
        (t.name && t.name.toLowerCase().includes(query)) ||
        (t.category && t.category.toLowerCase().includes(query)) ||
        (t.particular && t.particular.toLowerCase().includes(query))

      const matchType = filterType === 'All' || t.type === filterType

      return matchDates && matchSearch && matchType
    }).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id))
  }, [dateFilteredTransactions, tableFromDate, tableToDate, searchQuery, filterType])

  // Pagination
  const totalPages = Math.ceil(derivedRecordsList.length / PAGE_SIZE)
  const paginatedRecords = derivedRecordsList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, tableFromDate, tableToDate, filterType])

  // Income breakdowns
  const incomeBreakdown = useMemo(() => {
    const total = totalIncome || 1
    const grouped = {
      'Processing Fee': 0,
      'Commission': 0,
      'Interest Collection': 0,
      'Others': 0
    }
    dateFilteredTransactions
      .filter(t => t.type === 'Income')
      .forEach(t => {
        const cat = t.category || 'Processing Fee'
        if (grouped[cat] !== undefined) {
          grouped[cat] += Number(t.amount || 0)
        } else {
          grouped['Others'] += Number(t.amount || 0) // default fallback
        }
      })
    return Object.entries(grouped).map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100)
    }))
  }, [dateFilteredTransactions, totalIncome])

  // Expense breakdowns
  const expenseBreakdown = useMemo(() => {
    const total = totalExpenses || 1
    const grouped = {
      'Office Rent': 0,
      'Salaries': 0,
      'Operational': 0,
      'Others': 0
    }
    dateFilteredTransactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        const cat = t.category || 'Operational'
        if (grouped[cat] !== undefined) {
          grouped[cat] += Number(t.amount || 0)
        } else if (cat === 'Petrol') {
          grouped['Operational'] += Number(t.amount || 0) // Petrol falls under Operational
        } else {
          grouped['Others'] += Number(t.amount || 0) // Default fallback
        }
      })
    return Object.entries(grouped).map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100)
    }))
  }, [dateFilteredTransactions, totalExpenses])

  // Donut SVG parameters
  const size = 110
  const cx = size / 2
  const cy = size / 2
  const r = 38
  const strokeW = 10
  const circumference = 2 * Math.PI * r

  const getDonutSegments = (breakdownData) => {
    const total = breakdownData.reduce((sum, d) => sum + d.count, 0) || 1
    let cumulative = 0
    const colors = {
      'Processing Fee': '#16a34a',
      'Commission': '#3498db',
      'Interest Collection': '#f39c12',
      'Office Rent': '#e74c3c',
      'Salaries': '#e67e22',
      'Operational': '#9b59b6',
      'Others': '#95a5a6'
    }
    return breakdownData.map((item) => {
      const fraction = item.count / total
      const dashArray = `${fraction * circumference} ${circumference}`
      const rotation = cumulative * 360 - 90
      cumulative += fraction
      return {
        ...item,
        dashArray,
        rotation,
        color: colors[item.type] || '#bdc3c7'
      }
    })
  }

  const incomeSegments = useMemo(() => getDonutSegments(incomeBreakdown), [incomeBreakdown])
  const expenseSegments = useMemo(() => getDonutSegments(expenseBreakdown), [expenseBreakdown])

  // Format dynamic Lakh display
  const formatAmountLakhs = (amount) => {
    return `₹${(amount / 100000).toFixed(1)}L`
  }

  // Save / Update logic
  const handleSaveEntry = () => {
    if (!entryDate || !entryName.trim() || !entryAmount) {
      addToast('Date, Name, and Amount are required.', 'error')
      return
    }
    if (Number(entryAmount) <= 0) {
      addToast('Amount must be a positive number.', 'error')
      return
    }

    const payload = {
      date: entryDate,
      type: entryType,
      name: entryName.trim(),
      particular: entryType === 'Income' ? `${entryCategory} Received` : `${entryCategory} Payment`,
      category: entryCategory,
      amount: Number(entryAmount),
      status: entryType === 'Income' ? 'Received' : 'Paid',
      remarks: entryRemarks.trim()
    }

    if (editId) {
      updateTransaction({
        ...payload,
        id: editId
      })
      addToast('Transaction entry updated successfully.', 'success')
    } else {
      addTransaction(payload)
      addToast('New transaction entry saved.', 'success')
    }

    handleCancelForm()
  }

  const handleCancelForm = () => {
    setEntryName('')
    setEntryRemarks('')
    setEntryAmount('')
    setEditId(null)
    setIsFormOpen(false)
  }

  const handleResetForm = () => {
    setEntryName('')
    setEntryRemarks('')
    setEntryAmount('')
    setEntryDate('2026-06-20')
  }

  const handleEditRecord = (rec) => {
    setEditId(rec.id)
    setEntryType(rec.type)
    setEntryDate(rec.date)
    setEntryName(rec.name)
    setEntryCategory(rec.category)
    setEntryAmount(String(rec.amount))
    setEntryRemarks(rec.remarks || '')
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteRecord = async (rec) => {
    setActiveMenuId(null)
    const confirmed = await confirm({
      title: 'Remove Transaction Record',
      message: `Are you sure you want to permanently delete this ${rec.type.toLowerCase()} record of ₹${rec.amount.toLocaleString()}?`
    })
    if (confirmed) {
      removeTransaction(rec.id)
      addToast('Transaction record deleted.', 'success')
    }
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Name', 'Particular/Purpose', 'Category', 'Amount', 'Status', 'Remarks']
    const rows = derivedRecordsList.map(rec => [
      rec.date,
      rec.type,
      rec.name,
      rec.particular,
      rec.category,
      rec.amount,
      rec.status,
      rec.remarks || '-'
    ])

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Income_Expenses_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Records exported successfully.', 'success')
  }

  const triggerActionMenu = (e, id) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    return d.toLocaleDateString('en-GB', options)
  }

  return (
    <DashboardLayout>
      <div className="income-expenses-page">
        {/* Date Selector Row */}
        <div className="finance-investment-actions-row" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="range-filter-container">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Scope Range:</span>
            <input
              type="date"
              className="date-scope-input"
              value={headerFromDate}
              onChange={e => setHeaderFromDate(e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              className="date-scope-input"
              value={headerToDate}
              onChange={e => setHeaderToDate(e.target.value)}
            />
          </div>
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
            {isFormOpen ? 'Close Form' : 'New Entry'}
          </button>
        </div>

        {/* KPI Metrics */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              {renderKpiTag(incomePct)}
            </div>
            <div className="kpi-body">
              <div className="kpi-title">TOTAL INCOME</div>
              <div className="kpi-value">₹{totalIncome.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
              </div>
              {renderKpiTag(expensePct)}
            </div>
            <div className="kpi-body">
              <div className="kpi-title">TOTAL EXPENSES</div>
              <div className="kpi-value">₹{totalExpenses.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#3498db' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              {renderKpiTag(profitPct)}
            </div>
            <div className="kpi-body">
              <div className="kpi-title">NET PROFIT</div>
              <div className="kpi-value" style={{ color: 'var(--accent)' }}>₹{netProfit.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#9b59b6' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span className="kpi-tag muted">As on {headerToDate ? formatDateDisplay(headerToDate) : '20 Jun 2026'}</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">BANK ACCOUNT BALANCE</div>
              <div className="kpi-value">₹{currentBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Collapsible Add Entry Form & Running Balance Info */}
        {isFormOpen && (
          <Modal
            size="lg"
            title={editId ? 'Modify Transaction Entry' : 'Add New Income / Expense Entry'}
            subtitle="Please enter the transaction details below."
            onClose={() => setIsFormOpen(false)}
            headerAction={
              <div className="form-type-toggles" style={{ margin: 0 }}>
                <label className={`toggle-btn ${entryType === 'Income' ? 'active income' : ''}`}>
                  <input
                    type="radio"
                    name="entryType"
                    checked={entryType === 'Income'}
                    onChange={() => setEntryType('Income')}
                  />
                  Income
                </label>
                <label className={`toggle-btn ${entryType === 'Expense' ? 'active expense' : ''}`}>
                  <input
                    type="radio"
                    name="entryType"
                    checked={entryType === 'Expense'}
                    onChange={() => setEntryType('Expense')}
                  />
                  Expense
                </label>
              </div>
            }
          >
            <div className="form-grid" style={{ paddingTop: '10px' }}>
                <label>
                  Date *
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                  />
                </label>

                <label>
                  Name / Payer / Payee *
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={entryName}
                    onChange={e => setEntryName(e.target.value)}
                  />
                </label>

                <label>
                  Category
                  <select
                    value={entryCategory}
                    onChange={e => setEntryCategory(e.target.value)}
                  >
                    {entryType === 'Income' ? (
                      <>
                        <option value="Processing Fee">Processing Fee</option>
                        <option value="Commission">Commission</option>
                        <option value="Interest Collection">Interest Collection</option>
                        <option value="Other Income">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Office Rent">Office Rent</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Operational">Operational</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Other Expense">Other Expense</option>
                      </>
                    )}
                  </select>
                </label>

                <label>
                  Amount (₹) *
                  <input
                    type="number"
                    placeholder="0.00"
                    value={entryAmount}
                    onChange={e => setEntryAmount(e.target.value)}
                  />
                </label>

                <label className="form-grid-full">
                  Remarks (Optional)
                  <textarea
                    rows={2}
                    placeholder="Enter purpose or additional notes..."
                    value={entryRemarks}
                    onChange={e => setEntryRemarks(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="admin-action-btn" onClick={handleCancelForm} style={{ color: '#ef4444', textDecoration: 'none', background: 'transparent', border: 'none', marginRight: 'auto' }}>Cancel</button>
                <button type="button" className="data-btn data-btn-outline" onClick={handleResetForm}>Reset</button>
                <button type="button" className="admin-primary-btn" onClick={handleSaveEntry}>Save Entry</button>
              </div>
          </Modal>
        )}

        {/* Charts Row */}
        <div className="charts-flex-row">
          {/* Income vs Expenses Bar Chart */}
          <div className="panel-card bar-chart-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title">Income vs Expense</h3>
                <p className="panel-subtitle">Performance breakdown comparison</p>
              </div>
              <div className="view-selector">
                <span className="view-label">VIEW:</span>
                <select className="view-select-dropdown" style={{ border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--accent)', cursor: 'pointer', outline: 'none' }}>
                  <option>This Month</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>

            <div className="vertical-bar-chart-container">
              {/* Y Axis Gridlines */}
              <div className="chart-vertical-axis">
                <div className="chart-gridline-label"><span>5L</span></div>
                <div className="chart-gridline-label"><span>4L</span></div>
                <div className="chart-gridline-label"><span>3L</span></div>
                <div className="chart-gridline-label"><span>2L</span></div>
                <div className="chart-gridline-label"><span>1L</span></div>
                <div className="chart-gridline-label"><span>0</span></div>
              </div>

              {/* Graphical Bars */}
              <div className="chart-bars-graphics-container">
                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect income-bar"
                      style={{ height: `${Math.min(100, (totalIncome / 500000) * 100)}%` }}
                    >
                      <span className="bar-hover-badge">₹{totalIncome.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">INCOME</span>
                </div>

                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect expense-bar"
                      style={{ height: `${Math.min(100, (totalExpenses / 500000) * 100)}%` }}
                    >
                      <span className="bar-hover-badge">₹{totalExpenses.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">EXPENSE</span>
                </div>

                <div className="chart-graphics-column">
                  <div className="chart-bar-fill-wrapper">
                    <div
                      className="chart-bar-rect profit-bar"
                      style={{ height: `${Math.max(0, Math.min(100, (netProfit / 500000) * 100))}%` }}
                    >
                      <span className="bar-hover-badge">₹{netProfit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className="bar-column-axis-label">PROFIT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Donut Grid */}
          <div className="panel-card breakdown-donut-panel">
            <div className="panel-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 12 }}>
              <h3 className="panel-title">Segment Weight Breakdown</h3>
            </div>

            <div className="breakdown-donuts-grid">
              {/* Income Breakdown */}
              <div className="donut-segment-column">
                <h4 className="donut-header-title">Income Breakdown</h4>
                <div className="donut-svg-legend-wrapper">
                  <DonutChart
                    data={incomeSegments}
                    formatter={formatAmountLakhs}
                    centerLabel="TOTAL"
                    tooltipLabel="INR"
                  />
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="donut-segment-column">
                <h4 className="donut-header-title">Expense Breakdown</h4>
                <div className="donut-svg-legend-wrapper">
                  <DonutChart
                    data={expenseSegments}
                    formatter={formatAmountLakhs}
                    centerLabel="TOTAL"
                    tooltipLabel="INR"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table Card */}
        <div className="investment-form-card" style={{ padding: '20px 24px' }}>
          <div className="client-records-header-row" style={{ marginBottom: 16 }}>
            <div className="records-title-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18, color: 'var(--accent)' }}>
                <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
              </svg>
              <h2 className="records-title">Income & Expense Records</h2>
            </div>

            <div className="records-filter-toolbar">
              <div className="type-filter-container" style={{ marginRight: '8px' }}>
                <select 
                  className="date-scope-input" 
                  style={{ cursor: 'pointer', paddingRight: '24px' }} 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="range-filter-container table-inner-dates">
                <span>From</span>
                <input
                  type="date"
                  className="date-scope-input table-dates"
                  value={tableFromDate}
                  onChange={e => setTableFromDate(e.target.value)}
                />
                <span>To</span>
                <input
                  type="date"
                  className="date-scope-input table-dates"
                  value={tableToDate}
                  onChange={e => setTableToDate(e.target.value)}
                />
              </div>

              <div className="records-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search records..."
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
                <Download size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Export CSV
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', paddingBottom: 80 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Particular / Purpose</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px var(--border)' }}>
                      No income or expense records found.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td className="cell-muted">{formatDateDisplay(rec.date)}</td>
                      <td>
                        <span className={`status-badge-outline ${rec.type.toLowerCase()}`}>
                          {rec.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{rec.name}</td>
                      <td className="cell-primary-purpose">{rec.particular}</td>
                      <td className="cell-muted">{rec.category}</td>
                      <td className={`cell-amount bold-amount ${rec.type.toLowerCase()}`}>
                        ₹{rec.amount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`transaction-status-tag ${rec.status.toLowerCase()}`}>
                          <span className="status-dot" />
                          {rec.status}
                        </span>
                      </td>
                      <td className="cell-muted text-remarks-col">{rec.remarks || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          <button
                            type="button"
                            className="panel-more-btn"
                            title="Edit Record"
                            onClick={() => handleEditRecord(rec)}
                          >
                            <Edit size={16} />
                          </button>
                          <div className="action-menu-container" style={{ zIndex: activeMenuId === rec.id ? 999 : 1, position: 'relative' }}>
                            <button
                              type="button"
                              className="panel-more-btn"
                              title="More Actions"
                              onClick={(e) => triggerActionMenu(e, rec.id)}
                            >
                              ⋮
                            </button>

                            {activeMenuId === rec.id && (
                              <div className="action-popover" onClick={(e) => e.stopPropagation()}>
                                <button className="popover-item" onClick={() => { 
                                  setViewRecord(rec); 
                                  setActiveMenuId(null);
                                }}>
                                  <FileText size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> View Details
                                </button>
                                <button className="popover-item" onClick={() => { 
                                  setActiveMenuId(null);
                                  navigate('/finance/invoice', { state: { prefillName: rec.name, prefillParticular: rec.particular, prefillAmount: rec.amount, prefillType: rec.type, prefillDate: rec.date } });
                                }}>
                                  <FileText size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Generate Invoice
                                </button>
                                <button className="popover-item danger" onClick={() => { handleDeleteRecord(rec); setActiveMenuId(null); }}>
                                  <Trash2 size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Delete Record
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {derivedRecordsList.length > PAGE_SIZE && (
            <div className="data-pagination" style={{ borderTop: 'none', padding: '16px 0 0' }}>
              <span className="data-pagination-info">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(derivedRecordsList.length, currentPage * PAGE_SIZE)} of {derivedRecordsList.length} records
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

      {/* View Details Modal */}
      {viewRecord && (
        <Modal title={`${viewRecord.type} Record Details`} onClose={() => setViewRecord(null)} size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Date:</span>
              <span style={{ fontWeight: 700 }}>{formatDateDisplay(viewRecord.date)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Name / Payer:</span>
              <span style={{ fontWeight: 700 }}>{viewRecord.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Category:</span>
              <span>{viewRecord.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Particular:</span>
              <span className="cell-primary-purpose">{viewRecord.particular}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
              <span className={`transaction-status-tag ${viewRecord.status.toLowerCase()}`}>
                <span className="status-dot" />
                {viewRecord.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Amount:</span>
              <span className={`cell-amount bold-amount ${viewRecord.type.toLowerCase()}`}>
                ₹{viewRecord.amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Remarks:</span>
              <span style={{ background: 'var(--bg-muted)', padding: 8, borderRadius: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                {viewRecord.remarks || 'No remarks provided.'}
              </span>
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button type="button" className="admin-action-btn" onClick={() => setViewRecord(null)}>Close</button>
          </div>
        </Modal>
      )}

    </DashboardLayout>
  )
}
