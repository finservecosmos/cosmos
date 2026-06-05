import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import useAutoLogout from '../hooks/useAutoLogout'
import './DashboardLayout.css'

function DashboardLayout({ children }) {
  useAutoLogout() // Auto-logout user after 30 mins of inactivity
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dashboard-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="dashboard-main">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="dashboard-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
