import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import './DataPage.css'

function formatAmount(n) { return `₹${n.toLocaleString('en-IN')}` }

const STATUSES = ['All', 'Paid', 'Pending', 'Overdue']

const emptyInvoice = {
  client: '', file_no: '', service: '', amount: 0, date: new Date().toISOString().slice(0, 10), due: new Date(new Date().getTime() + 7*24*60*60*1000).toISOString().slice(0, 10), status: 'Pending', id: null,
}

export default function Invoice() {
  const { invoices, addInvoice } = useAppState()
  const { addToast } = useToast()
  const location = useLocation()
  
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData]   = useState(emptyInvoice)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Prefill check on load
  useEffect(() => {
    if (location.state?.prefillClient) {
      setFormData({
        ...emptyInvoice,
        client: location.state.prefillClient,
        file_no: location.state.prefillFileNo || '',
        amount: location.state.prefillAmount || 0,
        service: 'Loan Processing Payout Collection',
        date: new Date().toISOString().slice(0, 10),
        due: new Date(new Date().getTime() + 7*24*60*60*1000).toISOString().slice(0, 10),
        status: 'Pending'
      })
      setModalOpen(true)
      
      // Clean up local navigation history state to prevent recurring popup on refreshes
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    const matchSearch = !q || inv.client.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPaid    = invoices.filter(i => i.status === 'Paid').reduce((s,i) => s+i.amount, 0)
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((s,i) => s+i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s,i) => s+i.amount, 0)

  const openCreateModal = () => {
    setFormData(emptyInvoice)
    setModalOpen(true)
  }

  const openViewModal = (inv) => {
    setSelectedInvoice(inv)
  }

  const saveInvoice = () => {
    if (!formData.client || !formData.service) {
      addToast('Client and service are required.', 'error')
      return
    }
    addInvoice({ ...formData, amount: Number(formData.amount) })
    addToast('Invoice created successfully.', 'success')
    setModalOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Invoice</h2>
            <p className="data-page-sub">Service invoices for all clients</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openCreateModal}>+ Create Invoice</button>
        </div>

        {/* Summary */}
        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Total Invoices</div>
            <div className="data-summary-value">{invoices.length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Collected</div>
            <div className="data-summary-value accent">{formatAmount(totalPaid)}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Pending</div>
            <div className="data-summary-value">{formatAmount(totalPending)}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Overdue</div>
            <div className="data-summary-value" style={{ color: '#c0392b' }}>{formatAmount(totalOverdue)}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search by client or invoice ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="data-btn data-btn-outline">Export</button>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>File No.</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="data-empty">
                    <div className="data-empty-icon">🧾</div>
                    <div className="data-empty-title">No invoices found</div>
                    <div className="data-empty-sub">Try adjusting your filters</div>
                  </div>
                </td></tr>
              ) : filtered.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{inv.id}</td>
                  <td style={{ fontWeight: 600 }}>{inv.client}</td>
                  <td className="cell-muted">{inv.file_no}</td>
                  <td className="cell-muted">{inv.service}</td>
                  <td className="cell-amount">{formatAmount(inv.amount)}</td>
                  <td className="cell-muted">{inv.date}</td>
                  <td className="cell-muted" style={{ color: inv.status === 'Overdue' ? '#c0392b' : undefined }}>{inv.due}</td>
                  <td><span className={`status-badge status-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn" onClick={() => openViewModal(inv)}>View</button>
                      <button className="row-btn" onClick={() => addToast('Invoice downloaded.', 'success')}>Download</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="data-pagination">
              <span className="data-pagination-info">Showing {filtered.length} of {invoices.length} invoices</span>
              <div className="data-pagination-btns">
                <button className="data-page-btn" disabled>‹</button>
                <button className="data-page-btn active">1</button>
                <button className="data-page-btn">›</button>
              </div>
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal title="Create invoice" onClose={() => setModalOpen(false)}>
            <div className="form-grid">
              <label>
                Client
                <input type="text" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
              </label>
              <label>
                File No.
                <input type="text" value={formData.file_no} onChange={(e) => setFormData({ ...formData, file_no: e.target.value })} />
              </label>
              <label>
                Service
                <input type="text" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} />
              </label>
              <label>
                Amount
                <input type="number" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </label>
              <label>
                Invoice date
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </label>
              <label>
                Due date
                <input type="date" value={formData.due} onChange={(e) => setFormData({ ...formData, due: e.target.value })} />
              </label>
              <label>
                Status
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  {STATUSES.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={saveInvoice}>Save invoice</button>
            </div>
          </Modal>
        )}

        {selectedInvoice && (
          <Modal title="Invoice details" onClose={() => setSelectedInvoice(null)}>
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
              
              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>COSMOS FINSERVE</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Institutional Wealth & Loan Advisory</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>INVOICE</h4>
                  <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{selectedInvoice.id}</p>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 12 }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Billed To</p>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{selectedInvoice.client}</p>
                  <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>File Number: {selectedInvoice.file_no}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Invoice Details</p>
                  <p><strong>Issued:</strong> {selectedInvoice.date}</p>
                  <p style={{ marginTop: 2 }}><strong>Due:</strong> {selectedInvoice.due}</p>
                  <p style={{ marginTop: 4 }}>
                    <strong>Status: </strong>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: selectedInvoice.status === 'Paid' ? '#dcfce7' : selectedInvoice.status === 'Pending' ? '#fef3c7' : '#fde8e8',
                      color: selectedInvoice.status === 'Paid' ? '#16a34a' : selectedInvoice.status === 'Pending' ? '#d97706' : '#c0392b'
                    }}>{selectedInvoice.status}</span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{selectedInvoice.service}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{formatAmount(selectedInvoice.amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Calculations */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12 }}>
                <div style={{ width: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Base Fee</span>
                    <span style={{ fontWeight: 600 }}>{formatAmount(selectedInvoice.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>CGST (9%)</span>
                    <span style={{ fontWeight: 600 }}>{formatAmount(Math.round(selectedInvoice.amount * 0.09))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>SGST (9%)</span>
                    <span style={{ fontWeight: 600 }}>{formatAmount(Math.round(selectedInvoice.amount * 0.09))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--border)', marginTop: 6, fontSize: 14 }}>
                    <span style={{ fontWeight: 800 }}>Total (incl. GST)</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{formatAmount(Math.round(selectedInvoice.amount * 1.18))}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions print-hide">
              <button type="button" className="admin-action-btn" onClick={() => setSelectedInvoice(null)}>Close</button>
              <button type="button" className="admin-primary-btn" onClick={() => window.print()}>Print Invoice</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
