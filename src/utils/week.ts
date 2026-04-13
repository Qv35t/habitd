/**
 * Pure week math utilities for WeekView.
 * All functions are pure — no side effects, no Dexie calls.
 * Week starts on Monday (ISO 8601).
 */
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  parseISO,
} from 'date-fns'
import type { WeekDay, Completion } from '../types'

/**
 * Returns YYYY-MM-DD of the Monday for the week (today + offset weeks).
 * @param offset - 0 = current week, -1 = last week, +1 = next week
 * @param today  - YYYY-MM-DD
 */
export function getWeekReferenceDate(offset: number, today: string): string {
  const base = parseISO(today)
  const shifted =
    offset === 0 ? base :
    offset > 0   ? addWeeks(base, offset) :
                   subWeeks(base, Math.abs(offset))
  return format(startOfWeek(shifted, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

/**
 * Builds WeekDay[7] (Mon–Sun) for the week containing referenceDate.
 * @param referenceDate - any YYYY-MM-DD within the target week
 * @param today         - YYYY-MM-DD for isToday / isFuture
 */
export function getWeekDays(referenceDate: string, today: string): WeekDay[] {
  const ref = parseISO(referenceDate)
  const weekStart = startOfWeek(ref, { weekStartsOn: 1 })
  const weekEnd   = endOfWeek(ref,   { weekStartsOn: 1 })
  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    return {
      date:       dateStr,
      dayLabel:   format(d, 'EEE'),
      dayOfMonth: d.getDate(),
      monthLabel: format(d, 'MMM'),
      isToday:    dateStr === today,
      isFuture:   dateStr > today,
    }
  })
}

/**
 * Returns human-readable week label.
 * Same month  → "Apr 14 – 20, 2026"
 * Cross-month → "Mar 31 – Apr 6, 2026"
 */
export function getWeekLabel(weekDays: WeekDay[]): string {
  const first = parseISO(weekDays[0].date)
  const last  = parseISO(weekDays[6].date)
  if (first.getMonth() === last.getMonth()) {
    return `${format(first, 'MMM d')} – ${format(last, 'd, yyyy')}`
  }
  return `${format(first, 'MMM d')} – ${format(last, 'MMM d, yyyy')}`
}

/**
 * Returns inclusive YYYY-MM-DD bounds for the week containing referenceDate.
 */
export function getWeekBounds(referenceDate: string): { weekStart: string; weekEnd: string } {
  const ref = parseISO(referenceDate)
  return {
    weekStart: format(startOfWeek(ref, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    weekEnd:   format(endOfWeek(ref,   { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }
}

/**
 * Builds lookup map: date (YYYY-MM-DD) → Set of completed habitIds.
 * Pure — no Dexie calls.
 */
export function buildWeekCompletionMap(
  completions: Completion[]
): Record<string, Set<string>> {
  return completions.reduce<Record<string, Set<string>>>((acc, c) => {
    const key = c.date.slice(0, 10)
    if (!acc[key]) acc[key] = new Set<string>()
    acc[key].add(c.habitId)
    return acc
  }, {})
}

/**
 * Returns true if habitId was completed on date.
 */
export function isCellCompleted(
  map: Record<string, Set<string>>,
  habitId: string,
  date: string
): boolean {
  return map[date]?.has(habitId) ?? false
}

/**
 * Total possible completions this week (habits × non-future days).
 */
export function calcWeekTotalPossible(
  habits: { id: string }[],
  weekDays: WeekDay[]
): number {
  return habits.length * weekDays.filter(d => !d.isFuture).length
}

/**
 * Total completed cells this week (future days excluded).
 */
export function calcWeekTotalCompleted(
  map: Record<string, Set<string>>,
  habits: { id: string }[],
  weekDays: WeekDay[]
): number {
  let count = 0
  for (const day of weekDays) {
    if (day.isFuture) continue
    for (const h of habits) {
      if (isCellCompleted(map, h.id, day.date)) count++
    }
  }
  return count
}

/**
 * Week completion rate 0–100 rounded to 1 decimal. Returns 0 if possible=0.
 */
export function calcWeekCompletionRate(
  totalCompleted: number,
  totalPossible: number
): number {
  if (totalPossible === 0) return 0
  return Math.round((totalCompleted / totalPossible) * 1000) / 10
}
