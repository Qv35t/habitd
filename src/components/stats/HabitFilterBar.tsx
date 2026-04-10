import type { HabitFilter } from '@/types'

interface HabitFilterBarProps {
  value: HabitFilter
  onChange: (f: HabitFilter) => void
}

const FILTERS: HabitFilter[] = ['active', 'archived', 'all']

/**
 * Segmented filter control for active / archived / all habits.
 * Active button uses border-active; inactive uses border-default.
 */
export function HabitFilterBar({ value, onChange }: HabitFilterBarProps) {
  return (
    <div className="segmented-control">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`segmented-control__btn ${value === f ? 'segmented-control__btn--active' : ''}`}
          onClick={() => onChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
