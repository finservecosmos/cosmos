import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../../shared/lib/useConfirm'
import '../../shared/ui/DataPage.css'
import { FileText, CheckCircle, Clock, AlertTriangle, Receipt } from 'lucide-react'

function formatAmount(n) { return `₹${Number(n).toLocaleString('en-IN')}` }

const TYPES = ['All', 'Income', 'Expense']

const emptyInvoice = {
  name: '', particular: '', type: 'Income', amount: 0, date: new Date().toISOString().slice(0, 10), id: null,
}

export default function FinanceInvoice() {
  const { financeInvoices, addFinanceInvoice, removeFinanceInvoice } = useAppState()
  const { addToast } = useToast()
  const confirm = useConfirm()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData]   = useState(emptyInvoice)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Prefill check on load
  useEffect(() => {
    if (location.state?.prefillName) {
      setFormData({
        ...emptyInvoice,
        name: location.state.prefillName,
        particular: location.state.prefillParticular || '',
        amount: location.state.prefillAmount || 0,
        type: location.state.prefillType || 'Income',
        date: location.state.prefillDate || new Date().toISOString().slice(0, 10),
      })
      setModalOpen(true)
      
      // Clean up local navigation history state to prevent recurring popup on refreshes
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const filtered = financeInvoices.filter((inv) => {
    const q = search.toLowerCase()
    const matchSearch = !q || inv.name?.toLowerCase().includes(q) || inv.id?.toLowerCase().includes(q)
    const matchType = typeFilter === 'All' || inv.type === typeFilter
    return matchSearch && matchType
  })

  const totalIncome  = financeInvoices.filter(i => i.type === 'Income').reduce((s,i) => s+i.amount, 0)
  const totalExpense = financeInvoices.filter(i => i.type === 'Expense').reduce((s,i) => s+i.amount, 0)

  const openCreateModal = () => {
    setFormData(emptyInvoice)
    setModalOpen(true)
  }

  const openViewModal = (inv) => {
    setSelectedInvoice(inv)
  }

  const saveInvoice = () => {
    if (!formData.name || !formData.particular) {
      addToast('Name and particular are required.', 'error')
      return
    }
    addFinanceInvoice({ ...formData, amount: Number(formData.amount) })
    addToast('Finance invoice generated successfully.', 'success')
    setModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (await confirm('Are you sure you want to delete this finance record?')) {
      await removeFinanceInvoice(id)
      addToast('Finance record deleted.', 'success')
    }
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Finance Invoice</h2>
            <p className="data-page-sub">Receipts and Vouchers for internal finance operations</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openCreateModal}>+ Generate Record</button>
        </div>

        {/* Summary */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#3b82f6', background: '#dbeafe' }}>
                <FileText size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Records</div>
              <div className="kpi-value">{financeInvoices.length}</div>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a', background: '#dcfce7' }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Income Receipts</div>
              <div className="kpi-value">{formatAmount(totalIncome)}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626', background: '#fecaca' }}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Expense Vouchers</div>
              <div className="kpi-value">{formatAmount(totalExpense)}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {TYPES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="data-btn data-btn-outline">Export</button>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Name / Entity</th>
                <th>Particulars</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="data-empty">
                    <div className="data-empty-icon"><Receipt size={48} /></div>
                    <div className="data-empty-title">No finance records found</div>
                    <div className="data-empty-sub">Try adjusting your filters</div>
                  </div>
                </td></tr>
              ) : filtered.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{inv.id}</td>
                  <td style={{ fontWeight: 600 }}>{inv.name}</td>
                  <td className="cell-muted">{inv.particular}</td>
                  <td className="cell-amount">{formatAmount(inv.amount)}</td>
                  <td className="cell-muted">{inv.date}</td>
                  <td>
                    <span className={`status-badge ${inv.type === 'Income' ? 'status-paid' : 'status-overdue'}`}>
                      {inv.type === 'Income' ? 'Receipt' : 'Voucher'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn" onClick={() => openViewModal(inv)}>View</button>
                      <button className="row-btn delete-btn" onClick={() => handleDelete(inv.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="data-pagination">
              <span className="data-pagination-info">Showing {filtered.length} of {financeInvoices.length} records</span>
              <div className="data-pagination-btns">
                <button className="data-page-btn" disabled>‹</button>
                <button className="data-page-btn active">1</button>
                <button className="data-page-btn">›</button>
              </div>
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal title="Generate Finance Record" onClose={() => setModalOpen(false)}>
            <div className="form-grid">
              <label>
                Name / Entity
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </label>
              <label>
                Particulars
                <input type="text" value={formData.particular} onChange={(e) => setFormData({ ...formData, particular: e.target.value })} />
              </label>
              <label>
                Amount
                <input type="number" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </label>
              <label>
                Type
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  {['Income', 'Expense'].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>
                Date
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)} style={{ marginRight: 'auto' }}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={saveInvoice}>Generate</button>
            </div>
          </Modal>
        )}

        {selectedInvoice && (
          <Modal title={selectedInvoice.type === 'Income' ? 'Receipt Details' : 'Voucher Details'} onClose={() => setSelectedInvoice(null)}>
            <div className="print-invoice-container" style={{ padding: '10px 20px', color: 'var(--text-primary)' }}>
              <style>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  .print-invoice-container, .print-invoice-container * {
                    visibility: visible !important;
                  }
                  .print-invoice-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    background: #fff !important;
                    color: #000 !important;
                    padding: 40px !important;
                  }
                  .print-hide {
                    display: none !important;
                  }
                }
              `}</style>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>COSMOS FINSERVE</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Finance Operations</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>
                    {selectedInvoice.type === 'Income' ? 'RECEIPT' : 'PAYMENT VOUCHER'}
                  </h4>
                  <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{selectedInvoice.id}</p>
                </div>
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 12 }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    {selectedInvoice.type === 'Income' ? 'Received From' : 'Paid To'}
                  </p>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{selectedInvoice.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Details</p>
                  <p><strong>Date:</strong> {selectedInvoice.date}</p>
                  <p style={{ marginTop: 4 }}>
                    <strong>Record Type: </strong>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: selectedInvoice.type === 'Income' ? '#dcfce7' : '#fde8e8',
                      color: selectedInvoice.type === 'Income' ? '#16a34a' : '#c0392b'
                    }}>{selectedInvoice.type}</span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Particulars</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{selectedInvoice.particular}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{formatAmount(selectedInvoice.amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Calculations */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12 }}>
                <div style={{ width: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--border)', marginTop: 6, fontSize: 14 }}>
                    <span style={{ fontWeight: 800 }}>Total</span>
                    <span className="invoice-total" style={{ fontWeight: 800, color: 'var(--accent)' }}>{formatAmount(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-actions print-hide" style={{ marginTop: 24 }}>
              <button type="button" className="admin-action-btn" onClick={() => setSelectedInvoice(null)} style={{ marginRight: 'auto' }}>Close</button>
              <button type="button" className="admin-primary-btn" onClick={() => window.print()}>Print</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
