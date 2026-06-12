import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { useAppState } from '../../context/AppStateContext'
import {
  getRecentActivities,
  getPendingFollowUps,
  getTodaySchedule,
} from '../../lib/api/dashboard'

import StatCard from '../../shared/ui/StatCard'
import DonutChart from '../../shared/ui/DonutChart'
import RecentActivities from '../../widgets/RecentActivities'
import PendingFollowUps from '../../widgets/PendingFollowUps'
import TodaySchedule from '../../widgets/TodaySchedule'
import DashboardLayout from '../../widgets/DashboardLayout'
import '../../shared/ui/DataPage.css'
import './Dashboard.css'

const DATE_RANGES = ['Today', 'This Week', 'This Month']

function Dashboard() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { enquiries, loginFiles, payments, loading: appLoading } = useAppState()

  const [activities, setActivities] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [schedule, setSchedule] = useState([])
  const [widgetsLoading, setWidgetsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('Today')

  useEffect(() => {
    document.title = 'Dashboard | Cosmos'
  }, [])

  useEffect(() => {
    const fetchWidgets = async () => {
      setWidgetsLoading(true)
      try {
        const [a, f, sc] = await Promise.all([
          getRecentActivities(),
          getPendingFollowUps(),
          getTodaySchedule(),
        ])
        setActivities(a)
        setFollowUps(f)
        setSchedule(sc)
      } catch (err) {
        console.error('Dashboard widget fetch error:', err)
      } finally {
        setWidgetsLoading(false)
      }
    }
    fetchWidgets()
  }, [])

  // Compute loan breakdown from context enquiries (same source as Enquiry Status page)
  const loanBreakdown = (() => {
    if (!enquiries.length) return []
    const counts = {}
    enquiries.forEach(({ loan_type }) => {
      if (loan_type) counts[loan_type] = (counts[loan_type] || 0) + 1
    })
    const total = enquiries.length
    return Object.entries(counts).map(([type, count]) => ({
      type, count, percent: Math.round((count / total) * 100),
    }))
  })()

  // Compute stats directly from AppStateContext (always in sync with DB)
  const newEnquiriesCount = enquiries.length
  const activeLoginFiles = loginFiles.filter(f => !f.done).length
  const totalCollections = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const formatAmount = (amount) => {
    if (!amount) return '₹0'
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const viewFollowUps = () => navigate('/dashboard/reminders')
  const addSchedule = () => navigate('/dashboard/reminders')
  const viewChartMenu = () => addToast('Chart options will be available in the next release.', 'info')

  return (
    <DashboardLayout>
      <div className="dashboard-page">

        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-page-title">Overview</h1>
            <p className="dashboard-page-subtitle">A quick look at today's lending and collection activity.</p>
          </div>
          <div className="dashboard-range-tabs">
            {DATE_RANGES.map((label) => (
              <button
                key={label}
                className={`range-tab${dateRange === label ? ' active' : ''}`}
                onClick={() => setDateRange(label)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="kpi-row">
          <StatCard
            title="New Enquiries"
            value={appLoading ? '—' : newEnquiriesCount}
            subLabel="Total enquiries"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            }
            onClick={() => navigate('/dashboard/enquiries')}
          />
          <StatCard
            title="Login Files"
            value={appLoading ? '—' : activeLoginFiles}
            subLabel="Active processing"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            }
            onClick={() => navigate('/dashboard/login-file')}
          />
          <StatCard
            title="Payment Status"
            value={appLoading ? '—' : formatAmount(totalCollections)}
            subLabel="Total collections"
            highlight
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            }
            onClick={() => navigate('/dashboard/payment-status')}
          />
        </div>

        <div className="dashboard-mid-row">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">New Loan Enquiries</h3>
                <p className="chart-subtitle">Real-time allocation across primary lending sectors</p>
              </div>
              <button className="chart-menu-btn" aria-label="More options" onClick={viewChartMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="19" r="1" fill="currentColor" />
                </svg>
              </button>
            </div>
            <DonutChart data={loanBreakdown} />
          </div>

          <RecentActivities activities={activities} loading={widgetsLoading} />
        </div>

        <div className="dashboard-bottom-row">
          <PendingFollowUps followUps={followUps} loading={widgetsLoading} onViewAll={viewFollowUps} />
          <TodaySchedule schedule={schedule} loading={widgetsLoading} onAdd={addSchedule} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
