import './StatCard.css'

function StatCard({ title, value, trend, subLabel, icon, highlight, onClick }) {
  const isPositive = trend >= 0
  const clickable = typeof onClick === 'function'

  return (
    <div
      className={`stat-card${highlight ? ' stat-card--highlight' : ''}${clickable ? ' stat-card--clickable' : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-footer">
        {trend !== undefined && (
          <span className={`stat-trend ${isPositive ? 'up' : 'down'}`}>
            {isPositive ? '↑' : '↓'}{Math.abs(trend)}%
          </span>
        )}
        <span className="stat-sub">{subLabel}</span>
      </div>
    </div>
  )
}

export default StatCard
