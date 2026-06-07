import { useState } from 'react'
import DashboardLayout from '../widgets/DashboardLayout'
import Modal from '../shared/ui/Modal'
import { useAppState } from '../context/AppStateContext'
import { useToast } from '../context/ToastContext'
import '../shared/ui/DataPage.css'
import { Package, CheckCircle, Ban } from 'lucide-react'

const CATEGORIES = ['All', 'Loan', 'Advisory', 'Consultation']

const emptyProduct = {
  name: '', category: 'Loan', fee: 0, gst: 18, description: '', active: true, id: null,
}

export default function ProductServiceBook() {
  const { products, addProduct, updateProduct } = useAppState()
  const { addToast } = useToast()
  const [search, setSearch]      = useState('')
  const [catFilter, setCat]      = useState('All')
  const [activeOnly, setActive]  = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [formData, setFormData]   = useState(emptyProduct)

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    const matchCat    = catFilter === 'All' || p.category === catFilter
    const matchActive = !activeOnly || p.active
    return matchSearch && matchCat && matchActive
  })

  const openAddModal = () => {
    setModalMode('add')
    setFormData(emptyProduct)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setModalMode('edit')
    setFormData(product)
    setModalOpen(true)
  }

  const toggleProductStatus = (product) => {
    updateProduct({ ...product, active: !product.active })
    addToast(`${product.name} ${product.active ? 'disabled' : 'enabled'}.`, 'success')
  }

  const saveProduct = () => {
    if (!formData.name) {
      addToast('Product name is required.', 'error')
      return
    }
    const payload = { ...formData, fee: Number(formData.fee), gst: Number(formData.gst) }
    if (modalMode === 'edit') {
      updateProduct(payload)
      addToast('Service updated successfully.', 'success')
    } else {
      addProduct(payload)
      addToast('Service added successfully.', 'success')
    }
    setModalOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Product & Service Book</h2>
            <p className="data-page-sub">All service offerings and fee structure</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openAddModal}>+ Add Service</button>
        </div>

        {/* Summary */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#3b82f6', background: '#dbeafe' }}>
                <Package size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Total Services</div>
              <div className="kpi-value">{products.length}</div>
            </div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#16a34a', background: '#dcfce7' }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Active</div>
              <div className="kpi-value">{products.filter(p => p.active).length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-wrap" style={{ color: '#dc2626', background: '#fecaca' }}>
                <Ban size={20} />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-title">Inactive</div>
              <div className="kpi-value">{products.filter(p => !p.active).length}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={catFilter} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={activeOnly} onChange={e => setActive(e.target.checked)} />
            Active only
          </label>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Service Name</th>
                <th>Category</th>
                <th>Fee</th>
                <th>GST (18%)</th>
                <th>Total</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="data-empty">
                    <div className="data-empty-icon"><Package size={48} /></div>
                    <div className="data-empty-title">No services found</div>
                    <div className="data-empty-sub">Try adjusting your filters</div>
                  </div>
                </td></tr>
              ) : filtered.map((p) => {
                const gstAmt = Math.round(p.fee * p.gst / 100)
                return (
                  <tr key={p.id}>
                    <td className="cell-muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                        background: p.category === 'Loan' ? '#dbeafe' : p.category === 'Advisory' ? '#fef3c7' : '#ede9fe',
                        color:      p.category === 'Loan' ? '#2563eb' : p.category === 'Advisory' ? '#d97706' : '#7c3aed',
                      }}>{p.category}</span>
                    </td>
                    <td className="cell-amount">₹{p.fee.toLocaleString('en-IN')}</td>
                    <td className="cell-muted">₹{gstAmt.toLocaleString('en-IN')}</td>
                    <td className="cell-amount">₹{(p.fee + gstAmt).toLocaleString('en-IN')}</td>
                    <td className="cell-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                    <td><span className={`status-badge status-${p.active ? 'active' : 'inactive'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="row-btn" onClick={() => openEditModal(p)}>Edit</button>
                        <button className="row-btn danger" onClick={() => toggleProductStatus(p)}>{p.active ? 'Disable' : 'Enable'}</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <Modal title={modalMode === 'edit' ? 'Edit service' : 'Add service'} onClose={() => setModalOpen(false)}>
            <div className="form-grid">
              <label>
                Service name
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </label>
              <label>
                Category
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {CATEGORIES.slice(1).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </label>
              <label>
                Fee
                <input type="number" min="0" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} />
              </label>
              <label>
                GST (%)
                <input type="number" min="0" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Description
                <textarea value={formData.description} rows={3} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </label>
              <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
                Active service
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={saveProduct}>Save</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
