import { useState, useMemo, useEffect, useRef } from 'react'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import useConfirm from '../../shared/lib/useConfirm'
import DonutChart from '../../shared/ui/DonutChart'
import '../../shared/ui/DataPage.css'
import { Coins, CheckCircle, AlertTriangle, Clock, TrendingUp, CircleDot, BarChart, Download, FileSpreadsheet, FileText, Eye, RefreshCw, Edit, Trash2, Plus, Info } from 'lucide-react';
import cosmosLogo from '../../assets/cosmosLogo.jpeg';

/* ─── Currency Formatter ────────────────────────────────────── */
function formatAmount(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

/* ─── Name Letter Badge Helpers ─────────────────────────────── */
function getLetterMeta(name) {
  const char = (name || '?').charAt(0).toUpperCase()
  const colors = {
    M: { bg: 'var(--bg-hover)', color: '#2563eb' },
    B: { bg: 'var(--bg-hover)', color: '#db2777' },
    S: { bg: 'var(--bg-hover)', color: '#16a34a' },
    R: { bg: 'var(--bg-hover)', color: '#d97706' },
    P: { bg: 'var(--bg-hover)', color: '#7c3aed' },
    A: { bg: 'var(--bg-hover)', color: '#0d9488' },
    D: { bg: 'var(--bg-hover)', color: '#ea580c' },
    K: { bg: 'var(--bg-hover)', color: '#dc2626' },
  }
  return colors[char] || { bg: 'var(--bg-muted)', color: 'var(--text-secondary)' }
}

export default function PaymentStatus() {
  const { payments, clients, addPayment, updatePayment, removePayment, addInvoice } = useAppState()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const confirm = useConfirm()

  /* ─── Toolbar State Filters ───────────────────────────────── */
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Apply visual filter locks
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedFromDate, setAppliedFromDate] = useState('')
  const [appliedToDate, setAppliedToDate] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('All')

  /* ─── Element UI Overlay Popovers ─────────────────────────── */
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const downloadRef = useRef(null)

  /* ─── Interactive Form Modals ─────────────────────────────── */
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [printInvoiceData, setPrintInvoiceData] = useState(null)

  const saveAndGoToInvoice = async ({ client, file_no, payments: doneTxns, actual, pending }) => {
    const paidTotal = doneTxns.reduce((s, p) => s + Number(p.amount), 0)
    const today = new Date().toISOString().slice(0, 10)
    await addInvoice({
      client,
      file_no,
      service: 'Cosmos Payout Collection',
      amount: paidTotal,
      date: today,
      due: today,
      status: pending > 0 ? 'Pending' : 'Paid',
    })
    addToast('Invoice saved successfully!', 'success')
    navigate('/payments/invoice')
  }
  const [updatePaymentRecord, setUpdatePayment] = useState(null)
  const [updateSinglePayment, setUpdateSinglePayment] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  // Edit Payout Ledger: clean actual/paid form state
  const [editLedger, setEditLedger] = useState({ actualPayout: '', amountPaid: '' })

  // New Payment Fields
  const [addPaymentAmount, setAddPaymentAmount] = useState('')
  const [addPaymentBank, setAddPaymentBank] = useState('ICICI Bank')
  const [addPaymentDate, setAddPaymentDate] = useState(new Date().toISOString().slice(0, 10))

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
        <td style="padding: 12px; border-bottom: 1px solid var(--border);">${i + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); font-weight: 600; color: var(--text-primary);">${c.client}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: var(--text-secondary);">${c.file_no}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: right; color: var(--text-primary);">₹${c.actual.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: right; color: #16a34a; font-weight: 600;">₹${c.received.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: right; color: #b91c1c; font-weight: 600;">₹${c.pending.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: center;">
          <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: ${c.status === 'PARTIAL' ? 'var(--bg-hover)' : 'var(--bg-hover)'}; color: ${c.status === 'PARTIAL' ? '#b45309' : '#b91c1c'};">
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
            body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; color: var(--text-primary); padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #850f1d; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: var(--accent); }
            .sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
            .title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .th { padding: 12px; border-bottom: 2px solid var(--border); font-weight: 700; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-secondary); }
            .footer { margin-top: 50px; border-top: 1px solid var(--border); padding-top: 20px; font-size: 11px; color: var(--text-faint); text-align: center; }
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
            <div style="background: #fafafa; border: 1px solid var(--border); border-radius: 8px; padding: 15px 20px; min-width: 250px;">
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

  const handleDeleteLedger = async (item) => {
    const ok = await confirm({
      title: `Remove Payout Ledger — ${item.client}`,
      message: `WARNING: This action cannot be undone. This will permanently delete all ${item.payments.length} transactions (collections, payouts, fees) registered for ${item.client} (File: ${item.file_no}) from the ledger database.`,
      confirmLabel: 'Confirm Delete All',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (ok) {
      item.payments.forEach(p => removePayment(p.id))
      addToast(`Successfully removed ledger history and all transactions for ${item.client}!`, 'success')
    }
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

    // Call Context API to add the new collection payment
    addPayment({
      client: updatePaymentRecord.client,
      file_no: updatePaymentRecord.file_no,
      type: 'Collection',
      amount: payVal,
      bank: addPaymentBank,
      date: addPaymentDate,
      status: 'Completed'
    })

    // Reduce existing Pending records so actual payout doesn't artificially increase
    let remainingToDeduct = payVal;
    const pendingRecords = updatePaymentRecord.payments
      .filter(p => p.status === 'Pending' || p.status === 'Processing')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    pendingRecords.forEach(p => {
      if (remainingToDeduct <= 0) return;
      if (p.amount <= remainingToDeduct) {
        remainingToDeduct -= p.amount;
        removePayment(p.id); // Completely cleared this pending chunk
      } else {
        updatePayment({ ...p, amount: p.amount - remainingToDeduct }); // Partially cleared
        remainingToDeduct = 0;
      }
    });

    addToast(`Successfully received ${formatAmount(payVal)} collection for ${updatePaymentRecord.client}!`, 'success')

    // Reset Fields
    setAddPaymentAmount('')
    setAddPaymentBank('ICICI Bank')
    setAddPaymentDate(new Date().toISOString().slice(0, 10))
    setUpdatePayment(null)
  }

  const handleUpdateSinglePayment = () => {
    if (!updateSinglePayment.amount || isNaN(Number(updateSinglePayment.amount))) {
      addToast('Please enter a valid amount.', 'error')
      return
    }
    updatePayment({ ...updateSinglePayment, amount: Number(updateSinglePayment.amount) })
    addToast('Payment updated successfully.', 'success')
    // Update the selectedDetails view if it's open
    if (selectedDetails) {
      setSelectedDetails(prev => ({
        ...prev,
        payments: prev.payments.map(p => p.id === updateSinglePayment.id ? { ...updateSinglePayment, amount: Number(updateSinglePayment.amount) } : p)
      }))
    }
    setUpdateSinglePayment(null)
  }

  // When editCustomer opens, derive actual/paid from existing payment records
  useEffect(() => {
    if (editCustomer) {
      const received = editCustomer.payments
        .filter(p => p.status === 'Completed')
        .reduce((s, p) => s + Number(p.amount), 0)
      const pending = editCustomer.payments
        .filter(p => p.status === 'Pending' || p.status === 'Processing')
        .reduce((s, p) => s + Number(p.amount), 0)
      setEditLedger({
        actualPayout: String(received + pending),
        amountPaid: String(received)
      })
    } else {
      setEditLedger({ actualPayout: '', amountPaid: '' })
    }
  }, [editCustomer])

  const handleSaveEditLedger = () => {
    if (!editCustomer) return
    const actualNum = Number(editLedger.actualPayout)
    const paidNum   = Number(editLedger.amountPaid)

    if (!editLedger.actualPayout || isNaN(actualNum) || actualNum <= 0) {
      addToast('Please enter a valid Actual Payout amount.', 'error')
      return
    }
    if (editLedger.amountPaid === '' || isNaN(paidNum) || paidNum < 0) {
      addToast('Please enter a valid Amount Paid.', 'error')
      return
    }
    if (paidNum > actualNum) {
      addToast('Amount Paid cannot exceed Actual Payout.', 'error')
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    // Wipe all existing Completed / Pending records for this client+file
    editCustomer.payments
      .filter(p => p.status === 'Completed' || p.status === 'Pending' || p.status === 'Processing')
      .forEach(p => removePayment(p.id))

    // Re-create: one Completed for what has been paid
    if (paidNum > 0) {
      addPayment({
        client: editCustomer.client,
        file_no: editCustomer.file_no,
        type: 'Collection',
        amount: paidNum,
        bank: '',
        date: today,
        status: 'Completed'
      })
    }

    // Re-create: one Pending for the remaining balance
    const pendingBalance = actualNum - paidNum
    if (pendingBalance > 0) {
      addPayment({
        client: editCustomer.client,
        file_no: editCustomer.file_no,
        type: 'Collection',
        amount: pendingBalance,
        bank: '',
        date: today,
        status: 'Pending'
      })
    }

    addToast(`Payout ledger updated for ${editCustomer.client}!`, 'success')
    setEditCustomer(null)
  }

  return (
    <DashboardLayout>
      {/* ─── Stylesheet Redux ─────────────────────────────────── */}
      <style>{`
        .ps-wrapper {
          padding: 8px 4px;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          color: var(--text-primary);
        }
        /* Dynamic Visual Charts Rows */
        .ps-charts-row {
          display: grid;
          grid-template-columns: 4fr 5fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .ps-main-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow-sm);
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .ps-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 14px;
        }

        .ps-card-title {
          font-size: 16px;
          font-weight: 750;
          color: var(--text-primary);
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
          color: var(--text-faint);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .ps-donut-val {
          font-size: 22px;
          font-weight: 850;
          color: var(--text-primary);
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

        .ps-legend-box.green { background: var(--bg-muted); border: 1px solid rgba(22, 163, 74, 0.4); }
        .ps-legend-box.red { background: var(--bg-muted); border: 1px solid rgba(220, 38, 38, 0.4); }

        .ps-legend-lbl {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ps-legend-val {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
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
          background: var(--bg-muted);
          color: var(--text-secondary);
          border: 1px solid var(--border);
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
          color: var(--text-secondary);
        }

        .ps-out-bar-bg {
          height: 10px;
          background: var(--bg-muted);
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
          background: var(--bg-muted);
          border-radius: 10px;
          padding: 12px 14px;
          border: 1px solid var(--border);
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Dynamic Filter Toolbar */
        .ps-filter-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
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
          color: var(--text-secondary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ps-input, .ps-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border-input);
          border-radius: 8px;
          font-size: 13px;
          background: var(--bg-surface);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .ps-input:focus, .ps-select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(133, 15, 29, 0.1);
        }

        .ps-btn-apply {
          background: var(--accent);
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
          background: var(--accent-hover);
        }

        .ps-btn-clear {
          background: var(--bg-surface);
          color: var(--text-secondary);
          border: 1px solid var(--border-input);
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .ps-btn-clear:hover {
          background: var(--bg-muted);
        }

        /* Custom Table aesthetics */
        .ps-table-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 30px;
        }

        .ps-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .ps-table th:first-child { border-top-left-radius: 15px; }
        .ps-table th:last-child { border-top-right-radius: 15px; }
        .ps-table tr:last-child td:first-child { border-bottom-left-radius: 15px; }
        .ps-table tr:last-child td:last-child { border-bottom-right-radius: 15px; }

        .ps-table th {
          background: var(--bg-surface);
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 750;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }

        .ps-table td {
          padding: 16px 20px;
          font-size: 13.5px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .ps-table tr:last-child td {
          border-bottom: none;
        }

        .ps-table tr:hover td { background: var(--bg-hover); }

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

        .ps-status-pill.paid { background: transparent; color: #16a34a; border: 1px solid #16a34a; }
        .ps-status-pill.partial { background: transparent; color: #f59e0b; border: 1px solid #f59e0b; }
        .ps-status-pill.pending { background: transparent; color: #dc2626; border: 1px solid #dc2626; }

        /* Actions button ⋮ */
        .ps-ellipsis-btn {
          background: none;
          border: none;
          color: var(--text-faint);
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          line-height: 1;
        }

        .ps-ellipsis-btn:hover {
          background: var(--bg-muted);
          color: var(--text-secondary);
        }

        /* Popover actions menu */
        .ps-actions-popover {
          position: absolute;
          right: 20px;
          z-index: 99;
          width: 150px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
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
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ps-action-item:hover {
          background: var(--bg-muted);
          color: var(--accent);
        }

        /* Download drop controller */
        .ps-download-btn {
          background: none;
          border: none;
          color: var(--accent);
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
          background: var(--bg-surface);
          border: 1px solid var(--border);
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
          background: var(--bg-surface);
          border-top: 1px solid #f3f4f6;
        }

        .ps-page-info {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .ps-page-btn-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ps-page-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-input);
          background: var(--bg-surface);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.2s;
        }

        .ps-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ps-page-btn:hover:not(:disabled) {
          background: var(--bg-muted);
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
          background: var(--bg-muted);
          padding: 10px 12px;
          font-weight: 700;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .modal-xl {
          max-width: 960px !important;
        }
      `}</style>

      <div className="ps-wrapper">

        {/* ─── Top KPI Row Module ──────────────────────────────── */}
        <div className="kpi-row" style={{ marginBottom: 24 }}>

          {/* Card 1: Actual Payout */}
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#3b82f6', background: '#dbeafe' }}>
                <Coins size={20} />
              </div>
              <span className="kpi-tag" style={{ color: '#16a34a' }}>↗ 12% vs last month</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Actual Payout</div>
              <div className="kpi-value">{formatAmount(globalStats.actual)}</div>
            </div>
          </div>

          {/* Card 2: Received Payout */}
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a', background: '#dcfce7' }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Received Payout</div>
              <div className="kpi-value">{formatAmount(globalStats.received)}</div>
              <div style={{ width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginTop: '12px' }}>
                <div style={{ width: `${globalStats.rate}%`, height: '100%', background: '#16a34a' }} />
              </div>
            </div>
          </div>

          {/* Card 3: Pending Payout */}
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626', background: '#fecaca' }}>
                <Clock size={20} />
              </div>
              <span className="kpi-tag" style={{ color: '#dc2626' }}><AlertTriangle size={12} style={{ marginRight: 4 }} /> {globalStats.overdueCount} overdue</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Pending Payout</div>
              <div className="kpi-value">{formatAmount(globalStats.pending)}</div>
            </div>
          </div>

          {/* Card 4: Collection Rate */}
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#d97706', background: '#fef3c7' }}>
                <TrendingUp size={20} />
              </div>
              <span className="kpi-tag">TARGET: 85%</span>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Collection Rate</div>
              <div className="kpi-value">{globalStats.rate}%</div>
            </div>
          </div>

        </div>

        {/* ─── Dual Columns Visual Card Modules ────────────────── */}
        <div className="ps-charts-row">

          {/* Left Column: Collection Overview */}
          <div className="ps-main-card">
            <div className="ps-card-header">
              <div className="ps-card-title"><TrendingUp size={18} style={{ marginRight: 6, verticalAlign: "middle" }} /> Collection Overview</div>
              <button className="ps-ellipsis-btn">⋮</button>
            </div>

            {/* Donut Chart SVG */}
            <div className="ps-donut-wrap" style={{ margin: 'auto' }}>
              <DonutChart
                data={[
                  { type: 'Received', count: globalStats.received, percent: globalStats.rate, color: '#16a34a' },
                  { type: 'Pending', count: globalStats.pending, percent: 100 - globalStats.rate, color: '#dc2626' }
                ]}
                formatter={formatAmount}
                centerLabel="Total Payout"
                tooltipLabel=""
                hideLegend={true}
              />
            </div>

            {/* Metrics cards below donut */}
            <div className="ps-legend-grid">
              <div className="ps-legend-box green">
                <span className="ps-legend-lbl"><CircleDot size={12} color="#16a34a" style={{ marginRight: 6, verticalAlign: "middle" }} /> Received</span>
                <span className="ps-legend-val">{formatAmount(globalStats.received)}</span>
                <span style={{ fontSize: '11px', fontWeight: '750', color: '#16a34a' }}>{globalStats.rate}%</span>
              </div>
              <div className="ps-legend-box red">
                <span className="ps-legend-lbl"><CircleDot size={12} color="#dc2626" style={{ marginRight: 6, verticalAlign: "middle" }} /> Pending</span>
                <span className="ps-legend-val">{formatAmount(globalStats.pending)}</span>
                <span style={{ fontSize: '11px', fontWeight: '750', color: '#dc2626' }}>{100 - globalStats.rate}%</span>
              </div>
            </div>

            {/* Collection rate summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Collection Rate</span>
              <span>{globalStats.rate}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
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
              <div className="ps-card-title"><BarChart size={18} style={{ marginRight: 6, verticalAlign: "middle" }} /> Pending Payout Analysis</div>

              {/* Exporters Dropdown Controller */}
              <div ref={downloadRef}>
                <button
                  type="button"
                  className="ps-download-btn"
                  onClick={() => setDownloadOpen(!downloadOpen)}
                >
                  <Download size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Download Report
                </button>

                {downloadOpen && (
                  <div className="ps-download-popover">
                    <button className="ps-action-item" onClick={exportExcel}>
                      <FileSpreadsheet size={16} color="#16a34a" style={{ marginRight: 6, verticalAlign: "middle" }} /> Export Excel (.csv)
                    </button>
                    <button className="ps-action-item" onClick={exportPDF}>
                      <FileText size={16} color="#dc2626" style={{ marginRight: 6, verticalAlign: "middle" }} /> Export PDF (.pdf)
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
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px', fontWeight: '600' }}>
                  No outstanding payouts recorded! All balances paid.
                </div>
              )}

              {/* Outstanding debt analytics summary note */}
              {topPendingOutstanding.length > 0 && (
                <div className="ps-info-footer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} style={{ color: 'var(--text-secondary)' }} />
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
                <option value="All">All Status</option>
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
                const uniqueKey = `${item.client}_${item.file_no}`
                const isMenuOpen = activeMenuId === uniqueKey

                return (
                  <tr key={uniqueKey}>
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
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.client}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px', fontWeight: '500' }}>
                            {item.file_no}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actual Payout */}
                    <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
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
                        <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-secondary)', width: '32px' }}>
                          {item.collection_rate}%
                        </span>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
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
                          setActiveMenuId(isMenuOpen ? null : uniqueKey)
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
                            <Eye size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> View Details
                          </button>

                          <button
                            className="ps-action-item"
                            onClick={async () => {
                              const doneTxns = [...item.payments].filter(p => p.status === 'Completed').sort((a, b) => new Date(a.date) - new Date(b.date));
                              if (doneTxns.length === 0) {
                                addToast('No completed payments available to generate invoice.', 'error');
                                return;
                              }
                              setActiveMenuId(null);
                              await saveAndGoToInvoice({ client: item.client, file_no: item.file_no, payments: doneTxns, actual: item.actual, pending: item.pending });
                            }}
                          >
                            <FileText size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Generate Invoice
                          </button>

                          {item.pending > 0 && (
                            <button
                              className="ps-action-item"
                              onClick={() => {
                                setUpdatePayment(item)
                                setActiveMenuId(null)
                              }}
                            >
                              <RefreshCw size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Update Payment
                            </button>
                          )}

                          <button
                            className="ps-action-item"
                            onClick={() => {
                              setEditCustomer(item)
                              setActiveMenuId(null)
                            }}
                          >
                            <Edit size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Edit Record
                          </button>

                          <button
                            className="ps-action-item"
                            style={{ color: '#dc2626' }}
                            onClick={() => {
                              handleDeleteLedger(item)
                              setActiveMenuId(null)
                            }}
                          >
                            <Trash2 size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Delete Record
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                )
              })}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)', fontWeight: '600' }}>
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
              {selectedDetails.actual > 0 && (
                <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 4 }}>TOTAL OWED</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>₹{selectedDetails.actual.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 4 }}>RECEIVED</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>₹{selectedDetails.received.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 4 }}>PENDING</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: selectedDetails.pending > 0 ? '#dc2626' : '#16a34a' }}>
                        ₹{Math.max(0, selectedDetails.pending).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 8, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, selectedDetails.collection_rate)}%`, background: selectedDetails.collection_rate === 100 ? '#16a34a' : 'linear-gradient(90deg,#f59e0b,#16a34a)', borderRadius: 6, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
                    <span>{selectedDetails.collection_rate}% collected</span>
                    <span>{selectedDetails.collection_rate === 100 ? '✅ Fully Paid' : `${100 - selectedDetails.collection_rate}% remaining`}</span>
                  </div>
                </div>
              )}

              <div style={{ fontWeight: 705, color: 'var(--text-primary)', fontSize: '14px', marginTop: '6px' }}>
                Transaction Ledgers
              </div>

              <table className="ps-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetails.payments.map(p => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
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
                <button
                  type="button"
                  className="ps-btn-apply"
                  style={{ flex: 1 }}
                  onClick={async () => {
                    const doneTxns = [...selectedDetails.payments].filter(p => p.status === 'Completed').sort((a, b) => new Date(a.date) - new Date(b.date));
                    if (doneTxns.length === 0) {
                      addToast('No completed payments available to generate invoice.', 'error');
                      return;
                    }
                    setSelectedDetails(null);
                    await saveAndGoToInvoice({ client: selectedDetails.client, file_no: selectedDetails.file_no, payments: doneTxns, actual: selectedDetails.actual, pending: selectedDetails.pending });
                  }}
                >
                  <FileText size={16} style={{ marginRight: 8, verticalAlign: 'middle', display: 'inline-block' }} />
                  Generate Invoice
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
              <div style={{ background: 'var(--bg-hover)', border: '1px solid #fee2e2', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
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


        {/* ─── Modal C: Edit Single Payment Form ───── */}
        {updateSinglePayment && (
          <Modal
            title="Edit Payment"
            onClose={() => setUpdateSinglePayment(null)}
          >
            <div className="ps-modal-body-payout">
              <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
                <div>
                  <label className="ps-field-label">Amount (INR)</label>
                  <input
                    type="number"
                    className="ps-input"
                    value={updateSinglePayment.amount}
                    onChange={e => setUpdateSinglePayment({ ...updateSinglePayment, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="ps-field-label">Date</label>
                  <input
                    type="date"
                    className="ps-input"
                    value={updateSinglePayment.date}
                    onChange={e => setUpdateSinglePayment({ ...updateSinglePayment, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="ps-field-label">Status</label>
                  <select
                    className="ps-select"
                    value={updateSinglePayment.status}
                    onChange={e => setUpdateSinglePayment({ ...updateSinglePayment, status: e.target.value })}
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="data-btn data-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setUpdateSinglePayment(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ps-btn-apply"
                  style={{ flex: 1, padding: '10px 0' }}
                  onClick={handleUpdateSinglePayment}
                >
                  Update Payment
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── Modal D: Edit Customer Payout Ledger ───────────── */}
        {editCustomer && (() => {
          const actualNum = Number(editLedger.actualPayout) || 0
          const paidNum   = Number(editLedger.amountPaid)   || 0
          const balance   = actualNum - paidNum
          const pct       = actualNum > 0 ? Math.round((paidNum / actualNum) * 100) : 0
          return (
            <Modal
              title={`Edit Payout Ledger — ${editCustomer.client}`}
              size="lg"
              onClose={() => setEditCustomer(null)}
            >
              <div className="ps-modal-body-payout" style={{ width: '100%' }}>
                {/* File badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>File:</span>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{editCustomer.file_no}</span>
                </div>

                {/* Two input fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Actual Payout (Total Owed) ₹</div>
                    <input
                      type="number"
                      className="ps-input"
                      placeholder="e.g. 100000"
                      value={editLedger.actualPayout}
                      min={0}
                      onChange={e => setEditLedger(prev => ({ ...prev, actualPayout: e.target.value }))}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Total amount the customer owes</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Amount Paid (Received) ₹</div>
                    <input
                      type="number"
                      className="ps-input"
                      placeholder="e.g. 50000"
                      value={editLedger.amountPaid}
                      min={0}
                      max={actualNum || undefined}
                      onChange={e => setEditLedger(prev => ({ ...prev, amountPaid: e.target.value }))}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Amount already collected from customer</div>
                  </div>
                </div>

                {/* Live summary card */}
                {actualNum > 0 && (
                  <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 4 }}>TOTAL OWED</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>₹{actualNum.toLocaleString('en-IN')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 4 }}>RECEIVED</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>₹{paidNum.toLocaleString('en-IN')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 4 }}>PENDING</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                          ₹{Math.max(0, balance).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 8, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: pct === 100 ? '#16a34a' : 'linear-gradient(90deg,#f59e0b,#16a34a)', borderRadius: 6, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
                      <span>{pct}% collected</span>
                      <span>{pct === 100 ? '✅ Fully Paid' : `${100 - pct}% remaining`}</span>
                    </div>
                  </div>
                )}

                {/* Validation warning */}
                {paidNum > actualNum && actualNum > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
                    ⚠️ Amount Paid cannot exceed Actual Payout.
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="data-btn data-btn-outline" style={{ flex: 1 }} onClick={() => setEditCustomer(null)}>Cancel</button>
                  <button
                    type="button"
                    className="ps-btn-apply"
                    style={{ flex: 1, padding: '10px 0', opacity: paidNum > actualNum ? 0.5 : 1 }}
                    disabled={paidNum > actualNum}
                    onClick={handleSaveEditLedger}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </Modal>
          )
        })()}

      </div>
    </DashboardLayout>
  )
}
