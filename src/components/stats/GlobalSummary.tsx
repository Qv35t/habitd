import type { GlobalSummaryData, StatsPeriod } from '@/types'

interface GlobalSummaryProps {
  data: GlobalSummaryData
  period: StatsPeriod
}

const periodLabel: Record<StatsPeriod, string> = {
  '7d': 'last 7d',
  '30d': 'last 30d',
  '90d': 'last 90d',
  'all': 'all time',
}

/**
 * Three summary metric cards at the top of StatsView.
 * tracked days | overall rate | best streak
 */
export function GlobalSummary({ data, period }: GlobalSummaryProps) {
  const noData = data.totalDaysTracked === 0

  return (
    <div className="global-summary">
      {/* Card 1: Tracked */}
      <div className="global-summary__card">
        <div className="global-summary__label">tracked</div>
        <div className="global-summary__value">
          {noData ? '–' : `${data.totalDaysTracked} days`}
        </div>
        <div className="global-summary__sub">
          {noData ? 'no data' : 'since tracking started'}
        </div>
      </div>

      {/* Card 2: Overall rate */}
      <div className="global-summary__card">
        <div className="global-summary__label">overall rate</div>
        <div className="global-summary__value">
          {noData ? '–' : `${data.overallCompletionRate.toFixed(1)}%`}
        </div>
        <div className="global-summary__sub">{periodLabel[period]}</div>
      </div>

      {/* Card 3: Best streak */}
      <div className="global-summary__card">
        <div className="global-summary__label">best streak</div>
        <div className="global-summary__value">
          {noData ? '–' : `${data.bestCurrentStreak} days`}
        </div>
        <div className="global-summary__sub">
          {noData ? 'no data' : data.bestCurrentStreakHabitName ?? '–'}
        </div>
      </div>
    </div>
  )
}
