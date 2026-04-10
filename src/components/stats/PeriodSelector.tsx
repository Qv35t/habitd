import type { StatsPeriod } from '@/types'

interface PeriodSelectorProps {
  value: StatsPeriod
  onChange: (p: StatsPeriod) => void
}

const PERIODS: StatsPeriod[] = ['7d', '30d', '90d', 'all']

/**
 * Segmented period filter: 7d / 30d / 90d / all.
 * 'all' button shows tooltip explaining rate calculation basis.
 */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="segmented-control">
      {PERIODS.map((p) => (
        <button
          key={p}
          className={`segmented-control__btn ${value === p ? 'segmented-control__btn--active' : ''}`}
          onClick={() => onChange(p)}
          title={
            p === 'all'
              ? "completion rate calculated from your earliest habit's start date"
              : undefined
          }
        >
          {p}
        </button>
      ))}
    </div>
  )
}
