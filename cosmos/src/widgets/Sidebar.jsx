import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../shared/api/supabaseClient'
import { useUser } from '../context/UserContext'
import { useAppState } from '../context/AppStateContext'
import { useToast } from '../context/ToastContext'
import Modal from '../shared/ui/Modal'
import cosmosLogo from '../assets/cosmosLogo.jpg'
import './Sidebar.css'

const mainMenuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="16" y1="2" x2="16" y2="4" />
        <line x1="8" y1="2" x2="8" y2="4" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
]

const financeOpsItems = [
  {
    label: 'Overview',
    path: '/finance/overview',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: 'Investment',
    path: '/finance/investment',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    label: 'Income & Expenses',
    path: '/finance/income-expenses',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Finance Invoice',
    path: '/finance/invoice',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="16" y1="2" x2="16" y2="4" />
        <line x1="8" y1="2" x2="8" y2="4" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
]

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user } = useUser()
  const { addToast } = useToast()

  const handleLogout = async () => {
    sessionStorage.removeItem('dev_auth')
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Supabase signout failed, logging out locally:', err)
    }
    navigate('/')
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>


    </aside>
  )
}

export default Sidebar
