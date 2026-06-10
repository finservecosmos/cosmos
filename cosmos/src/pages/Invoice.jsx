import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../widgets/DashboardLayout'
import Modal from '../shared/ui/Modal'
import { useAppState } from '../context/AppStateContext'
import { useToast } from '../context/ToastContext'
import useConfirm from '../shared/lib/useConfirm'
import '../shared/ui/DataPage.css'
import { FileText, CheckCircle, Receipt, Eye, Download, Trash2 } from 'lucide-react'

function formatAmount(n) { return `₹${n.toLocaleString('en-IN')}` }

const emptyInvoice = {
  client: '', service: '', amount: 0, date: new Date().toISOString().slice(0, 10), id: null, history: [],
}

export default function Invoice() {
  const { invoices, addInvoice, removeInvoice, payments, clients } = useAppState()
  const { addToast } = useToast()
  const confirm = useConfirm()
  const location = useLocation()
  const navigate = useNavigate()

  const [search, setSearch]               = useState('')
  const [modalOpen, setModalOpen]         = useState(false)
  const [formData, setFormData]           = useState(emptyInvoice)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Prefill from navigation state (e.g. from Login Files)
  useEffect(() => {
    if (location.state?.prefillClient) {
      setFormData({
        ...emptyInvoice,
        client:  location.state.prefillClient,
        amount:  location.state.prefillAmount || 0,
        service: 'Loan Processing Payout Collection',
        date:    new Date().toISOString().slice(0, 10),
        history: location.state.history || [],
      })
      setModalOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return !q || inv.client?.toLowerCase().includes(q) || inv.id?.toString().toLowerCase().includes(q)
  })

  const totalAmount = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0)

  const openCreateModal = () => { setFormData(emptyInvoice); setModalOpen(true) }
  const openViewModal   = (inv) => setSelectedInvoice(inv)

  const saveInvoice = () => {
    if (!formData.client || !formData.amount) {
      addToast('Client and amount are required.', 'error')
      return
    }
    addInvoice({ ...formData, amount: Number(formData.amount) })
    addToast('Invoice created successfully.', 'success')
    setModalOpen(false)
  }

  const handleDelete = async (inv) => {
    if (await confirm({
      title: 'Delete Invoice',
      message: `Are you sure you want to delete invoice ${inv.id}? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: '#dc2626',
    })) {
      removeInvoice(inv.id)
      addToast('Invoice deleted successfully.', 'success')
    }
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Invoice</h2>
            <p className="data-page-sub">Service invoices for all clients</p>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#3b82f6', background: '#dbeafe' }}>
                <FileText size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Invoices</div>
              <div className="kpi-value">{invoices.length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a', background: '#dcfce7' }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Amount</div>
              <div className="kpi-value">{formatAmount(totalAmount)}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search by client or invoice ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="data-btn data-btn-outline">Export</button>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Invoice Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="data-empty">
                    <div className="data-empty-icon"><Receipt size={48} /></div>
                    <div className="data-empty-title">No invoices found</div>
                    <div className="data-empty-sub">Try adjusting your search</div>
                  </div>
                </td></tr>
              ) : filtered.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{inv.id}</td>
                  <td style={{ fontWeight: 600 }}>{inv.client}</td>
                  <td className="cell-muted">{inv.service}</td>
                  <td className="cell-amount">{formatAmount(inv.amount)}</td>
                  <td className="cell-muted">{inv.date}</td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn" onClick={() => openViewModal(inv)} title="View"><Eye size={16} /></button>
                      <button className="row-btn" onClick={() => addToast('Invoice downloaded.', 'success')} title="Download"><Download size={16} /></button>
                      <button className="row-btn" style={{ color: '#dc2626' }} onClick={() => handleDelete(inv)} title="Delete"><Trash2 size={16} /></button>
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

        {/* Create Invoice Modal */}
        {modalOpen && (
          <Modal title="Create invoice" onClose={() => setModalOpen(false)}>
            <div className="form-grid">
              <label>
                Client
                <input type="text" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
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
            </div>
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={saveInvoice}>Save invoice</button>
            </div>
          </Modal>
        )}

        {/* View Invoice Modal */}
        {selectedInvoice && (() => {
          const clientRecord = clients.find(c => c.name === selectedInvoice.client)
          const clientPhone  = clientRecord?.phone || ''

          const getHistory = () => {
            if (selectedInvoice.history?.length > 0)
              return selectedInvoice.history.filter(h => h.status === 'Completed' || h.status === 'Paid')
            return payments
              .filter(p => p.client === selectedInvoice.client && (p.status === 'Completed' || p.status === 'Paid'))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
          }
          const history = getHistory()

          const totalPaid = history.length > 0
            ? history.reduce((s, p) => s + (Number(p.amount) || 0), 0)
            : selectedInvoice.amount

          return (
            <Modal title="Invoice details" onClose={() => setSelectedInvoice(null)}>
              <div className="print-invoice-container" style={{ padding: '10px 20px', color: 'var(--text-primary)' }}>
                <style>{`
                  @media print {
                    body * { visibility: hidden !important; }
                    .print-invoice-container, .print-invoice-container * { visibility: visible !important; }
                    .print-invoice-container {
                      position: absolute !important; left: 0 !important; top: 0 !important;
                      width: 100% !important; background: #fff !important;
                      color: #000 !important; padding: 40px !important;
                    }
                    .print-hide { display: none !important; }
                  }
                `}</style>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>COSMOS FINSERVE</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Institutional Wealth &amp; Loan Advisory</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700 }}>INVOICE</h4>
                    <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{selectedInvoice.id}</p>
                  </div>
                </div>

                {/* Meta Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 12 }}>
                  {/* Billed To — client name + phone */}
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Billed To</p>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{selectedInvoice.client}</p>
                    {clientPhone && (
                      <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{clientPhone}</p>
                    )}
                  </div>
                  {/* Invoice Details — issued date only */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Invoice Details</p>
                    <p><strong>Issued:</strong> {selectedInvoice.date}</p>
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

                {/* Payment History */}
                {history.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Paid Transaction History</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--text-secondary)', fontWeight: 700 }}>Date</th>
                          <th style={{ textAlign: 'center', padding: '6px 10px', color: 'var(--text-secondary)', fontWeight: 700 }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--text-secondary)', fontWeight: 700 }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 10px', color: 'var(--text-primary)' }}>{h.date}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#dcfce7', color: '#16a34a' }}>{h.status}</span>
                            </td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{formatAmount(h.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12 }}>
                  <div style={{ width: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--border)', marginTop: 6, fontSize: 14 }}>
                      <span style={{ fontWeight: 800 }}>Total Paid Amount</span>
                      <span className="invoice-total" style={{ fontWeight: 800, color: 'var(--accent)' }}>
                        {formatAmount(totalPaid)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons with gap */}
              <div className="modal-actions print-hide" style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <button type="button" className="admin-action-btn" onClick={() => setSelectedInvoice(null)}>Close</button>
                <button type="button" className="admin-primary-btn" onClick={() => window.print()}>Print Invoice</button>
              </div>
            </Modal>
          )
        })()}

      </div>
    </DashboardLayout>
  )
}
