import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useUser } from '../../context/UserContext'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import Modal from './Modal'
import cosmosLogo from '../../assets/cosmosLogo.jpeg'
import './Sidebar.css'

const mainMenuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Client Record Book',
    path: '/clients',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Associates Book',
    path: '/associates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Invoice',
    path: '/payments/invoice',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="16" y1="2" x2="16" y2="4" />
        <line x1="8" y1="2" x2="8" y2="4" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Product & Service Book',
    path: '/payments/products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
]

const financeOpsItems = [
  {
    label: 'Overview',
    path: '/finance/overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Finance Entry',
    path: '/finance/entry',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: 'Investment',
    path: '/finance/investment',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    label: 'Income & Expenses',
    path: '/finance/overview?tab=income',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    isComingSoon: true,
  },
]

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user } = useUser()
  const { addEnquiry } = useAppState()
  const { addToast } = useToast()
  
  // Quick Enquiry Modal Trigger
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false)
  const [enquiryData, setEnquiryData] = useState({
    name: '', phone: '', loan_type: 'Home Loan', amount: '', date: new Date().toISOString().slice(0, 10), associate: 'Unassigned', status: 'Enquiry'
  })

  const handleLogout = async () => {
    sessionStorage.removeItem('dev_auth')
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleSaveEnquiry = () => {
    if (!enquiryData.name || !enquiryData.phone) {
      addToast('Client name and phone number are required.', 'error')
      return
    }
    if (!/^\d{10}$/.test(enquiryData.phone)) {
      addToast('Phone number must be exactly 10 digits.', 'error')
      return
    }
    
    addEnquiry({
      ...enquiryData,
      amount: Number(enquiryData.amount) || 0
    })
    addToast('Loan enquiry added successfully.', 'success')
    setEnquiryModalOpen(false)
    setEnquiryData({
      name: '', phone: '', loan_type: 'Home Loan', amount: '', date: new Date().toISOString().slice(0, 10), associate: 'Unassigned', status: 'Enquiry'
    })
  }

  return (
    <aside className={`sidebar${isOpen ? ' mobile-open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <img src={cosmosLogo} alt="Cosmos Finery" className="sidebar-logo" />
        <div className="sidebar-brand-text">
          <span className="brand-name">Cosmos Financial</span>
          <span className="brand-sub">Enterprise Finance</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        {/* MAIN MENU */}
        <p className="sidebar-menu-label">MAIN MENU</p>
        <ul>
          {mainMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  'sidebar-item' + (isActive ? ' active' : '')
                }
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* FINANCE OPERATIONS */}
        <p className="sidebar-menu-label" style={{ marginTop: 16 }}>FINANCE OPERATIONS</p>
        <ul>
          {financeOpsItems.map((item) => (
            <li key={item.path}>
              {item.isComingSoon ? (
                <button
                  type="button"
                  className="sidebar-item"
                  onClick={() => {
                    addToast(`${item.label} ledger operations coming soon!`, 'info')
                    onClose && onClose()
                  }}
                  style={{ opacity: 0.8 }}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    'sidebar-item' + (isActive ? ' active' : '')
                  }
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Admin section — only visible to admin role */}
        {user?.role === 'admin' && (
          <>
            <p className="sidebar-menu-label" style={{ marginTop: 16 }}>ADMIN</p>
            <ul>
              <li>
                <NavLink to="/admin/users" onClick={onClose} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
                  <span className="sidebar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <span>User Management</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/roles" onClick={onClose} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
                  <span className="sidebar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <span>Roles & Access</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/audit-log" onClick={onClose} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
                  <span className="sidebar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                  <span>Audit Log</span>
                </NavLink>
              </li>
            </ul>
          </>
        )}

        {/* SETTINGS / UTILITIES */}
        <p className="sidebar-menu-label" style={{ marginTop: 16 }}>SETTINGS</p>
        <ul>
          <li>
            <NavLink to="/backup" onClick={onClose} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                </svg>
              </span>
              <span>Backup Data</span>
            </NavLink>
          </li>
          {user?.role === 'admin' && (
            <li>
              <NavLink to="/admin/settings" onClick={onClose} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
                <span className="sidebar-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                <span>System Settings</span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Quick New Enquiry shortcut button */}
        <div style={{ padding: '0 16px', marginTop: 24, marginBottom: 16 }}>
          <button 
            type="button" 
            className="new-enquiry-shortcut-btn"
            onClick={() => setEnquiryModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Enquiry
          </button>
        </div>
      </nav>

      {/* User info footer */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.initials || user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="sidebar-user-info">
          <span className="user-name">{user?.name || 'Loading...'}</span>
          <span className="user-role">{user?.role || ''}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* New Enquiry Modal */}
      {enquiryModalOpen && (
        <Modal title="Create New Enquiry" onClose={() => setEnquiryModalOpen(false)} size="sm">
          <div className="form-grid">
            <label>
              Client Name *
              <input 
                type="text" 
                placeholder="Full Name"
                value={enquiryData.name} 
                onChange={(e) => setEnquiryData({ ...enquiryData, name: e.target.value })} 
              />
            </label>
            <label>
              Phone Number *
              <input 
                type="text" 
                placeholder="10-digit Mobile"
                value={enquiryData.phone} 
                onChange={(e) => setEnquiryData({ ...enquiryData, phone: e.target.value })} 
              />
            </label>
            <label>
              Loan Type
              <select 
                value={enquiryData.loan_type} 
                onChange={(e) => setEnquiryData({ ...enquiryData, loan_type: e.target.value })}
              >
                <option value="Home Loan">Home Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Gold Loan">Gold Loan</option>
                <option value="Mortgage">Mortgage</option>
              </select>
            </label>
            <label>
              Requested Loan Amount (₹)
              <input 
                type="number" 
                placeholder="e.g. 500000"
                value={enquiryData.amount} 
                onChange={(e) => setEnquiryData({ ...enquiryData, amount: e.target.value })} 
              />
            </label>
            <label>
              Creation Date
              <input 
                type="date" 
                value={enquiryData.date} 
                onChange={(e) => setEnquiryData({ ...enquiryData, date: e.target.value })} 
              />
            </label>
          </div>
          <div className="modal-actions" style={{ marginTop: 24 }}>
            <button type="button" className="admin-action-btn" onClick={() => setEnquiryModalOpen(false)}>Cancel</button>
            <button type="button" className="admin-primary-btn" onClick={handleSaveEnquiry}>Save Enquiry</button>
          </div>
        </Modal>
      )}
    </aside>
  )
}

export default Sidebar
