import './RecentActivities.css'

const typeConfig = {
  approval: { color: '#c0392b', bg: '#fde8e8' },
  file: { color: '#555', bg: '#f0f0f0' },
  payment: { color: '#c0392b', bg: '#fde8e8' },
  query: { color: '#d97706', bg: '#fef3c7' },
  default: { color: '#888', bg: '#f5f5f5' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} mins ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hours ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ActivityIcon({ type }) {
  const cfg = typeConfig[type] || typeConfig.default
  return (
    <div className="activity-icon" style={{ background: cfg.bg, color: cfg.color }}>
      {type === 'approval' && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {type === 'file' && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )}
      {type === 'payment' && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )}
      {type === 'query' && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
    </div>
  )
}

function RecentActivities({ activities, loading }) {
  return (
    <div className="activities-card">
      <h3 className="activities-title">Recent Activities</h3>
      {loading ? (
        <p className="activities-loading">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="activities-empty">No recent activities.</p>
      ) : (
        <ul className="activities-list">
          {activities.map((a) => (
            <li key={a.id} className="activity-item">
              <ActivityIcon type={a.type} />
              <div className="activity-body">
                <p className="activity-title">{a.title}</p>
                <p className="activity-desc">{a.description}</p>
                <span className="activity-time">{timeAgo(a.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RecentActivities
