import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import { useAppState } from '../context/AppStateContext'
import './Topbar.css'



const tabs = [
  { label: 'Overview',           path: '/dashboard',                 end: true },
  { label: 'New Enquiry Status', path: '/dashboard/enquiries',       end: false },
  { label: 'Login File',         path: '/dashboard/login-file',      end: false },
  { label: 'Payment Status',     path: '/dashboard/payment-status',  end: false },
  { label: 'Reminders',          path: '/dashboard/reminders',       end: false },
]

const PAGE_HEADERS = {
  '/finance/overview': {
    title: 'Finance Overview Dashboard',
    description: 'Monitor investments, bank balances, and financial performance.'
  },
  '/finance/entry': {
    title: 'Finance Entry',
    description: 'Manage investment entries, due dates, interest calculations, and investor records.'
  },
  '/finance/investment': {
    title: 'Investment Management',
    description: 'Manage partner investments, nominee details, maturity dates, and investment records.'
  },
  '/finance/income-expenses': {
    title: 'Income & Expenses',
    description: 'Track, manage, and analyze all company income and expense transactions.'
  },
  '/clients': {
    title: 'Client Record Book',
    description: 'Manage clients, KYC profiles, document verification, and statuses.'
  },
  '/associates': {
    title: 'Associates Book',
    description: 'Track business associates, assignments, and performances.'
  },
  '/payments/invoice': {
    title: 'Invoice Builder',
    description: 'Generate custom invoices and manage financial billing.'
  },
  '/backup': {
    title: 'Backup Data',
    description: 'Export data logs, configure manual checkpoints, and restore system state.'
  },
  '/profile': {
    title: 'Profile Settings',
    description: 'Configure personal settings, upload security verification files, and manage security.'
  },
  '/notifications': {
    title: 'Notifications Central',
    description: 'View all recent audit logs, warnings, and compliance alerts.'
  },
  '/admin/users': {
    title: 'User Management',
    description: 'Add, update, or remove personnel and staff accounts.'
  },
  '/admin/roles': {
    title: 'Roles & Access Control',
    description: 'Define system privilege mappings and role permissions.'
  },
  '/admin/audit-log': {
    title: 'System Audit Log',
    description: 'Monitor security-sensitive changes and login histories.'
  },
  '/admin/settings': {
    title: 'System Settings',
    description: 'Manage auto-logout policies, biometric features, and global parameters.'
  }
}

