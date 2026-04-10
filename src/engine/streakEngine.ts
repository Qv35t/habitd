/**
 * streakEngine.ts — Pure computation functions for HABITD.
 *
 * CONSTRAINTS:
 * - Zero I/O: no db calls, no fetch, no console.log
 * - Zero state: all functions are stateless and deterministic
 * - All date inputs must be 'YYYY-MM-DD' strings
 * - today is always passed as parameter (no new Date() inside)
 * - Input arrays are never mutated (internal copies only)
 * - Future dates in completedDates are filtered before computation
 */

import {
  parseISO,
  differenceInCalendarDays,
  subDays,
  format,
} from 'date-fns'
import type { Habit, HabitStats, StatsData } from '@/types'

// ─────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Deduplicate and sort dates ASC.
 * Filters out any dates after `ceiling` (used to exclude future dates).
 * Returns a new array (does not mutate input).
 */
function normalizeDates(dates: string[], ceiling?: string): string[] {
  let result = [...new Set(dates)]
  if (ceiling !== undefined) {
    result = result.filter((d) => d <= ceiling)
  }
  return result.sort() // ISO strings sort lexicographically = chronologically
}

// ─────────────────────────────────────────────────────────────────
// EXPORTED PURE FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate the current (active) streak for a habit.
 *
 * A streak is "alive" if the habit was completed either today or yesterday.
 * Future dates in completedDates are ignored.
 *
 * @param completedDates - Array of 'YYYY-MM-DD' completion dates (may have dupes)
 * @param today - Current date as 'YYYY-MM-DD'
 * @returns Number of consecutive days in current streak (0 if no active streak)
 *
 * @example
 * calcCurrentStreak(['2026-04-08', '2026-04-09', '2026-04-10'], '2026-04-10') // → 3
 * calcCurrentStreak(['2026-04-08', '2026-04-09'], '2026-04-10')               // → 2 (yesterday ok)
 * calcCurrentStreak(['2026-04-08'], '2026-04-10')                             // → 0 (gap > 1 day)
 * calcCurrentStreak([], '2026-04-10')                                         // → 0
 */
export function calcCurrentStreak(completedDates: string[], today: string): number {
  if (completedDates.length === 0) return 0

  // Normalize: deduplicate, filter future, sort DESC
  const sorted = normalizeDates(completedDates, today).reverse()

  if (sorted.length === 0) return 0

  // Streak is alive only if last completion was today (diff=0) or yesterday (diff=1)
  const latestDate = sorted[0]
  const diffFromToday = differenceInCalendarDays(parseISO(today), parseISO(latestDate))

  if (diffFromToday > 1) return 0

  // Count consecutive days going back from the latest completion
  let streak = 1
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i + 1]))
    if (gap === 1) {
      streak++
    } else {
      break // First gap found — stop counting
    }
  }

  return streak
}

/**
 * Calculate the longest unbroken streak ever for a habit.
 *
 * Scans the entire history of completions.
 * Does NOT depend on "today" — looks at all-time data.
 *
 * @param completedDates - Array of 'YYYY-MM-DD' completion dates (may have dupes)
 * @returns Longest consecutive day count (0 if empty)
 *
 * @example
 * calcLongestStreak(['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-05']) // → 3
 * calcLongestStreak(['2026-04-10'])                                            // → 1
 * calcLongestStreak([])                                                        // → 0
 */
export function calcLongestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0

  const sorted = normalizeDates(completedDates) // ASC, no ceiling (all-time)

  if (sorted.length === 1) return 1

  let longest = 1
  let current = 1

  for (let i = 1; i < sorted.length; i++) {
    const gap = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]))

    if (gap === 1) {
      current++
      if (current > longest) longest = current
    } else if (gap > 1) {
      current = 1
    }
    // gap === 0 should not occur after dedup, but is silently skipped
  }

  return longest
}

/**
 * Calculate completion rate (%) for the last N days.
 *
 * Window is [today - (days-1)] to [today], inclusive.
 * Example: days=30, today='2026-04-10' → window is '2026-03-12' to '2026-04-10'.
 *
 * @param completedDates - Array of 'YYYY-MM-DD' completion dates
 * @param days - Window size in days (must be > 0)
 * @param today - Current date as 'YYYY-MM-DD'
 * @returns Completion rate 0–100 (one decimal precision, e.g. 66.7)
 *
 * @example
 * calcCompletionRate(['2026-04-08', '2026-04-09', '2026-04-10'], 30, '2026-04-10') // → 10.0
 * calcCompletionRate([], 30, '2026-04-10')                                          // → 0
 * calcCompletionRate(['2026-04-10'], 1, '2026-04-10')                               // → 100.0
 */
export function calcCompletionRate(
  completedDates: string[],
  days: number,
  today: string
): number {
  if (days <= 0 || completedDates.length === 0) return 0

  const windowStart = format(subDays(parseISO(today), days - 1), 'yyyy-MM-dd')

  const uniqueInWindow = new Set(
    completedDates.filter((d) => d >= windowStart && d <= today)
  ).size

  const rate = (uniqueInWindow / days) * 100
  return Math.min(Math.round(rate * 10) / 10, 100)
}

