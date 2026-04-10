import type { CalendarDay } from '@/types'
import { DayCell } from './DayCell'

interface MonthGridProps {
  days: CalendarDay[]
  completionMap: Record<string, number>
  totalActiveHabits: number
  selectedDate: string | null
  onDayClick: (date: string) => void
}

const WEEKDAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

/**
 * Terminal-style month grid. Pure presentational component.
 * 7 columns, Monday start. Header row + day cells.
 */
export function MonthGrid({
  days,
  completionMap,
  totalActiveHabits,
  selectedDate,
  onDayClick,
}: MonthGridProps) {
  return (
    <div className="month-grid" role="grid" aria-label="Calendar month">
      {/* Header row */}
      <div className="month-grid__header" role="row">
        {WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className="month-grid__weekday"
            role="columnheader"
            aria-label={label}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="month-grid__body" role="rowgroup">
        {days.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            completionCount={completionMap[day.date] ?? 0}
            totalActiveHabits={totalActiveHabits}
            isSelected={selectedDate === day.date}
            onClick={onDayClick}
          />
        ))}
      </div>
    </div>
  )
}
