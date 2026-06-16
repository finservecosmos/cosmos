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
