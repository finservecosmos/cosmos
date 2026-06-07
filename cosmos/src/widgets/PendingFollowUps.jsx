import './PendingFollowUps.css'

const priorityConfig = {
  high: { label: 'HIGH PRIORITY', color: 'var(--accent)', bg: 'var(--bg-hover)' },
  medium: { label: 'MEDIUM', color: '#f59e0b', bg: 'var(--bg-hover)' },
  low: { label: 'LOW', color: '#10b981', bg: 'var(--bg-hover)' },
}

function PendingFollowUps({ followUps, loading, onViewAll }) {
  return (
    <div className="followups-card">
      <div className="followups-header">
        <h3 className="followups-title">Pending Follow-Ups</h3>
        {followUps.length > 0 && (
          <span className="followups-badge">{followUps.length} Active</span>
        )}
      </div>

      {loading ? (
        <p className="followups-loading">Loading...</p>
      ) : followUps.length === 0 ? (
        <p className="followups-empty">No pending follow-ups.</p>
      ) : (
        <>
          <ul className="followups-list">
            {followUps.map((f) => {
              const cfg = priorityConfig[f.priority] || priorityConfig.low
              return (
                <li key={f.id} className="followup-item">
                  <div className="followup-avatar">
                    {f.client_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="followup-info">
                    <p className="followup-name">{f.client_name} ({f.loan_type})</p>
                    <p className="followup-contact">Last contact: {f.last_contact}</p>
                  </div>
                  <span
                    className="followup-priority"
                    style={{ color: cfg.color, background: cfg.bg }}
                  >
                    {cfg.label}
                  </span>
                  <button className="followup-action" aria-label="Contact">
                    {f.contact_method === 'email' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <polyline points="3,5 12,13 21,5" />
                      </svg>
                    ) : f.contact_method === 'message' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.5 2 2 0 0 1 3.6 2.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
                      </svg>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <button type="button" className="followups-view-all" onClick={onViewAll}>View All Follow-Ups</button>
        </>
      )}
    </div>
  )
}

export default PendingFollowUps
