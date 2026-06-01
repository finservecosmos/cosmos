import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './DashboardLayout.css'

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
