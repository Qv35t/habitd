import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useUIStore } from '@/stores/useUIStore'
import { useActiveHabits } from '@/hooks/useHabits'
import { useCompletionsForMonth } from '@/hooks/useCompletions'
import { MonthGrid } from '@/components/calendar/MonthGrid'
import { DayDetailPanel } from '@/components/calendar/DayDetailPanel'
import { Button } from '@/components/ui/Button'
import {
  getCalendarDays,
  getMonthLabel,
  nextMonth,
  prevMonth,
  todayYearMonth,
  buildCompletionMap,
} from '@/utils/calendar'

/**
 * CalendarView — full month calendar with day detail panel.
 *
 * State (Zustand): calendarYear, calendarMonth, selectedCalendarDate
 * Data (Dexie via useLiveQuery): active habits, completions for month
 * Utilities (pure): getCalendarDays, buildCompletionMap, navigation helpers
 */
export function CalendarView() {
  const {
    calendarYear,
    calendarMonth,
    selectedCalendarDate,
    setCalendarMonth,
    setSelectedCalendarDate,
  } = useUIStore()

  const habits = useActiveHabits()
  const totalActiveHabits = habits?.length ?? 0

  const monthStart = format(startOfMonth(new Date(calendarYear, calendarMonth, 1)), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date(calendarYear, calendarMonth, 1)), 'yyyy-MM-dd')

  const monthCompletions = useCompletionsForMonth(monthStart, monthEnd)
  const completionDates = monthCompletions?.map((c) => c.date) ?? []
  const completionMap = buildCompletionMap(completionDates)

  const calendarDays = getCalendarDays(calendarYear, calendarMonth)
  const monthLabel = getMonthLabel(calendarYear, calendarMonth)

  const today = todayYearMonth()

  const goToPrevMonth = () => {
    const p = prevMonth(calendarYear, calendarMonth)
    setCalendarMonth(p.year, p.month)
    setSelectedCalendarDate(null)
  }

  const goToNextMonth = () => {
    const n = nextMonth(calendarYear, calendarMonth)
    setCalendarMonth(n.year, n.month)
    setSelectedCalendarDate(null)
  }

  const goToToday = () => {
    setCalendarMonth(today.year, today.month)
    setSelectedCalendarDate(format(new Date(), 'yyyy-MM-dd'))
  }

  const handleDayClick = (date: string) => {
    if (selectedCalendarDate === date) {
      setSelectedCalendarDate(null)
    } else {
      setSelectedCalendarDate(date)
    }
  }

  const isCurrentMonthView =
    calendarYear === today.year && calendarMonth === today.month

  return (
    <main className="app-content" role="main">
      <div className="calendar-view">
        {/* Navigation bar */}
        <div className="calendar-nav">
          <Button variant="ghost" onClick={goToPrevMonth} aria-label="Previous month">
            ◄
          </Button>
          <span className="calendar-nav__label">{monthLabel.toLowerCase()}</span>
          <Button variant="ghost" onClick={goToNextMonth} aria-label="Next month">
            ►
          </Button>
          {!isCurrentMonthView && (
            <Button variant="ghost" onClick={goToToday}>
              [today]
            </Button>
          )}
        </div>

        {/* Calendar + Detail Panel layout */}
        <div className="calendar-layout">
          <div className="calendar-grid-wrapper">
            <MonthGrid
              days={calendarDays}
              completionMap={completionMap}
              totalActiveHabits={totalActiveHabits}
              selectedDate={selectedCalendarDate}
              onDayClick={handleDayClick}
            />
          </div>

          {/* Day detail panel */}
          {selectedCalendarDate && (
            <DayDetailPanel
              date={selectedCalendarDate}
              onClose={() => setSelectedCalendarDate(null)}
            />
          )}
        </div>
      </div>
    </main>
  )
}
