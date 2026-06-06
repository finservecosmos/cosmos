import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import './DataPage.css'
import { CreditCard } from 'lucide-react';

function formatAmount(n) {
  return `₹${n.toLocaleString('en-IN')}`
}

const TYPES    = ['All', 'Disbursement', 'Collection', 'EMI']
const STATUSES = ['All', 'Completed', 'Pending', 'Processing', 'Failed']

const emptyPayment = {
  client: '', file_no: '', type: 'Disbursement', amount: 0, bank: '', date: new Date().toISOString().slice(0, 10), status: 'Pending', id: null,
}

export default function Payments() {
  const { payments, addPayment } = useAppState()
  const { addToast } = useToast()
  const [search, setSearch]       = useState('')
  const [typeFilter, setType]     = useState('All')
  const [statusFilter, setStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData]   = useState(emptyPayment)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 5

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.client.toLowerCase().includes(q) || p.file_no.includes(q) || p.bank.toLowerCase().includes(q)
    const matchType   = typeFilter === 'All' || p.type === typeFilter
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedPayments = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const totalIn  = payments.filter(p => p.type === 'Collection' && p.status === 'Completed').reduce((s,p) => s+p.amount, 0)
  const totalOut = payments.filter(p => p.type === 'Disbursement' && p.status === 'Completed').reduce((s,p) => s+p.amount, 0)
  const pending  = payments.filter(p => p.status === 'Pending').length

  const openAddModal = () => {
    setFormData(emptyPayment)
    setModalOpen(true)
  }

  const savePayment = () => {
    if (!formData.client || !formData.file_no) {
      addToast('Client and file number are required.', 'error')
      return
    }
    addPayment({ ...formData, amount: Number(formData.amount) })
    addToast('Payment recorded successfully.', 'success')
    setModalOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Payments</h2>
            <p className="data-page-sub">All payment transactions</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openAddModal}>+ Record Payment</button>
        </div>

        {/* Summary */}
        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Total Transactions</div>
            <div className="data-summary-value">{payments.length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Collections</div>
            <div className="data-summary-value accent">{formatAmount(totalIn)}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Disbursements</div>
            <div className="data-summary-value">{formatAmount(totalOut)}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Pending</div>
            <div className="data-summary-value">{pending}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search by client, file no, bank..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={typeFilter} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
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
                <th>ID</th>
                <th>Client</th>
                <th>File No.</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Bank</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="data-empty">
                    <div className="data-empty-icon"><CreditCard size={48} /></div>
                    <div className="data-empty-title">No payments found</div>
                    <div className="data-empty-sub">Try adjusting your filters</div>
                  </div>
                </td></tr>
              ) : paginatedPayments.map((p) => (
                <tr key={p.id}>
                  <td className="cell-muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.client}</td>
                  <td className="cell-muted">{p.file_no}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                      background: p.type === 'Disbursement' ? '#dbeafe' : p.type === 'Collection' ? '#dcfce7' : '#fef3c7',
                      color:      p.type === 'Disbursement' ? '#2563eb' : p.type === 'Collection' ? '#16a34a' : '#d97706',
                    }}>{p.type}</span>
                  </td>
                  <td className="cell-amount">{formatAmount(p.amount)}</td>
                  <td className="cell-muted">{p.bank}</td>
                  <td className="cell-muted">{p.date}</td>
                  <td><span className={`status-badge status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn" onClick={() => addToast('Payment details shown in list.', 'info')}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="data-pagination">
              <span className="data-pagination-info">
                Showing {Math.min(filtered.length, (currentPage - 1) * PAGE_SIZE + 1)} to {Math.min(filtered.length, currentPage * PAGE_SIZE)} of {filtered.length} transactions
              </span>
              <div className="data-pagination-btns">
                <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={`data-page-btn${currentPage === i + 1 ? ' active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal title="Record payment" onClose={() => setModalOpen(false)}>
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
                Type
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  {TYPES.slice(1).map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>
                Amount
                <input type="number" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </label>
              <label>
                Bank
                <input type="text" value={formData.bank} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} />
              </label>
              <label>
                Date
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
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
              <button type="button" className="admin-primary-btn" onClick={savePayment}>Save payment</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
