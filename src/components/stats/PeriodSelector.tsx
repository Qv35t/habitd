import type { StatsPeriod } from '@/types'
import { useTranslation } from 'react-i18next'

interface PeriodSelectorProps {
  value: StatsPeriod
  onChange: (p: StatsPeriod) => void
}

/**
 * Segmented period filter: 7d / 30d / 90d / all.
 */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { t } = useTranslation()

  const periods: { value: StatsPeriod; label: string }[] = [
    { value: '7d', label: t('stats.period.7d') },
    { value: '30d', label: t('stats.period.30d') },
    { value: '90d', label: t('stats.period.90d') },
    { value: 'all', label: t('stats.period.all') },
  ]

  return (
    <div className="segmented-control">
      {periods.map(({ value: p, label }) => (
        <button
          key={p}
          className={`segmented-control__btn ${value === p ? 'segmented-control__btn--active' : ''}`}
          onClick={() => onChange(p)}
          title={p === 'all' ? t('stats.allTime') : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
