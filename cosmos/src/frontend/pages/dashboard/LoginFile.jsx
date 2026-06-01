import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Modal from '../../components/Modal'
import { useAppState } from '../../../context/AppStateContext'
import { useToast } from '../../../context/ToastContext'
import '../DataPage.css'

const STATUSES = ['All', 'Approved', 'Processing', 'Pending']
const STAGES   = ['All', 'Disbursement', 'Verification', 'Credit Check', 'Document Review', 'Submission']

const emptyLoginFile = {
  client: '', file_no: '', loan_type: 'Home Loan', bank: '', submitted: new Date().toISOString().slice(0, 10), status: 'Pending', stage: 'Disbursement', id: null,
}

export default function LoginFile() {
  const { loginFiles, addLoginFile, updateLoginFile } = useAppState()
  const { addToast } = useToast()
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState('All')
  const [stageFilter, setStage] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [formData, setFormData]   = useState(emptyLoginFile)

  const filtered = loginFiles.filter((f) => {
    const q = search.toLowerCase()
    const matchSearch = !q || f.client.toLowerCase().includes(q) || f.file_no.includes(q)
    const matchStatus = statusFilter === 'All' || f.status === statusFilter
    const matchStage  = stageFilter === 'All' || f.stage === stageFilter
    return matchSearch && matchStatus && matchStage
  })

  const openAddModal = () => {
    setModalMode('add')
    setFormData(emptyLoginFile)
    setModalOpen(true)
  }

  const openEditModal = (file) => {
    setModalMode('edit')
    setFormData(file)
    setModalOpen(true)
  }

  const openViewModal = (file) => {
    setModalMode('view')
    setFormData(file)
    setModalOpen(true)
  }

  const saveLoginFile = () => {
    if (!formData.client || !formData.file_no) {
      addToast('Client name and file number are required.', 'error')
      return
    }
    if (modalMode === 'edit') {
      updateLoginFile(formData)
      addToast('Login file updated successfully.', 'success')
    } else {
      addLoginFile(formData)
      addToast('Login file added successfully.', 'success')
    }
    setModalOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="data-page">
        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Login File</h2>
            <p className="data-page-sub">Files submitted to banks for processing</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openAddModal}>+ Log New File</button>
        </div>

        <div className="data-summary">
          {['Approved','Processing','Pending'].map(s => (
            <div className="data-summary-item" key={s}>
              <div className="data-summary-label">{s}</div>
              <div className="data-summary-value">{loginFiles.filter(f => f.status === s).length}</div>
            </div>
          ))}
          <div className="data-summary-item">
            <div className="data-summary-label">Total Files</div>
            <div className="data-summary-value accent">{loginFiles.length}</div>
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
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="data-filter-select" value={stageFilter} onChange={e => setStage(e.target.value)}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>File No.</th><th>Client</th><th>Loan Type</th>
                <th>Bank</th><th>Submitted</th><th>Stage</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{f.file_no}</td>
                  <td style={{ fontWeight: 600 }}>{f.client}</td>
                  <td>{f.loan_type}</td>
                  <td className="cell-muted">{f.bank}</td>
                  <td className="cell-muted">{f.submitted}</td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{f.stage}</span>
                  </td>
                  <td><span className={`status-badge status-${f.status.toLowerCase()}`}>{f.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn" onClick={() => openViewModal(f)}>View</button>
                      <button className="row-btn" onClick={() => openEditModal(f)}>Update</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="data-pagination">
            <span className="data-pagination-info">Showing {filtered.length} of {loginFiles.length}</span>
            <div className="data-pagination-btns">
              <button className="data-page-btn" disabled>‹</button>
              <button className="data-page-btn active">1</button>
              <button className="data-page-btn">›</button>
            </div>
          </div>
        </div>

        {modalOpen && (
          <Modal title={modalMode === 'view' ? 'Login file details' : modalMode === 'edit' ? 'Update login file' : 'Log new file'} onClose={() => setModalOpen(false)}>
            <div className="form-grid">
              <label>
                Client
                <input type="text" value={formData.client} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
              </label>
              <label>
                File No.
                <input type="text" value={formData.file_no} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, file_no: e.target.value })} />
              </label>
              <label>
                Loan Type
                <input type="text" value={formData.loan_type} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })} />
              </label>
              <label>
                Bank
                <input type="text" value={formData.bank} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} />
              </label>
              <label>
                Submitted
                <input type="date" value={formData.submitted} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, submitted: e.target.value })} />
              </label>
              <label>
                Status
                <select value={formData.status} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  {STATUSES.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label>
                Stage
                <select value={formData.stage} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, stage: e.target.value })}>
                  {STAGES.slice(1).map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button type="button" className="admin-primary-btn" onClick={saveLoginFile}>Save</button>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
