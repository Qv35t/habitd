/**
 * Pure calendar utility functions.
 * Zero I/O, zero side effects, fully testable.
 */
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isFuture,
  getYear,
  getMonth,
  addMonths,
  subMonths,
} from 'date-fns'
import type { CalendarDay } from '@/types'

/**
 * Returns an array of CalendarDay objects covering the full grid
 * for the given year+month (0-indexed month, JS convention).
 * Grid is padded to full weeks (Monday start, ISO 8601).
 * Result length is always 35 or 42 (5 or 6 rows × 7 cols).
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const monthStart = startOfMonth(new Date(year, month, 1))
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    date: format(date, 'yyyy-MM-dd'),
    dayOfMonth: date.getDate(),
    isCurrentMonth: date.getMonth() === month,
    isToday: isToday(date),
    isFuture: isFuture(date),
  }))
}

/**
 * Returns a human-readable month label.
 * Example: getMonthLabel(2026, 3) → "April 2026"
 */
export function getMonthLabel(year: number, month: number): string {
  return format(new Date(year, month, 1), 'MMMM yyyy')
}

/**
 * Returns { year, month } for the NEXT month.
 */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  const d = addMonths(new Date(year, month, 1), 1)
  return { year: getYear(d), month: getMonth(d) }
}

/**
 * Returns { year, month } for the PREVIOUS month.
 */
export function prevMonth(year: number, month: number): { year: number; month: number } {
  const d = subMonths(new Date(year, month, 1), 1)
  return { year: getYear(d), month: getMonth(d) }
}

/**
 * Returns today's { year, month } using date-fns.
 */
export function todayYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: getYear(now), month: getMonth(now) }
}

/**
 * Builds a lookup map: date string → completion count.
 * Pure function — no Dexie calls inside.
 */
export function buildCompletionMap(
  completionDates: string[]
): Record<string, number> {
  return completionDates.reduce<Record<string, number>>((acc, date) => {
    acc[date] = (acc[date] ?? 0) + 1
    return acc
  }, {})
}

/**
 * Generates the ASCII completion bar shown inside DayCell.
 * Uses block characters: █ (filled) ░ (empty).
 * Always renders exactly `total` characters.
 * Returns empty string if total === 0.
 *
 * Examples:
 *   completionBar(3, 5) → "███░░"
 *   completionBar(0, 4) → "░░░░"
 *   completionBar(4, 4) → "████"
 *   completionBar(0, 0) → ""
 */
export function completionBar(count: number, total: number): string {
  if (total === 0) return ''
  const filled = Math.min(count, total)
  return '█'.repeat(filled) + '░'.repeat(total - filled)
}
