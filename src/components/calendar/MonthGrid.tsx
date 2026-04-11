import type { CalendarDay } from '@/types'
import { DayCell } from './DayCell'
import { useTranslation } from 'react-i18next'

interface MonthGridProps {
  days: CalendarDay[]
  completionMap: Record<string, number>
  totalActiveHabits: number
  selectedDate: string | null
  onDayClick: (date: string) => void
}

/**
 * Terminal-style month grid. Pure presentational component.
 */
export function MonthGrid({
  days,
  completionMap,
  totalActiveHabits,
  selectedDate,
  onDayClick,
}: MonthGridProps) {
  const { t } = useTranslation()
  const weekdays = t('calendar.weekdays', { returnObjects: true }) as string[]

  return (
    <div className="month-grid" role="grid" aria-label={t('calendar.title')}>
      {/* Header row */}
      <div className="month-grid__header" role="row">
        {weekdays.map((label) => (
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
