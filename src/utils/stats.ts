/**
 * Pure stats helper functions.
 * Zero I/O, zero side effects, fully testable.
 */
import {
  parseISO,
  differenceInCalendarDays,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isAfter,
} from 'date-fns'
import { getHeatmapLevel, getHeatmapChar } from '@/engine/streakEngine'
import type {
  Habit,
  HabitStatsRow,
  GlobalSummaryData,
  HeatmapCell,
  HeatmapWeek,
  StatsPeriod,
  TopStreakEntry,
} from '@/types'
import { STATS_PERIOD_DAYS } from '@/types'

/**
 * Resolve the effective days window for a given StatsPeriod.
 * For 'all', uses the habit's createdAt date to compute how many days
 * have elapsed since tracking started. Minimum 1.
 *
 * @param period - StatsPeriod value
 * @param today - 'YYYY-MM-DD'
 * @param earliestCreatedAt - 'YYYY-MM-DD' of the oldest habit (used when period === 'all')
 * @returns number of days to use as the completion rate window
 */
export function resolvePeriodDays(
  period: StatsPeriod,
  today: string,
  earliestCreatedAt: string
): number {
  if (period !== 'all') {
    return STATS_PERIOD_DAYS[period]
  }
  const diff = differenceInCalendarDays(parseISO(today), parseISO(earliestCreatedAt))
  return Math.max(diff + 1, 1)
}

/**
 * Build the calendar-year heatmap grid (Mon–Sun columns, Jan 1 → Dec 31).
 * gridStart = Monday of the ISO week that contains Jan 1 of today's year.
 * gridEnd   = Sunday of the ISO week that contains Dec 31 of today's year.
 * A full year produces 52 or 53 complete weeks (364–371 cells).
 * Future days (after today) have isFuture=true, count=0, level=0, char='.'.
 * Past days with no data also have count=0, level=0, char='.'.
 *
 * @param heatmapData - Record<YYYY-MM-DD, number> from calcHeatmap
 * @param maxCount    - maximum value in heatmapData for level normalisation
 * @param today       - current date as YYYY-MM-DD (no new Date() inside)
 * @returns HeatmapWeek[] — 52 or 53 weeks covering Jan 1 → Dec 31
 */
export function buildHeatmapWeeks(
  heatmapData: Record<string, number>,
  maxCount: number,
  today: string
): HeatmapWeek[] {
  const todayDate = parseISO(today)
  const year = todayDate.getFullYear()

  // Grid bounds: full calendar year
  const gridStart = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(new Date(year, 11, 31), { weekStartsOn: 1 })

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // Build flat list of HeatmapCell
  const cells: HeatmapCell[] = allDays.map((d) => {
    const dateStr = format(d, 'yyyy-MM-dd')
    const isFuture = isAfter(d, todayDate)
    const count = isFuture ? 0 : (heatmapData[dateStr] ?? 0)
    const level = getHeatmapLevel(count, maxCount)
    return {
      date: dateStr,
      count,
      level,
      char: getHeatmapChar(level),
      isToday: dateStr === today,
      isFuture,
    }
  })

  // Group into weeks of 7
  const weeks: HeatmapWeek[] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push({
      weekIndex: Math.floor(i / 7),
      cells: cells.slice(i, i + 7),
    })
  }

  return weeks
}

/**
 * Compute the total number of days tracked since the earliest habit was created.
 *
 * @param habits - All habits (active + archived)
 * @param today - 'YYYY-MM-DD'
 * @returns number of days, minimum 1; returns 0 if no habits
 */
export function calcTotalDaysTracked(habits: Habit[], today: string): number {
  if (habits.length === 0) return 0
  const earliest = habits
    .map((h) => h.createdAt)
    .sort()[0]
  const diff = differenceInCalendarDays(parseISO(today), parseISO(earliest))
  return Math.max(diff + 1, 1)
}

/**
 * Rank habits by currentStreak descending and return the top N.
 *
 * Only includes active habits (archivedAt is empty or undefined).
 *
 * @param habitStats - Array of HabitStatsRow (all habits)
 * @param n - How many top entries to return (default 3)
 * @returns TopStreakEntry[] sorted DESC by currentStreak, max length n
 */
export function getTopByCurrentStreak(
  habitStats: HabitStatsRow[],
  n = 3
): TopStreakEntry[] {
  return habitStats
    .filter((r) => !r.habit.archivedAt || r.habit.archivedAt === '')
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, n)
    .map((r) => ({
      habit: r.habit,
      currentStreak: r.currentStreak,
      longestStreak: r.longestStreak,
    }))
}

/**
 * Compute GlobalSummaryData from habit stats and raw habits list.
 *
 * @param habitStats - All HabitStatsRow (computed with relevant period)
 * @param habits - Raw Habit[] (all, for total days tracking calc)
 * @param completionsCount - Total count of all completion records in DB
 * @param today - 'YYYY-MM-DD'
 * @returns GlobalSummaryData
 */
export function computeSummary(
  habitStats: HabitStatsRow[],
  habits: Habit[],
  completionsCount: number,
  today: string
): GlobalSummaryData {
  const active = habitStats.filter(
    (r) => !r.habit.archivedAt || r.habit.archivedAt === ''
  )
  const archived = habitStats.filter(
    (r) => r.habit.archivedAt && r.habit.archivedAt !== ''
  )

  const overallCompletionRate =
    active.length > 0
      ? Math.round(
          (active.reduce((sum, r) => sum + r.completionRate, 0) / active.length) * 10
        ) / 10
      : 0

  const bestCurrentEntry = active.reduce<HabitStatsRow | null>(
    (best, r) => (!best || r.currentStreak > best.currentStreak ? r : best),
    null
  )

  const bestLongestEntry = habitStats.reduce<HabitStatsRow | null>(
    (best, r) => (!best || r.longestStreak > best.longestStreak ? r : best),
    null
  )

  return {
    totalDaysTracked: calcTotalDaysTracked(habits, today),
    overallCompletionRate,
    bestCurrentStreak: bestCurrentEntry?.currentStreak ?? 0,
    bestCurrentStreakHabitName: bestCurrentEntry?.habit.name ?? null,
    bestLongestStreak: bestLongestEntry?.longestStreak ?? 0,
    bestLongestStreakHabitName: bestLongestEntry?.habit.name ?? null,
    activeHabitsCount: active.length,
    archivedHabitsCount: archived.length,
    totalCompletionsAllTime: completionsCount,
  }
}

/**
 * Filter HabitStatsRow[] by HabitFilter value.
 *
 * @param rows - All HabitStatsRow
 * @param filter - HabitFilter
 * @returns filtered array
 */
export function filterHabitStats(
  rows: HabitStatsRow[],
  filter: 'active' | 'archived' | 'all'
): HabitStatsRow[] {
  if (filter === 'active')
    return rows.filter((r) => !r.habit.archivedAt || r.habit.archivedAt === '')
  if (filter === 'archived')
    return rows.filter((r) => r.habit.archivedAt && r.habit.archivedAt !== '')
  return rows
}