/**
 * Build a heatmap from all completion records.
 *
 * Groups completions by date and counts how many habits were completed.
 * Used for the GitHub-style heatmap in StatsView.
 *
 * @param allCompletions - Flat array of completion objects with a `date` field
 * @returns Record mapping 'YYYY-MM-DD' → count of completions on that day
 *
 * @example
 * calcHeatmap([
 *   { date: '2026-04-10' }, { date: '2026-04-10' }, { date: '2026-04-09' }
 * ])
 * // → { '2026-04-10': 2, '2026-04-09': 1 }
 */
export function calcHeatmap(
  allCompletions: Array<{ date: string }>
): Record<string, number> {
  const heatmap: Record<string, number> = {}

  for (const { date } of allCompletions) {
    heatmap[date] = (heatmap[date] ?? 0) + 1
  }

  return heatmap
}

/**
 * Classify heatmap intensity into 5 levels (0–4) for rendering.
 *
 * Used by HeatmapGrid to determine which ASCII block character to display:
 * 0 → '·', 1 → '░', 2 → '▒', 3 → '▓', 4 → '█'
 *
 * @param count - Raw completion count for a day
 * @param maxCount - Maximum count in the dataset (for normalization)
 * @returns Intensity level 0–4
 *
 * @example
 * getHeatmapLevel(0, 10) // → 0
 * getHeatmapLevel(5, 10) // → 2
 * getHeatmapLevel(10, 10) // → 4
 */
export function getHeatmapLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || maxCount === 0) return 0
  const ratio = count / maxCount
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5)  return 2
  if (ratio <= 0.75) return 3
  return 4
}

/**
 * Get the ASCII character for a heatmap level.
 *
 * @param level - Intensity level 0–4 from getHeatmapLevel()
 * @returns ASCII block character
 *
 * @example
 * getHeatmapChar(0) // → '·'
 * getHeatmapChar(4) // → '█'
 */
export const HEATMAP_CHARS = ['·', '░', '▒', '▓', '█'] as const

export function getHeatmapChar(level: 0 | 1 | 2 | 3 | 4): string {
  return HEATMAP_CHARS[level]
}

/**
 * Compute full statistics for a single habit.
 *
 * Aggregates all streak/rate metrics into a single HabitStats object.
 * This is the primary interface for components that need habit stats.
 *
 * @param habit - The Habit object
 * @param completedDates - All completion dates for this habit (may be dupes/unsorted)
 * @param today - Current date as 'YYYY-MM-DD'
 * @returns HabitStats with all computed fields
 */
export function computeHabitStats(
  habit: Habit,
  completedDates: string[],
  today: string
): HabitStats {
  // Normalized array: deduplicated, filtered ≤ today, sorted ASC
  const normalized = normalizeDates(completedDates, today)

  return {
    habit,
    completedDates: normalized,
    currentStreak:   calcCurrentStreak(normalized, today),
    longestStreak:   calcLongestStreak(normalized),
    completionRate:  calcCompletionRate(normalized, 30, today),
    totalCompletions: normalized.length,
  }
}

/**
 * Compute aggregated global statistics across all habits.
 *
 * Includes heatmap, overall completion rate, and top streak habit.
 * Only ACTIVE habits (archivedAt === '' or undefined) count toward averages.
 *
 * @param habitsWithDates - Array of { habit, dates } pairs
 * @param today - Current date as 'YYYY-MM-DD'
 * @returns StatsData with all global metrics
 */
export function computeGlobalStats(
  habitsWithDates: Array<{ habit: Habit; dates: string[] }>,
  today: string
): StatsData {
  // Compute per-habit stats for all habits
  const allStats = habitsWithDates.map(({ habit, dates }) =>
    computeHabitStats(habit, dates, today)
  )

  // Active = not archived
  const activeStats = allStats.filter(
    (s) => !s.habit.archivedAt || s.habit.archivedAt === ''
  )

  // Heatmap across ALL habits (active + archived history is valid)
  const allCompletions = habitsWithDates.flatMap(({ dates }) =>
    dates.map((date) => ({ date }))
  )
  const heatmapData = calcHeatmap(allCompletions)

  // Top streak from active habits only
  const topStreakHabit =
    activeStats.length > 0
      ? activeStats.reduce((best, cur) =>
          cur.currentStreak > best.currentStreak ? cur : best
        )
      : null

  // Overall rate = average across active habits
  const overallCompletionRate =
    activeStats.length > 0
      ? Math.round(
          (activeStats.reduce((sum, s) => sum + s.completionRate, 0) /
            activeStats.length) *
            10
        ) / 10
      : 0

  return {
    totalHabits: allStats.length,
    activeHabits: activeStats.length,
    heatmapData,
    topStreakHabit,
    overallCompletionRate,
  }
}
