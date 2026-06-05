import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useUser } from '../../context/UserContext'
import cosmosLogo from '../../assets/cosmosLogo.jpeg'
import './Sidebar.css'

const menuItems = [
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
        <polyline points="10 9 9 9 8 9" />
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
    label: 'Payments',
    path: '/payments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    children: [
      { label: 'Invoice', path: '/payments/invoice' },
      { label: 'Product & Service Book', path: '/payments/products' },
    ],
  },
  {
    label: 'Backup Data',
    path: '/backup',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
    ),
  },
]

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user } = useUser()
  const [paymentsOpen, setPaymentsOpen] = useState(false)

  const handleLogout = async () => {
    sessionStorage.removeItem('dev_auth') // clear dev session
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <aside className={`sidebar${isOpen ? ' mobile-open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <img src={cosmosLogo} alt="Cosmos Finery" className="sidebar-logo" />
        <div className="sidebar-brand-text">
          <span className="brand-name">Cosmos Finserve</span>
          <span className="brand-sub">Enterprise Finance</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
      {/* User menu */}
        <p className="sidebar-menu-label">MENU</p>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.children ? (
                <>
                  <button
                    className={`sidebar-item sidebar-item-btn${paymentsOpen ? ' open' : ''}`}
                    onClick={() => setPaymentsOpen((o) => !o)}
                    aria-expanded={paymentsOpen}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {paymentsOpen && (
                    <ul className="sidebar-submenu">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink
                            to={child.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                              'sidebar-subitem' + (isActive ? ' active' : '')
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
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
            </ul>
          </>
        )}
      </nav>

      {/* User */}
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
    </aside>
  )
}

export default Sidebar
