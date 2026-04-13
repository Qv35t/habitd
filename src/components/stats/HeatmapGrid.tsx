import type { HeatmapWeek } from '@/types'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'

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

/**
 * 52-week ASCII heatmap grid, GitHub-style, terminal-aesthetic.
 */
export function HeatmapGrid({ weeks, today }: HeatmapGridProps) {
  const { t } = useTranslation()

  // Build month labels — show label when month changes from previous week
  // Skip December labels that belong to the previous year (padding weeks before Jan 1)
  const monthLabels: { weekIndex: number; label: string }[] = []
  let prevMonth = ''

  for (const week of weeks) {
    if (week.cells.length === 0) continue
    const firstCellDate = parseISO(week.cells[0].date)
    const month = format(firstCellDate, 'MMM')
    // Skip December from previous year (padding weeks)
    const isFirstWeekDec = week.weekIndex === 0 && month.toLowerCase() === 'dec'
    if (isFirstWeekDec) {
      prevMonth = 'dec' // mark dec as seen so jan will be picked up
      continue
    }
    if (month !== prevMonth) {
      monthLabels.push({ weekIndex: week.weekIndex, label: month })
      prevMonth = month
    }
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        {t('stats.activity')} {new Date(today).getFullYear()}
      </div>

      {/* Month labels row */}
      <div className="heatmap-months" aria-hidden="true">
        <div className="heatmap-months__spacer" />
        <div
          className="heatmap-months__labels"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
        >
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
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((label) => (
            <span key={label} className="heatmap-row-label">
              {label}
            </span>
          ))}
        </div>

        {/* 52-week grid */}
        <div
          className="heatmap-grid"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
          role="img"
          aria-label="Calendar year activity heatmap"
        >
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
        <span>{t('stats.less')} </span>
        {['·', '░', '▒', '▓', '█'].map((char, i) => (
          <span key={i} style={{ color: levelColors[i] }}>
            {char}
          </span>
        ))}
        <span> {t('stats.more')}</span>
      </div>
    </div>
  )
}
