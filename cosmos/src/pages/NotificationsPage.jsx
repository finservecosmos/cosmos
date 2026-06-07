import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../widgets/DashboardLayout'
import { useAppState } from '../context/AppStateContext'
import './NotificationsPage.css'

const tabs = ['All', 'Unread', 'Payments', 'Enquiries', 'System']

const typeColors = {
  payment: { dot: '#16a34a', bg: '#dcfce7', label: 'Payment' },
  enquiry: { dot: '#c0392b', bg: '#fde8e8', label: 'Enquiry' },
  system:  { dot: '#6366f1', bg: '#ede9fe', label: 'System'  },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hours ago`
  return `${Math.floor(hrs / 24)} days ago`
}

function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markNotifRead, markAllNotifsRead } = useAppState()
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    document.title = 'Notifications | Cosmos'
  }, [])

  const filtered = useMemo(() => notifications.filter((n) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Unread') return !n.read
    return n.type === activeTab.toLowerCase()
  }), [activeTab, notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getTargetPath = (notification) => {
    if (notification.type === 'payment') return '/payments'
    if (notification.type === 'enquiry') return '/dashboard/enquiries'
    return '/dashboard'
  }

  return (
    <DashboardLayout>
      <div className="notif-page">
        <div className="notif-page-header">
          <div>
            <h2 className="notif-page-title">Notifications</h2>
            {unreadCount > 0 && (
              <span className="notif-page-count">{unreadCount} unread</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllNotifsRead}>Mark all as read</button>
          )}
        </div>

        <div className="notif-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`notif-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="notif-tab-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="notif-page-list">
          {filtered.length === 0 ? (
            <div className="notif-page-empty">
              <p>No notifications in this category.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const cfg = typeColors[n.type] || typeColors.system
              return (
                <div
                  key={n.id}
                  className={`notif-page-item${n.read ? '' : ' unread'}`}
                  onClick={() => {
                    markNotifRead(n.id)
                    navigate(getTargetPath(n))
                  }}
                >
                  <div className="notif-page-dot" style={{ background: cfg.dot }} />
                  <div className="notif-page-body">
                    <div className="notif-page-top">
                      <p className="notif-page-item-title">{n.title}</p>
                      <span className="notif-page-type-badge" style={{ color: cfg.dot, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="notif-page-item-desc">{n.description}</p>
                    <span className="notif-page-item-time">{timeAgo(n.time)}</span>
                  </div>
                  {!n.read && <div className="notif-unread-dot" aria-label="Unread" />}
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default NotificationsPage
