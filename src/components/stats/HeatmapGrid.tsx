import type { HeatmapWeek } from '@/types'
import { format, parseISO } from 'date-fns'

interface HeatmapGridProps {
  weeks: HeatmapWeek[]
  today: string
}

const levelColors = [
  'var(--text-muted)', // 0
  '#3a5a3a',           // 1
  '#4d7a4d',           // 2
  '#6aaa6a',           // 3
  '#8ecc8e',           // 4
]

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const HEATMAP_LEGEND = ['·', '░', '▒', '▓', '█']

/**
 * 52-week ASCII heatmap grid, GitHub-style, terminal-aesthetic.
 * Renders HeatmapWeek[] from useStatsData.
 * Rows: days of week (Mon→Sun), Columns: weeks (oldest→newest).
 */
export function HeatmapGrid({ weeks, today: _today }: HeatmapGridProps) {
  // Build month labels — show label when month changes from previous week
  const monthLabels: { weekIndex: number; label: string }[] = []
  let prevMonth = ''

  for (const week of weeks) {
    if (week.cells.length === 0) continue
    const firstCellDate = parseISO(week.cells[0].date)
    const month = format(firstCellDate, 'MMM')
    if (month !== prevMonth) {
      monthLabels.push({ weekIndex: week.weekIndex, label: month })
      prevMonth = month
    }
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">– activity (52 weeks)</div>

      {/* Month labels row */}
      <div className="heatmap-months" aria-hidden="true">
        <div className="heatmap-months__spacer" />
        <div className="heatmap-months__labels">
          {monthLabels.map(({ weekIndex, label }) => (
            <span
              key={weekIndex}
              className="heatmap-months__label"
              style={{ gridColumn: weekIndex + 1 }}
            >
              {label.toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Day-of-week labels + grid */}
      <div className="heatmap-body">
        {/* Row labels column */}
        <div className="heatmap-row-labels" aria-hidden="true">
          {DAY_LABELS.map((label) => (
            <span key={label} className="heatmap-row-label">
              {label}
            </span>
          ))}
        </div>

        {/* 52-week grid: each week is a column, each day is a row within the column */}
        <div className="heatmap-grid" role="img" aria-label="52-week activity heatmap">
          {weeks.map((week) => (
            <div key={week.weekIndex} className="heatmap-week" style={{ gridColumn: week.weekIndex + 1 }}>
              {week.cells.map((cell) => (
                <span
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} completion${cell.count !== 1 ? 's' : ''}`}
                  style={{ color: levelColors[cell.level] }}
                  className={[
                    'heatmap-cell',
                    cell.isToday ? 'heatmap-cell--today' : '',
                  ].join(' ')}
                >
                  {cell.char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span>less </span>
        {HEATMAP_LEGEND.map((char, i) => (
          <span key={i} style={{ color: levelColors[i] }}>
            {char}
          </span>
        ))}
        <span> more</span>
      </div>
    </div>
  )
}
