interface WeekSummaryBarProps {
  totalCompleted: number
  totalPossible:  number
  completionRate: number
  isCurrentWeek:  boolean
}

/** Bottom bar: "X / Y completions · Z% [████░░░░]" */
export function WeekSummaryBar({ totalCompleted, totalPossible, completionRate, isCurrentWeek }: WeekSummaryBarProps) {
  if (totalPossible === 0) {
    return (
      <div className="week-summary-bar">
        <span style={{ color: 'var(--text-muted)' }}>no habits tracked this week</span>
      </div>
    )
  }
  const BAR_WIDTH = 24
  const filled    = Math.round(completionRate / 100 * BAR_WIDTH)
  const bar       = '\u2588'.repeat(filled) + '\u2591'.repeat(BAR_WIDTH - filled)
  return (
    <div className="week-summary-bar">
      <span className="week-summary-label">{isCurrentWeek ? 'this week' : 'week total'}</span>
      <span className="week-summary-count">{totalCompleted} / {totalPossible} completions</span>
      <span className="week-summary-rate">· {completionRate.toFixed(1)}%</span>
      <span className="week-summary-ascii" aria-hidden="true">[{bar}]</span>
    </div>
  )
}
