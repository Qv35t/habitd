import type { CalendarDay } from '@/types'
import { completionBar } from '@/utils/calendar'

interface DayCellProps {
  day: CalendarDay
  completionCount: number
  totalActiveHabits: number
  isSelected: boolean
  onClick: (date: string) => void
}

/**
 * Terminal-style calendar cell.
 * Shows day number + ASCII completion bar.
 * States: today, selected, other-month, future.
 */
export function DayCell({
  day,
  completionCount,
  totalActiveHabits,
  isSelected,
  onClick,
}: DayCellProps) {
  const bar = completionBar(completionCount, totalActiveHabits)
  const showBar = totalActiveHabits > 0 && day.isCurrentMonth

  const classNames = [
    'day-cell',
    day.isToday ? 'day-cell--today' : '',
    isSelected ? 'day-cell--selected' : '',
    !day.isCurrentMonth ? 'day-cell--other-month' : '',
    day.isFuture && day.isCurrentMonth ? 'day-cell--future' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const ariaLabel = day.isCurrentMonth
    ? `${day.date}, ${completionCount} of ${totalActiveHabits} habits completed`
    : day.date

  return (
    <button
      className={classNames}
      onClick={() => onClick(day.date)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(day.date)
        }
      }}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      tabIndex={day.isCurrentMonth ? 0 : -1}
    >
      <span className="day-cell__number">{day.dayOfMonth}</span>
      {showBar && (
        <span className="day-cell__bar" aria-hidden="true">
          {bar}
        </span>
      )}
    </button>
  )
}
