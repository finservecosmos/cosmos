import './DonutChart.css'

const COLORS = ['#c0392b', '#e57373', '#ef9a9a', '#ffcdd2']

function DonutChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="donut-empty">No data available</div>
  }

  // Build SVG donut segments
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const r = 70
  const innerR = 44
  const circumference = 2 * Math.PI * r

  let cumulative = 0
  const segments = data.map((item, i) => {
    const fraction = item.percent / 100
    const dashArray = `${fraction * circumference} ${circumference}`
    const rotation = cumulative * 360 - 90
    cumulative += fraction
    return { ...item, dashArray, rotation, color: COLORS[i % COLORS.length] }
  })

  return (
    <div className="donut-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Loan type breakdown">
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={r - innerR} />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={r - innerR}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={0}
            transform={`rotate(${seg.rotation} ${cx} ${cy})`}
            strokeLinecap="butt"
          >
            <title>{`${seg.type}: ${seg.count} enquiries (${seg.percent}%)`}</title>
          </circle>
        ))}
      </svg>

      {/* Legend */}
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-dot" style={{ background: seg.color }} />
            <span className="donut-label">{seg.type}</span>
            <span className="donut-percent">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DonutChart
