import { useState, useMemo, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Modal from '../../components/Modal'
import { useAppState } from '../../../context/AppStateContext'
import { useToast } from '../../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import '../DataPage.css'

/* ─── Currency Formatter ────────────────────────────────────── */
function formatAmount(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

/* ─── Name Letter Badge Helpers ─────────────────────────────── */
function getLetterMeta(name) {
  const char = (name || '?').charAt(0).toUpperCase()
  const colors = {
    M: { bg: '#eff6ff', color: '#2563eb' },
    B: { bg: '#fdf2f8', color: '#db2777' },
    S: { bg: '#f0fdf4', color: '#16a34a' },
    R: { bg: '#fffbeb', color: '#d97706' },
    P: { bg: '#faf5ff', color: '#7c3aed' },
    A: { bg: '#f0fdfa', color: '#0d9488' },
    D: { bg: '#fff7ed', color: '#ea580c' },
    K: { bg: '#fef2f2', color: '#dc2626' },
  }
  return colors[char] || { bg: '#f3f4f6', color: '#4b5563' }
}

export default function PaymentStatus() {
  const { payments, addPayment, updatePayment, removePayment } = useAppState()
  const { addToast } = useToast()
  const navigate = useNavigate()

  /* ─── Toolbar State Filters ───────────────────────────────── */
  const [search, setSearch]             = useState('')
  const [fromDate, setFromDate]         = useState('')
  const [toDate, setToDate]             = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Apply visual filter locks
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedFromDate, setAppliedFromDate] = useState('')
  const [appliedToDate, setAppliedToDate] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('All')

  /* ─── Element UI Overlay Popovers ─────────────────────────── */
  const [activeMenuId, setActiveMenuId]   = useState(null)
  const [downloadOpen, setDownloadOpen]   = useState(false)
  const downloadRef = useRef(null)

  /* ─── Interactive Form Modals ─────────────────────────────── */
  const [selectedDetails, setSelectedDetails]   = useState(null)
  const [updatePaymentRecord, setUpdatePayment] = useState(null)
  const [editCustomer, setEditCustomer]         = useState(null)
  const [deleteConfirm, setDeleteConfirm]       = useState(null)
  const [editPaymentsLocal, setEditPaymentsLocal] = useState([])
  
  // New Payment Fields
  const [addPaymentAmount, setAddPaymentAmount] = useState('')
  const [addPaymentBank, setAddPaymentBank]     = useState('ICICI Bank')
  const [addPaymentDate, setAddPaymentDate]     = useState(new Date().toISOString().slice(0, 10))

  /* ─── Pagination ──────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  /* ─── Click Outside Dismiss hooks ─────────────────────────── */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setDownloadOpen(false)
      }
      if (!e.target.closest('.three-dot-trigger') && !e.target.closest('.action-popover')) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  /* ─── Dynamic Aggregation Engine ──────────────────────────── */
  const customerRecords = useMemo(() => {
    const map = {}
    payments.forEach(p => {
      if (p.status === 'Failed') return // Exclude failed logs from outstanding balance metrics
      const name = p.client
      const fileNo = p.file_no || '#CF-78000'
      const key = `${name}_${fileNo}`
      if (!map[key]) {
        map[key] = {
          client: name,
          file_no: fileNo,
          received: 0,
          pending: 0,
          actual: 0,
          payments: []
        }
      }
      map[key].payments.push(p)
      if (p.status === 'Completed') {
        map[key].received += p.amount
      } else if (p.status === 'Pending' || p.status === 'Processing') {
        map[key].pending += p.amount
      }
    })

    return Object.values(map).map(item => {
      item.actual = item.received + item.pending
      const colRate = item.actual > 0 ? Math.round((item.received / item.actual) * 100) : 0
      let status = 'PENDING'
      if (colRate === 100) status = 'PAID'
      else if (colRate > 0) status = 'PARTIAL'
      return {
        ...item,
        collection_rate: colRate,
        status
      }
    })
  }, [payments])

  /* ─── Global KPI Metrics Calculations ─────────────────────── */
  const globalStats = useMemo(() => {
    let totalActual = 0
    let totalReceived = 0
    let totalPending = 0

    customerRecords.forEach(c => {
      totalActual += c.actual
      totalReceived += c.received
      totalPending += c.pending
    })

    const collectionRate = totalActual > 0 ? Math.round((totalReceived / totalActual) * 100) : 0
    const overdueCount = customerRecords.filter(c => c.pending > 0).length

    return {
      actual: totalActual,
      received: totalReceived,
      pending: totalPending,
      rate: collectionRate,
      overdueCount
    }
  }, [customerRecords])

  /* ─── Filter Handler Actions ──────────────────────────────── */
  const handleApplyFilter = () => {
    setAppliedSearch(search)
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
    setAppliedStatus(statusFilter)
    setCurrentPage(1)
  }

  const handleClearFilter = () => {
    setSearch('')
    setFromDate('')
    setToDate('')
    setStatusFilter('All')
    setAppliedSearch('')
    setAppliedFromDate('')
    setAppliedToDate('')
    setAppliedStatus('All')
    setCurrentPage(1)
  }

  /* ─── Toolbar Records Filter ──────────────────────────────── */
  const filteredRecords = useMemo(() => {
    return customerRecords.filter(item => {
      const q = appliedSearch.toLowerCase().trim()
      const matchesSearch = !q || 
        item.client.toLowerCase().includes(q) || 
        item.file_no.toLowerCase().includes(q)

      const matchesStatus = appliedStatus === 'All' || item.status === appliedStatus

      let matchesDates = true
      if (appliedFromDate || appliedToDate) {
        matchesDates = item.payments.some(p => {
          let ok = true
          if (appliedFromDate) ok = ok && p.date >= appliedFromDate
          if (appliedToDate) ok = ok && p.date <= appliedToDate
          return ok
        })
      }

      return matchesSearch && matchesStatus && matchesDates
    })
  }, [customerRecords, appliedSearch, appliedStatus, appliedFromDate, appliedToDate])

  /* ─── Top 4 Pending Payout Analysis list ─────────────────── */
  const topPendingOutstanding = useMemo(() => {
    return customerRecords
      .filter(c => c.pending > 0)
      .sort((a, b) => b.pending - a.pending)
      .slice(0, 4)
  }, [customerRecords])

  const top4RatioPercentage = useMemo(() => {
    if (globalStats.pending === 0) return 0
    const sum4 = topPendingOutstanding.reduce((s, c) => s + c.pending, 0)
    return Math.round((sum4 / globalStats.pending) * 100)
  }, [topPendingOutstanding, globalStats.pending])

  /* ─── Pagination Math ─────────────────────────────────────── */
  const totalRecords = filteredRecords.length
  const totalPages = Math.ceil(totalRecords / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(startIndex, startIndex + pageSize)
  }, [filteredRecords, startIndex])

  /* ─── Export Excel Generator ──────────────────────────────── */
  const exportExcel = () => {
    const headers = ['Customer Name', 'File Number', 'Actual Payout (INR)', 'Received Amount (INR)', 'Pending Amount (INR)', 'Collection Rate (%)', 'Status']
    const rows = customerRecords.map(c => [
      c.client,
      c.file_no,
      c.actual,
      c.received,
      c.pending,
      `${c.collection_rate}%`,
      c.status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Outstanding_Payout_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Excel/CSV Report downloaded successfully.', 'success')
    setDownloadOpen(false)
  }

  /* ─── Export PDF Printable Builder ────────────────────────── */
  const exportPDF = () => {
    const printWindow = window.open('', '_blank')
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    
    const outstandingList = customerRecords
      .filter(c => c.pending > 0)
      .sort((a, b) => b.pending - a.pending)

    const rowsHTML = outstandingList.map((c, i) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${i + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #111827;">${c.client}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; font-family: monospace; color: #4b5563;">${c.file_no}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #111827;">₹${c.actual.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #16a34a; font-weight: 600;">₹${c.received.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #b91c1c; font-weight: 600;">₹${c.pending.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: center;">
          <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: ${c.status === 'PARTIAL' ? '#fffbeb' : '#fef2f2'}; color: ${c.status === 'PARTIAL' ? '#b45309' : '#b91c1c'};">
            ${c.status}
          </span>
        </td>
      </tr>
    `).join('')

    const htmlContent = `
      <html>
        <head>
          <title>Pending Payout Analysis - Cosmos Finserve</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1f2937; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #850f1d; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #850f1d; }
            .sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
            .title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #111827; text-transform: uppercase; letter-spacing: 0.05em; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .th { padding: 12px; border-bottom: 2px solid #e5e7eb; font-weight: 700; text-align: left; font-size: 12px; text-transform: uppercase; color: #374151; }
            .footer { margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 11px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">COSMOS FINSERVE</div>
              <div class="sub">Enterprise Finance & Payout Solutions</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600; font-size: 14px;">PENDING PAYOUT REPORT</div>
              <div class="sub">Generated on ${today}</div>
            </div>
          </div>
          
          <div class="title">Outstanding Payout Analysis</div>
          
          <table class="table">
            <thead>
              <tr>
                <th class="th">S.No</th>
                <th class="th">Customer Name</th>
                <th class="th">File Number</th>
                <th class="th" style="text-align: right;">Actual Payout</th>
                <th class="th" style="text-align: right;">Received Payout</th>
                <th class="th" style="text-align: right;">Pending Payout</th>
                <th class="th" style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
            <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px 20px; min-width: 250px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span>Total Outstanding Payouts:</span>
                <span style="font-weight: 700; color: #b91c1c;">₹${globalStats.pending.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span>Active Debt Accounts:</span>
                <span style="font-weight: 700;">${outstandingList.length}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            This is an automated system-generated statement from Cosmos Finserve. Confidential & Proprietary.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    addToast('PDF Report window opened.', 'success')
    setDownloadOpen(false)
  }

  /* ─── Add Payment Trigger Form ────────────────────────────── */
  const handleRecordPayment = () => {
    if (!addPaymentAmount || isNaN(Number(addPaymentAmount)) || Number(addPaymentAmount) <= 0) {
      addToast('Please enter a valid positive payment amount.', 'error')
      return
    }

    const payVal = Number(addPaymentAmount)
    if (payVal > updatePaymentRecord.pending) {
      addToast(`Entered amount exceeds customer's remaining pending balance of ${formatAmount(updatePaymentRecord.pending)}.`, 'error')
      return
    }

    // Call Context API
    addPayment({
      client: updatePaymentRecord.client,
      file_no: updatePaymentRecord.file_no,
      type: 'Collection',
      amount: payVal,
      bank: addPaymentBank,
      date: addPaymentDate,
      status: 'Completed'
    })

    addToast(`Successfully received ${formatAmount(payVal)} collection for ${updatePaymentRecord.client}!`, 'success')
    
    // Reset Fields
    setAddPaymentAmount('')
    setAddPaymentBank('ICICI Bank')
    setAddPaymentDate(new Date().toISOString().slice(0, 10))
    setUpdatePayment(null)
  }

  return (
    <DashboardLayout>
      {/* ─── Stylesheet Redux ─────────────────────────────────── */}
      <style>{`
        .ps-wrapper {
          padding: 8px 4px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1f2937;
        }

        /* Top header KPI row */
        .ps-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .ps-kpi-card {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .ps-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(133, 15, 29, 0.06);
        }

        .ps-kpi-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .ps-kpi-value {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
        }

        .ps-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 6px;
        }

        .ps-trend.up { color: #16a34a; }
        .ps-trend.down { color: #dc2626; }

        /* Dynamic Visual Charts Rows */
        .ps-charts-row {
          display: grid;
          grid-template-columns: 4fr 5fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .ps-main-card {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.02);
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .ps-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 1px solid #f9fafb;
          padding-bottom: 14px;
        }

        .ps-card-title {
          font-size: 16px;
          font-weight: 750;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* SVG donut chart adjustments */
        .ps-donut-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin: 10px 0 20px;
        }

        .ps-donut-center {
          position: absolute;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ps-donut-label {
          font-size: 10px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .ps-donut-val {
          font-size: 22px;
          font-weight: 850;
          color: #111827;
          margin-top: 2px;
        }

        /* Mini summary pills below donut */
        .ps-legend-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ps-legend-box {
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ps-legend-box.green { background: #f0fdf4; border: 1px solid #dcfce7; }
        .ps-legend-box.red { background: #fef2f2; border: 1px solid #fee2e2; }

        .ps-legend-lbl {
          font-size: 10px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ps-legend-val {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
        }

        .ps-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .ps-tag-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #4b5563;
          border: 1px solid #e5e7eb;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        /* Outstanding Progress List */
        .ps-outstanding-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .ps-outstanding-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ps-out-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
        }

        .ps-out-bar-bg {
          height: 10px;
          background: #f1f5f9;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .ps-out-bar-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #f43f5e, #be123c);
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ps-info-footer {
          margin-top: auto;
          background: #f9fafb;
          border-radius: 10px;
          padding: 12px 14px;
          border: 1px solid #f3f4f6;
          font-size: 11px;
          color: #6b7280;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Dynamic Filter Toolbar */
        .ps-filter-card {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }

        .ps-filter-grid {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1.8fr 1.5fr auto auto;
          gap: 14px;
          align-items: flex-end;
        }

        .ps-field-label {
          font-size: 10px;
          font-weight: 750;
          color: #4b5563;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ps-input, .ps-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 13px;
          background: #fff;
          color: #1f2937;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .ps-input:focus, .ps-select:focus {
          border-color: #850f1d;
          box-shadow: 0 0 0 3px rgba(133, 15, 29, 0.1);
        }

        .ps-btn-apply {
          background: #850f1d;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .ps-btn-apply:hover {
          background: #6e0b17;
        }

        .ps-btn-clear {
          background: #fff;
          color: #4b5563;
          border: 1px solid #d1d5db;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .ps-btn-clear:hover {
          background: #f9fafb;
        }

        /* Custom Table aesthetics */
        .ps-table-card {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.02);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .ps-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .ps-table th {
          background: #fafafb;
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 750;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f3f4f6;
        }

        .ps-table td {
          padding: 16px 20px;
          font-size: 13.5px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .ps-table tr:last-child td {
          border-bottom: none;
        }

        .ps-table tr:hover td {
          background: #fafafb;
        }

        .ps-avatar-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
        }

        .ps-status-pill {
          font-size: 10px;
          font-weight: 850;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-block;
        }

        .ps-status-pill.paid { background: #dcfce7; color: #16a34a; }
        .ps-status-pill.partial { background: #fef3c7; color: #d97706; }
        .ps-status-pill.pending { background: #fde8e8; color: #dc2626; }

        /* Actions button ⋮ */
        .ps-ellipsis-btn {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          line-height: 1;
        }

        .ps-ellipsis-btn:hover {
          background: #f3f4f6;
          color: #4b5563;
        }

        /* Popover actions menu */
        .ps-actions-popover {
          position: absolute;
          right: 20px;
          z-index: 99;
          width: 150px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          overflow: hidden;
          animation: popFade 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popFade {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ps-action-item {
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: none;
          text-align: left;
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ps-action-item:hover {
          background: #f9fafb;
          color: #850f1d;
        }

        /* Download drop controller */
        .ps-download-btn {
          background: none;
          border: none;
          color: #850f1d;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .ps-download-btn:hover {
          background: #fdf2f2;
        }

        .ps-download-popover {
          position: absolute;
          right: 24px;
          top: 50px;
          z-index: 100;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 160px;
          overflow: hidden;
        }

        /* Pagination custom wrapper */
        .ps-page-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: #fafafb;
          border-top: 1px solid #f3f4f6;
        }

        .ps-page-info {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .ps-page-btn-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ps-page-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #fff;
          font-size: 12px;
          font-weight: 700;
          color: #4b5563;
          cursor: pointer;
          transition: background 0.2s;
        }

        .ps-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ps-page-btn:hover:not(:disabled) {
          background: #f9fafb;
        }

        .ps-modal-body-payout {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 4px 0;
        }

        .ps-history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .ps-history-table th {
          background: #f9fafb;
          padding: 10px 12px;
          font-weight: 700;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }

        .ps-history-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .modal-xl {
          max-width: 960px !important;
        }
      `}</style>

      {/* ─── Local State hooks & transaction handlers ─────────── */}
      {useEffect(() => {
        if (editCustomer) {
          setEditPaymentsLocal(editCustomer.payments.map(p => ({ ...p })))
        } else {
          setEditPaymentsLocal([])
        }
      }, [editCustomer])}

      {(() => {
        window.handleLocalPaymentEdit = (id, field, value) => {
          setEditPaymentsLocal(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
        }

        window.handleLocalPaymentDelete = (id) => {
          setEditPaymentsLocal(prev => prev.filter(p => p.id !== id))
        }

        window.handleLocalPaymentAdd = () => {
          const tempId = `TEMP_${Date.now()}`
          setEditPaymentsLocal(prev => [
            ...prev,
            {
              id: tempId,
              client: editCustomer.client,
              file_no: editCustomer.file_no,
              type: 'Collection',
              amount: 10000,
              bank: 'ICICI Bank',
              date: new Date().toISOString().slice(0, 10),
              status: 'Completed'
            }
          ])
        }

        window.handleSaveCustomerPayments = () => {
          const initialIds = editCustomer.payments.map(p => p.id)
          const currentIds = editPaymentsLocal.map(p => p.id)
          const deletedIds = initialIds.filter(id => !currentIds.includes(id))
          
          deletedIds.forEach(id => removePayment(id))

          editPaymentsLocal.forEach(p => {
            if (String(p.id).startsWith('TEMP_')) {
              addPayment({
                client: p.client,
                file_no: p.file_no,
                type: p.type,
                amount: p.amount,
                bank: p.bank,
                date: p.date,
                status: p.status
              })
            } else {
              updatePayment(p)
            }
          })

          addToast(`Successfully updated payout record ledgers for ${editCustomer.client}!`, 'success')
          setEditCustomer(null)
        }
      })()}

      <div className="ps-wrapper">
        
        {/* ─── Top KPI Row Module ──────────────────────────────── */}
        <div className="ps-kpi-grid">
          
          {/* Card 1: Actual Payout */}
          <div className="ps-kpi-card">
            <div>
              <div className="ps-kpi-label">Actual Payout</div>
              <div className="ps-kpi-value">{formatAmount(globalStats.actual)}</div>
              <div className="ps-trend up">↗ 12% vs last month</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fdf2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💰</div>
          </div>

          {/* Card 2: Received Payout */}
          <div className="ps-kpi-card">
            <div>
              <div className="ps-kpi-label">Received Payout</div>
              <div className="ps-kpi-value">{formatAmount(globalStats.received)}</div>
              <div style={{ width: '120px', height: '6px', background: '#e5e7eb', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${globalStats.rate}%`, height: '100%', background: '#16a34a' }} />
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✅</div>
          </div>

          {/* Card 3: Pending Payout */}
          <div className="ps-kpi-card">
            <div>
              <div className="ps-kpi-label">Pending Payout</div>
              <div className="ps-kpi-value">{formatAmount(globalStats.pending)}</div>
              <div style={{ color: '#dc2626', fontSize: '11px', fontWeight: '700', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⚠️ {globalStats.overdueCount} overdue items
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⏰</div>
          </div>

          {/* Card 4: Collection Rate */}
          <div className="ps-kpi-card">
            <div>
              <div className="ps-kpi-label">Collection Rate</div>
              <div className="ps-kpi-value">{globalStats.rate}%</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', marginTop: '8px' }}>TARGET: 85%</div>
            </div>
            <div style={{ position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#111827"
                  strokeWidth="3.5"
                  strokeDasharray={`${globalStats.rate}, 100`}
                />
              </svg>
            </div>
          </div>

        </div>

        {/* ─── Dual Columns Visual Card Modules ────────────────── */}
        <div className="ps-charts-row">

          {/* Left Column: Collection Overview */}
          <div className="ps-main-card">
            <div className="ps-card-header">
              <div className="ps-card-title">📈 Collection Overview</div>
              <button className="ps-ellipsis-btn">⋮</button>
            </div>

            {/* Donut Chart SVG */}
            <div className="ps-donut-wrap">
              <svg width="180" height="180" viewBox="0 0 42 42" className="ps-donut">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#fef2f2" strokeWidth="4.2" />
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth="4.2"
                  strokeDasharray={`${globalStats.rate} ${100 - globalStats.rate}`}
                  strokeDashoffset="25"
                />
              </svg>
              <div className="ps-donut-center">
                <span className="ps-donut-label">Total Payout</span>
                <span className="ps-donut-val">{formatAmount(globalStats.actual)}</span>
              </div>
            </div>

            {/* Metrics cards below donut */}
            <div className="ps-legend-grid">
              <div className="ps-legend-box green">
                <span className="ps-legend-lbl">🟢 Received</span>
                <span className="ps-legend-val">{formatAmount(globalStats.received)}</span>
                <span style={{ fontSize: '11px', fontWeight: '750', color: '#16a34a' }}>{globalStats.rate}%</span>
              </div>
              <div className="ps-legend-box red">
                <span className="ps-legend-lbl">🔴 Pending</span>
                <span className="ps-legend-val">{formatAmount(globalStats.pending)}</span>
                <span style={{ fontSize: '11px', fontWeight: '750', color: '#dc2626' }}>{100 - globalStats.rate}%</span>
              </div>
            </div>

            {/* Collection rate summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              <span>Collection Rate</span>
              <span>{globalStats.rate}%</span>
            </div>
            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${globalStats.rate}%`, height: '100%', background: '#16a34a' }} />
            </div>

            {/* Tag metadata box */}
            <div className="ps-tag-row">
              <span className="ps-tag-badge">COLLECTED: {formatAmount(globalStats.received)}</span>
              <span className="ps-tag-badge">REMAINING: {formatAmount(globalStats.pending)}</span>
              <span className="ps-tag-badge">CUSTOMERS: {customerRecords.length}</span>
            </div>
          </div>

          {/* Right Column: Pending Payout Analysis */}
          <div className="ps-main-card">
            <div className="ps-card-header" style={{ position: 'relative' }}>
              <div className="ps-card-title">📊 Pending Payout Analysis</div>
              
              {/* Exporters Dropdown Controller */}
              <div ref={downloadRef}>
                <button
                  type="button"
                  className="ps-download-btn"
                  onClick={() => setDownloadOpen(!downloadOpen)}
                >
                  📥 Download Report
                </button>

                {downloadOpen && (
                  <div className="ps-download-popover">
                    <button className="ps-action-item" onClick={exportExcel}>
                      🟢 Export Excel (.csv)
                    </button>
                    <button className="ps-action-item" onClick={exportPDF}>
                      🔴 Export PDF (.pdf)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Payout horizontal bar list */}
            <div className="ps-outstanding-list">
              {topPendingOutstanding.map(item => (
                <div key={item.file_no} className="ps-outstanding-item">
                  <div className="ps-out-header">
                    <span>{item.client}</span>
                    <span style={{ color: '#be123c' }}>{formatAmount(item.pending)}</span>
                  </div>
                  <div className="ps-out-bar-bg">
                    <div
                      className="ps-out-bar-fill"
                      style={{ width: `${globalStats.pending > 0 ? (item.pending / globalStats.pending) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}

              {topPendingOutstanding.length === 0 && (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontWeight: '600' }}>
                  No outstanding payouts recorded! All balances paid.
                </div>
              )}

              {/* Outstanding debt analytics summary note */}
              {topPendingOutstanding.length > 0 && (
                <div className="ps-info-footer">
                  <span style={{ fontSize: '14px' }}>ℹ️</span>
                  <span>
                    TOP {topPendingOutstanding.length} ACCOUNTS REPRESENT {top4RatioPercentage}% OF TOTAL OUTSTANDING BALANCE DEBT
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ─── Search & Toolbar Filters Module ──────────────────── */}
        <div className="ps-filter-card">
          <div className="ps-filter-grid">
            
            {/* From Date picker */}
            <div>
              <div className="ps-field-label">From Date</div>
              <input
                type="date"
                className="ps-input"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date picker */}
            <div>
              <div className="ps-field-label">To Date</div>
              <input
                type="date"
                className="ps-input"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>

            {/* Customer name search input */}
            <div>
              <div className="ps-field-label">Customer Search</div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by name or file ID..."
                  className="ps-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Status Dropdown select */}
            <div>
              <div className="ps-field-label">Payment Status</div>
              <select
                className="ps-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Action buttons */}
            <button className="ps-btn-apply" onClick={handleApplyFilter}>
              Apply Filter
            </button>

            <button className="ps-btn-clear" onClick={handleClearFilter}>
              Clear
            </button>

          </div>
        </div>

        {/* ─── Customer Records Table Module ───────────────────── */}
        <div className="ps-table-card">
          <table className="ps-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Actual Payout</th>
                <th>Received Amount</th>
                <th>Pending Amount</th>
                <th>Collection %</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((item, rowIndex) => {
                const avatar = getLetterMeta(item.client)
                const isMenuOpen = activeMenuId === item.file_no
                
                return (
                  <tr key={item.file_no}>
                    {/* Customer Profile Column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          className="ps-avatar-badge"
                          style={{ background: avatar.bg, color: avatar.color }}
                        >
                          {(item.client || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827' }}>{item.client}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', fontWeight: '500' }}>
                            {item.file_no}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actual Payout */}
                    <td style={{ fontWeight: 700, color: '#374151' }}>
                      {formatAmount(item.actual)}
                    </td>

                    {/* Received Amount */}
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>
                      {formatAmount(item.received)}
                    </td>

                    {/* Pending Amount */}
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>
                      {formatAmount(item.pending)}
                    </td>

                    {/* Collection rate progress bar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '750', color: '#4b5563', width: '32px' }}>
                          {item.collection_rate}%
                        </span>
                        <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${item.collection_rate}%`,
                              height: '100%',
                              background: item.status === 'PAID' ? '#16a34a' : item.status === 'PARTIAL' ? '#f59e0b' : '#dc2626'
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Soft-tone Status pill badges */}
                    <td>
                      <span className={`ps-status-pill ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Ellipsis Actions drop menus */}
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      <button
                        type="button"
                        className="ps-ellipsis-btn three-dot-trigger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuId(isMenuOpen ? null : item.file_no)
                        }}
                      >
                        ⋮
                      </button>

                      {isMenuOpen && (
                        <div
                          className="ps-actions-popover action-popover"
                          style={{
                            top: paginatedRecords.length - rowIndex <= 2 ? 'auto' : '40px',
                            bottom: paginatedRecords.length - rowIndex <= 2 ? '40px' : 'auto'
                          }}
                        >
                          <button
                            className="ps-action-item"
                            onClick={() => {
                              setSelectedDetails(item)
                              setActiveMenuId(null)
                            }}
                          >
                            👁️ View Details
                          </button>
                          
                          <button
                            className="ps-action-item"
                            onClick={() => {
                              navigate('/payments/invoice', {
                                state: {
                                  prefillClient: item.client,
                                  prefillFileNo: item.file_no,
                                  prefillAmount: item.pending
                                }
                              })
                              addToast(`Redirecting to invoice creator for ${item.client}...`, 'info')
                            }}
                          >
                            📄 Generate Invoice
                          </button>

                          {item.pending > 0 && (
                            <button
                              className="ps-action-item"
                              onClick={() => {
                                setUpdatePayment(item)
                                setActiveMenuId(null)
                              }}
                            >
                              🔄 Update Payment
                            </button>
                          )}

                          <button
                            className="ps-action-item"
                            onClick={() => {
                              setEditCustomer(item)
                              setActiveMenuId(null)
                            }}
                          >
                            ✏️ Edit Record
                          </button>

                          <button
                            className="ps-action-item"
                            style={{ color: '#dc2626' }}
                            onClick={() => {
                              setDeleteConfirm(item)
                              setActiveMenuId(null)
                            }}
                          >
                            🗑️ Delete Record
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                )
              })}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontWeight: '600' }}>
                    No payment records match the filter criteria!
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Table pagination controller footer */}
          <div className="ps-page-wrap">
            <span className="ps-page-info">
              SHOWING {totalRecords > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, totalRecords)} OF {totalRecords} RECORDS
            </span>
            <div className="ps-page-btn-group">
              <button
                className="ps-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
              >
                PREVIOUS
              </button>
              <button
                className="ps-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
              >
                NEXT
              </button>
            </div>
          </div>
        </div>

        {/* ─── Modal A: View Ledger Transaction Details History ─── */}
        {selectedDetails && (
          <Modal
            title={`Payment Ledger History — ${selectedDetails.client}`}
            onClose={() => setSelectedDetails(null)}
          >
            <div className="ps-modal-body-payout">
              <div style={{ background: '#fafafa', borderRadius: '10px', padding: '14px 18px', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>Actual Fee Payout:</span>
                  <span style={{ fontWeight: '700', color: '#111827' }}>{formatAmount(selectedDetails.actual)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#16a34a', fontWeight: '500' }}>Total Collected Amount:</span>
                  <span style={{ fontWeight: '800', color: '#16a34a' }}>{formatAmount(selectedDetails.received)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#dc2626', fontWeight: '500' }}>Remaining Pending Balance:</span>
                  <span style={{ fontWeight: '800', color: '#dc2626' }}>{formatAmount(selectedDetails.pending)}</span>
                </div>
              </div>

              <div style={{ fontWeight: 705, color: '#111827', fontSize: '14px', marginTop: '6px' }}>
                Transaction Ledgers
              </div>

              <table className="ps-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Bank</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetails.payments.map(p => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td>{p.type}</td>
                      <td>{p.bank}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: p.status === 'Completed' ? '#16a34a' : '#d97706' }}>
                        {formatAmount(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="data-btn data-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── Modal B: Update Payment / Record New Collection ───── */}
        {updatePaymentRecord && (
          <Modal
            title={`Record Payment — ${updatePaymentRecord.client}`}
            onClose={() => setUpdatePayment(null)}
          >
            <div className="ps-modal-body-payout">
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#be123c', fontWeight: '650' }}>Remaining Balance Due:</span>
                <span style={{ fontWeight: '800', color: '#be123c' }}>{formatAmount(updatePaymentRecord.pending)}</span>
              </div>

              <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
                
                {/* Amount input */}
                <div>
                  <label className="ps-field-label">Received Amount (INR)</label>
                  <input
                    type="number"
                    placeholder={`Max ${updatePaymentRecord.pending}`}
                    className="ps-input"
                    value={addPaymentAmount}
                    onChange={e => setAddPaymentAmount(e.target.value)}
                  />
                </div>

                {/* Bank picker */}
                <div>
                  <label className="ps-field-label">Collecting Bank</label>
                  <select
                    className="ps-select"
                    value={addPaymentBank}
                    onChange={e => setAddPaymentBank(e.target.value)}
                  >
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Bank">Kotak Bank</option>
                  </select>
                </div>

                {/* Date select */}
                <div>
                  <label className="ps-field-label">Collection Date</label>
                  <input
                    type="date"
                    className="ps-input"
                    value={addPaymentDate}
                    onChange={e => setAddPaymentDate(e.target.value)}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="data-btn data-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setUpdatePayment(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ps-btn-apply"
                  style={{ flex: 1, padding: '10px 0' }}
                  onClick={handleRecordPayment}
                >
                  Log Collection Payment
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── Modal C: Delete Customer Payout Ledger Confirmation ─── */}
        {deleteConfirm && (
          <Modal
            title={`Remove Payout Ledger — ${deleteConfirm.client}`}
            onClose={() => setDeleteConfirm(null)}
          >
            <div className="ps-modal-body-payout">
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', padding: '16px', color: '#b91c1c', fontSize: '13.5px', fontWeight: '600', lineHeight: 1.5 }}>
                ⚠️ <strong>WARNING:</strong> This action cannot be undone. This will permanently delete <strong>all {deleteConfirm.payments.length} transactions</strong> (collections, payouts, fees) registered for <strong>{deleteConfirm.client}</strong> (File: {deleteConfirm.file_no}) from the ledger database.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="data-btn data-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ps-btn-apply"
                  style={{ flex: 1, padding: '10px 0', background: '#dc2626' }}
                  onClick={() => {
                    deleteConfirm.payments.forEach(p => removePayment(p.id))
                    addToast(`Successfully removed ledger history and all transactions for ${deleteConfirm.client}!`, 'success')
                    setDeleteConfirm(null)
                  }}
                >
                  Confirm Delete All
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── Modal D: Edit Customer Payout Ledger Grid ───────────── */}
        {editCustomer && (
          <Modal
            title={`Edit Payout Ledgers — ${editCustomer.client}`}
            size="xl"
            onClose={() => setEditCustomer(null)}
          >
            <div className="ps-modal-body-payout" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                  Manage payment log transactions for File: <span style={{ color: '#111827', fontFamily: 'monospace' }}>{editCustomer.file_no}</span>
                </div>
                <button
                  type="button"
                  className="ps-download-btn"
                  style={{ padding: '4px 10px', background: '#f3f4f6', fontSize: '12px' }}
                  onClick={window.handleLocalPaymentAdd}
                >
                  ➕ Add Transaction
                </button>
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                <table className="ps-history-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px' }}>Date</th>
                      <th style={{ padding: '8px' }}>Type</th>
                      <th style={{ padding: '8px' }}>Bank</th>
                      <th style={{ padding: '8px' }}>Amount (INR)</th>
                      <th style={{ padding: '8px' }}>Status</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editPaymentsLocal.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="date"
                            className="ps-input"
                            style={{ padding: '6px 8px', fontSize: '12px' }}
                            value={p.date}
                            onChange={e => window.handleLocalPaymentEdit(p.id, 'date', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <select
                            className="ps-select"
                            style={{ padding: '6px 8px', fontSize: '12px', minWidth: '100px' }}
                            value={p.type}
                            onChange={e => window.handleLocalPaymentEdit(p.id, 'type', e.target.value)}
                          >
                            <option value="Collection">Collection</option>
                            <option value="Disbursement">Disbursement</option>
                            <option value="EMI">EMI</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <select
                            className="ps-select"
                            style={{ padding: '6px 8px', fontSize: '12px', minWidth: '100px' }}
                            value={p.bank}
                            onChange={e => window.handleLocalPaymentEdit(p.id, 'bank', e.target.value)}
                          >
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="SBI">SBI</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Bank">Kotak Bank</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            className="ps-input"
                            style={{ padding: '6px 8px', fontSize: '12px', fontWeight: '700', width: '100px' }}
                            value={p.amount}
                            onChange={e => window.handleLocalPaymentEdit(p.id, 'amount', Number(e.target.value))}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <select
                            className="ps-select"
                            style={{ padding: '6px 8px', fontSize: '12px', minWidth: '110px' }}
                            value={p.status}
                            onChange={e => window.handleLocalPaymentEdit(p.id, 'status', e.target.value)}
                          >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="ps-ellipsis-btn"
                            style={{ color: '#dc2626', fontSize: '15px', padding: '4px' }}
                            onClick={() => window.handleLocalPaymentDelete(p.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {editPaymentsLocal.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontWeight: '600' }}>
                          No transactions left. Saving will delete the payout ledger.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="data-btn data-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setEditCustomer(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ps-btn-apply"
                  style={{ flex: 1, padding: '10px 0' }}
                  onClick={window.handleSaveCustomerPayments}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  )
}
