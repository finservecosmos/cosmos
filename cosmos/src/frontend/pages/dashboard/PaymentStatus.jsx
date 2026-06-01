import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAppState } from '../../../context/AppStateContext'
import '../DataPage.css'

function formatAmount(n) { return `₹${n.toLocaleString('en-IN')}` }

export default function PaymentStatus() {
  const { payments } = useAppState()
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('All')

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.client.toLowerCase().includes(q) || p.file_no.includes(q)
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCollected  = payments.filter(p => p.status === 'Completed').reduce((s,p) => s+p.amount, 0)
  const totalPending    = payments.filter(p => p.status === 'Pending').reduce((s,p) => s+p.amount, 0)

  return (
    <DashboardLayout>
      <div className="data-page">
        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Payment Status</h2>
            <p className="data-page-sub">Real-time payment tracking</p>
          </div>
        </div>

        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Total Collected</div>
            <div className="data-summary-value accent">{formatAmount(totalCollected)}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Pending</div>
            <div className="data-summary-value">{formatAmount(totalPending)}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Completed</div>
            <div className="data-summary-value">{payments.filter(p => p.status === 'Completed').length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Failed</div>
            <div className="data-summary-value" style={{ color: '#c0392b' }}>{payments.filter(p => p.status === 'Failed').length}</div>
          </div>
        </div>

        <div className="data-toolbar">
          <div className="data-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search by client or file no..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            {['All','Completed','Pending','Processing','Failed'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Client</th><th>File No.</th>
                <th>Type</th><th>Amount</th><th>Bank</th>
                <th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.client}</td>
                  <td className="cell-muted">{p.file_no}</td>
                  <td className="cell-muted">{p.type}</td>
                  <td className="cell-amount">{formatAmount(p.amount)}</td>
                  <td className="cell-muted">{p.bank}</td>
                  <td className="cell-muted">{p.date}</td>
                  <td><span className={`status-badge status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="data-pagination">
            <span className="data-pagination-info">Showing {filtered.length} of {payments.length}</span>
            <div className="data-pagination-btns">
              <button className="data-page-btn" disabled>‹</button>
              <button className="data-page-btn active">1</button>
              <button className="data-page-btn">›</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
