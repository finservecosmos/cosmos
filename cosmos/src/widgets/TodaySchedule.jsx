import './TodaySchedule.css'

function TodaySchedule({ schedule, loading, onAdd }) {
  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="schedule-card">
      <div className="schedule-header">
        <h3 className="schedule-title">Today's Schedule</h3>
        <div className="schedule-nav">
          <button aria-label="Previous day">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="schedule-date">{dateLabel}</span>
          <button aria-label="Next day">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="schedule-loading">Loading...</p>
      ) : schedule.length === 0 ? (
        <p className="schedule-empty">No events scheduled for today.</p>
      ) : (
        <ul className="schedule-list">
          {schedule.map((event) => (
            <li key={event.id} className="schedule-item">
              <span className="schedule-time">{event.time}</span>
              <div className={`schedule-event${event.highlight ? ' highlight' : ''}`}>
                <p className="schedule-event-title">{event.title}</p>
                <p className="schedule-event-desc">{event.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="schedule-fab" aria-label="Add event" onClick={onAdd}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}

export default TodaySchedule
