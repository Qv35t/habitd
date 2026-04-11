import type { HabitFilter } from '@/types'
import { useTranslation } from 'react-i18next'

interface HabitFilterBarProps {
  value: HabitFilter
  onChange: (f: HabitFilter) => void
}

/**
 * Segmented filter control for active / archived / all habits.
 */
export function HabitFilterBar({ value, onChange }: HabitFilterBarProps) {
  const { t } = useTranslation()

  const filters: { value: HabitFilter; label: string }[] = [
    { value: 'active', label: t('stats.filter.active') },
    { value: 'archived', label: t('stats.filter.archived') },
    { value: 'all', label: t('stats.filter.all') },
  ]

  return (
    <div className="segmented-control">
      {filters.map(({ value: f, label }) => (
        <button
          key={f}
          className={`segmented-control__btn ${value === f ? 'segmented-control__btn--active' : ''}`}
          onClick={() => onChange(f)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