function Topbar({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  
  const showTabs = location.pathname.startsWith('/dashboard')
  const pageHeader = PAGE_HEADERS[location.pathname] || {
    title: 'Cosmos Finserve',
    description: 'Enterprise Finance Operations Platform'
  }

  // ── Notifications & Global Search Data ───────────────────
  const { 
    notifications, clients, payments, enquiries, invoices, associates,
    financeEntries, investments, transactions, financeInvoices 
  } = useAppState()

  // ── Search ──────────────────────────────────────────────
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const searchRef = useRef(null)

  const searchIndex = useMemo(() => {
    const list = []
    
    // Add Clients
    if (clients) {
      clients.forEach(c => {
        if (c.loan_type !== 'Finance Entry') {
          list.push({
            id: `client-${c.id}`,
            label: c.name || 'Unknown Client',
            sub: `${c.loan_type || 'Loan'} — ${c.status || 'Enquiry'}`,
            category: 'Clients',
            path: '/clients'
          })
        }
      })
    }

    // Add Payments
    if (payments) {
      payments.forEach(p => {
        list.push({
          id: `payment-${p.id}`,
          label: p.client || 'Unknown Payer',
          sub: `${p.type || 'Payment'} — ₹${(p.amount || 0).toLocaleString('en-IN')}`,
          category: 'Payments',
          path: '/payments'
        })
      })
    }

    // Add Enquiries
    if (enquiries) {
      enquiries.forEach(e => {
        list.push({
          id: `enquiry-${e.id}`,
          label: e.client_name || 'New Lead',
          sub: `${e.loan_type || 'Loan'} — ₹${Number(e.loan_amount || 0).toLocaleString('en-IN')}`,
          category: 'Enquiries',
          path: '/dashboard/enquiries'
        })
      })
    }

    // Add Invoices
    if (invoices) {
      invoices.forEach(inv => {
        list.push({
          id: `invoice-${inv.id}`,
          label: inv.client || 'Unknown Client',
          sub: `${inv.service || 'Service'} — ₹${(inv.amount || 0).toLocaleString('en-IN')}`,
          category: 'Invoices',
          path: '/payments/invoice'
        })
      })
    }

    // Add Associates
    if (associates) {
      associates.forEach(a => {
        list.push({
          id: `associate-${a.id}`,
          label: a.name || 'Unknown Associate',
          sub: `${a.expertise || 'Associate'} — ${a.phone || ''}`,
          category: 'Associates',
          path: '/associates'
        })
      })
    }

    // Add Finance Entries (Lending Ledger)
    if (financeEntries) {
      financeEntries.forEach(fe => {
        list.push({
          id: `finance-entry-${fe.id}`,
          label: fe.client_name || 'Unknown Client',
          sub: `Finance Entry — ₹${(fe.loan_amount || 0).toLocaleString('en-IN')} (${fe.status || 'Active'})`,
          category: 'Finance Entries',
          path: '/finance/entry'
        })
      })
    }

    // Add Partner Investments
    if (investments) {
      investments.forEach(inv => {
        list.push({
          id: `investment-${inv.id}`,
          label: inv.partner || 'Unknown Investor',
          sub: `Investment — ₹${(inv.amount || 0).toLocaleString('en-IN')} (${inv.status || 'Active'})`,
          category: 'Investments',
          path: '/finance/investment'
        })
      })
    }

    // Add Income/Expense Transactions
    if (transactions) {
      transactions.forEach(tx => {
        list.push({
          id: `transaction-${tx.id}`,
          label: tx.name || 'Unknown Transaction',
          sub: `${tx.type || 'Transaction'} — ₹${(tx.amount || 0).toLocaleString('en-IN')} (${tx.category || ''})`,
          category: 'Transactions',
          path: '/finance/income-expenses'
        })
      })
    }

    // Add Finance Invoices
    if (financeInvoices) {
      financeInvoices.forEach(fi => {
        list.push({
          id: `finance-invoice-${fi.id}`,
          label: fi.name || 'Unknown Entity',
          sub: `Finance Invoice (${fi.type}) — ₹${(fi.amount || 0).toLocaleString('en-IN')}`,
          category: 'Finance Invoices',
          path: '/finance/invoice'
        })
      })
    }

    return list
  }, [clients, payments, enquiries, invoices, associates, financeEntries, investments, transactions, financeInvoices])

  const results = query.trim().length > 1
    ? searchIndex.filter(
        (item) =>
          String(item.label || '').toLowerCase().includes(query.toLowerCase()) ||
          String(item.sub || '').toLowerCase().includes(query.toLowerCase()) ||
          String(item.category || '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  // Group results by category
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const flatResults = Object.values(grouped).flat()

  const handleSearchKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      navigate(flatResults[activeIdx].path)
      setQuery('')
      setSearchOpen(false)
    } else if (e.key === 'Escape') {
      setQuery('')
      setSearchOpen(false)
    }
  }

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Notifications ────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 0

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // ── Profile dropdown ─────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="topbar">
      <button 
        className="hamburger-btn" 
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Tabs / Page Headers */}
      {showTabs ? (
        <nav className="topbar-tabs" aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) => 'topbar-tab' + (isActive ? ' active' : '')}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      ) : (
        <div className="topbar-header-left">
          <h1 className="topbar-title">{pageHeader.title}</h1>
          <p className="topbar-desc">{pageHeader.description}</p>
        </div>
      )}

      {/* Right actions */}
      <div className="topbar-actions">

        {/* ── Search ── */}
        <div className="topbar-search-wrap" ref={searchRef}>
          <div className="topbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search records..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); setActiveIdx(-1) }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKey}
              aria-label="Search records"
              aria-autocomplete="list"
              aria-expanded={searchOpen && results.length > 0}
            />
            {query && (
              <button className="search-clear" onClick={() => { setQuery(''); setSearchOpen(false) }} aria-label="Clear search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {searchOpen && results.length > 0 && (
            <div className="search-dropdown" role="listbox">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="search-group">
                  <p className="search-group-label">{category}</p>
                  {items.map((item) => {
                    const idx = flatResults.indexOf(item)
                    return (
                      <button
                        key={item.id}
                        className={`search-result${idx === activeIdx ? ' active' : ''}`}
                        role="option"
                        aria-selected={idx === activeIdx}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => { navigate(item.path); setQuery(''); setSearchOpen(false) }}
                      >
                        <span className="search-result-label">{item.label}</span>
                        <span className="search-result-sub">{item.sub}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
              <div className="search-footer">
                <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
              </div>
            </div>
          )}

          {searchOpen && query.trim().length > 1 && results.length === 0 && (
            <div className="search-dropdown search-empty">
              <p>No results for "<strong>{query}</strong>"</p>
            </div>
          )}
        </div>

        {/* ── Notifications ── */}
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            onClick={() => setNotifOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                {unreadCount > 0 && <span className="notif-unread-count">{unreadCount} new</span>}
              </div>
              <ul className="notif-list">
                {notifications && notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className={`notif-item${n.read ? '' : ' unread'}`}>
                    <div className={`notif-dot-icon notif-type-${n.type}`} aria-hidden="true" />
                    <div className="notif-body">
                      <p className="notif-item-title">{n.title}</p>
                      <p className="notif-item-desc">{n.description}</p>
                      <span className="notif-item-time">{timeAgo(n.time)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="notif-view-all"
                onClick={() => { navigate('/notifications'); setNotifOpen(false) }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* ── Theme toggle ── */}
        <button className="topbar-icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        {/* ── Profile ── */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            className="topbar-avatar-btn"
            aria-label="Profile menu"
            onClick={() => setProfileOpen((o) => !o)}
          >
            <span className="topbar-avatar">{user?.initials || 'U'}</span>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-preview">
                <div className="profile-preview-avatar">{user?.initials || 'U'}</div>
                <div className="profile-preview-info">
                  <p className="profile-preview-name">{user?.name || 'User'}</p>
                  <p className="profile-preview-role">{user?.role || 'staff'}</p>
                  <p className="profile-preview-email">{user?.email || ''}</p>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <button className="profile-dropdown-item" onClick={() => { navigate('/profile'); setProfileOpen(false) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                View Profile
              </button>
              {user?.role === 'admin' && (
                <button className="profile-dropdown-item" onClick={() => { navigate('/admin/settings'); setProfileOpen(false) }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Admin Settings
                </button>
              )}
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item danger"
                onClick={async () => {
                  const { supabase } = await import('../shared/api/supabaseClient')
                  sessionStorage.removeItem('dev_auth')
                  await supabase.auth.signOut()
                  navigate('/')
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Topbar
