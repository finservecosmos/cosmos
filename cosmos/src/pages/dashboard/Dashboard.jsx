import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import {
  getDashboardStats,
  getLoanEnquiryBreakdown,
  getRecentActivities,
  getPendingFollowUps,
  getTodaySchedule,
} from '../../lib/api/dashboard'
import {
  dummyStats,
  dummyLoanBreakdown,
  dummyActivities,
  dummyFollowUps,
  dummySchedule,
} from '../../lib/dummyData'
import StatCard from '../../shared/ui/StatCard'
import DonutChart from '../../shared/ui/DonutChart'
import RecentActivities from '../../widgets/RecentActivities'
import PendingFollowUps from '../../widgets/PendingFollowUps'
import TodaySchedule from '../../widgets/TodaySchedule'
import DashboardLayout from '../../widgets/DashboardLayout'
import './Dashboard.css'

const isDev = !!import.meta.env.VITE_DEV_EMAIL
const DATE_RANGES = ['Today', 'This Week', 'This Month']

function Dashboard() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [stats, setStats] = useState(null)
  const [loanBreakdown, setLoanBreakdown] = useState([])
  const [activities, setActivities] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('Today')

  useEffect(() => {
    document.title = 'Dashboard | Cosmos'
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      if (isDev) {
        setStats(dummyStats)
        setLoanBreakdown(dummyLoanBreakdown)
        setActivities(dummyActivities)
        setFollowUps(dummyFollowUps)
        setSchedule(dummySchedule)
        setLoading(false)
        return
      }
      const [s, lb, a, f, sc] = await Promise.all([
        getDashboardStats(),
        getLoanEnquiryBreakdown(),
        getRecentActivities(),
        getPendingFollowUps(),
        getTodaySchedule(),
      ])
      setStats(s)
      setLoanBreakdown(lb)
      setActivities(a)
      setFollowUps(f)
      setSchedule(sc)
      setLoading(false)
    }

    fetchAll()
  }, [])

  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

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
            <p className="dashboard-page-subtitle">A quick look at today’s lending and collection activity.</p>
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
            value={loading ? '—' : stats?.newEnquiries ?? 0}
            trend={loading ? undefined : getTrend(stats?.newEnquiries, stats?.newEnquiriesLastPeriod)}
            subLabel="vs last period"
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
            value={loading ? '—' : stats?.loginFiles ?? 0}
            trend={loading ? undefined : getTrend(stats?.loginFiles, stats?.loginFilesLastPeriod)}
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
            value={loading ? '—' : formatAmount(stats?.totalCollections)}
            trend={loading ? undefined : getTrend(stats?.totalCollections, stats?.totalCollectionsLastPeriod)}
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

          <RecentActivities activities={activities} loading={loading} />
        </div>

        <div className="dashboard-bottom-row">
          <PendingFollowUps followUps={followUps} loading={loading} onViewAll={viewFollowUps} />
          <TodaySchedule schedule={schedule} loading={loading} onAdd={addSchedule} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
