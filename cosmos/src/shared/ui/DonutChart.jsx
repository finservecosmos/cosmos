import { useState } from 'react'
import './DonutChart.css'

const COLORS = ['#c0392b', '#e67e22', '#f1c40f', '#3498db']

function DonutChart({ data, formatter, centerLabel, tooltipLabel, hideLegend }) {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  if (!data || data.length === 0) {
    return <div className="donut-empty">No data available</div>
  }

  // Build SVG donut segments
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const r = 70
  const innerR = 44
  const strokeW = r - innerR
  const circumference = 2 * Math.PI * r

  let cumulative = 0
  const segments = data.map((item, i) => {
    const fraction = item.percent / 100
    const dashArray = `${fraction * circumference} ${circumference}`
    const rotation = cumulative * 360 - 90
    cumulative += fraction
    const color = item.color || COLORS[i % COLORS.length]
    return { ...item, index: i, dashArray, rotation, color }
  })

  const handleSegmentInteraction = (seg, e) => {
    setHoveredSegment(seg)
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    setTooltipPos({
      x: clientX - rect.left + 15,
      y: clientY - rect.top + 15
    })
  }

  const handleMouseLeave = () => {
    setHoveredSegment(null)
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  const formatVal = formatter || ((val) => val)
  const tLabel = tooltipLabel !== undefined ? tooltipLabel : 'enquiries'
  const cLabel = centerLabel || 'Total'

  return (
    <div className="donut-container">
      <div className="donut-wrapper">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          aria-label="Loan type breakdown"
          className={`donut-svg${hoveredSegment ? ' has-hover' : ''}`}
        >
          {/* Background circle */}
          <circle 
            cx={cx} 
            cy={cy} 
            r={r} 
            fill="none" 
            stroke="var(--bg-muted)" 
            strokeWidth={strokeW} 
          />
          {segments.map((seg, i) => {
            const isHovered = hoveredSegment && hoveredSegment.index === seg.index
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeW + 4 : strokeW}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={0}
                transform={`rotate(${seg.rotation} ${cx} ${cy})`}
                strokeLinecap="butt"
                className={`donut-segment${isHovered ? ' active' : ''}`}
                style={{
                  transition: 'stroke-width 0.2s, filter 0.2s, opacity 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => handleSegmentInteraction(seg, e)}
                onMouseMove={(e) => handleSegmentInteraction(seg, e)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={(e) => {
                  handleSegmentInteraction(seg, e)
                }}
                onTouchMove={(e) => {
                  handleSegmentInteraction(seg, e)
                }}
                onTouchEnd={handleMouseLeave}
              />
            )
          })}

          {/* Center label */}
          <g className="donut-center-text">
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              className="donut-center-val"
            >
              {formatVal(hoveredSegment ? hoveredSegment.count : totalCount)}
            </text>
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              className="donut-center-lbl"
            >
              {hoveredSegment ? hoveredSegment.type : cLabel}
            </text>
          </g>
        </svg>

        {hoveredSegment && (
          <div 
            className="donut-tooltip" 
            style={{ 
              left: `${tooltipPos.x}px`, 
              top: `${tooltipPos.y}px` 
            }}
          >
            <div className="donut-tooltip-header">
              <span className="donut-tooltip-dot" style={{ background: hoveredSegment.color }} />
              <span className="donut-tooltip-type">{hoveredSegment.type}</span>
            </div>
            <div className="donut-tooltip-body">
              <span className="donut-tooltip-count">{formatVal(hoveredSegment.count)} {tLabel}</span>
              <span className="donut-tooltip-pct">{hoveredSegment.percent}%</span>
            </div>
          </div>
        )}

        {/* Legend */}
        {!hideLegend && (
          <div className="donut-legend">
            {segments.map((seg, i) => (
              <div 
                key={i} 
                className={`donut-legend-item${hoveredSegment && hoveredSegment.index === seg.index ? ' active' : ''}`}
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={handleMouseLeave}
              >
                <span className="donut-dot" style={{ background: seg.color }} />
                <span className="donut-label">{seg.type}</span>
                <span className="donut-percent">{seg.percent}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DonutChart

