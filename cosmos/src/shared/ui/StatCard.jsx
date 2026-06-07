function StatCard({ title, value, trend, subLabel, icon, highlight, onClick }) {
  const isPositive = trend >= 0
  const clickable = typeof onClick === 'function'

  let tagClass = 'muted';
  let tagText = subLabel;
  
  if (trend !== undefined) {
    tagClass = isPositive ? 'trend-up' : 'critical';
    tagText = `${isPositive ? '↗ +' : '↘ '}${Math.abs(trend)}% ${subLabel || ''}`.trim();
  } else if (highlight) {
    tagClass = 'trend-up';
  }

  return (
    <div
      className={`kpi-card`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      style={{ 
        cursor: clickable ? 'pointer' : 'default', 
        ...(highlight ? { borderColor: 'var(--accent)', boxShadow: 'var(--shadow-md)' } : {}) 
      }}
    >
      <div className="kpi-header">
        <div className="kpi-icon-wrap" style={highlight ? { color: 'var(--accent)' } : {}}>
          {icon}
        </div>
        {tagText && (
          <span className={`kpi-tag ${tagClass}`}>
            {tagText}
          </span>
        )}
      </div>
      <div className="kpi-body">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  )
}

export default StatCard
