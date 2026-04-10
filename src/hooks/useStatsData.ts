import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { db } from '@/db'
import {
  calcHeatmap,
  calcCurrentStreak,
  calcLongestStreak,
  calcCompletionRate,
} from '@/engine/streakEngine'
import {
  buildHeatmapWeeks,
  computeSummary,
  getTopByCurrentStreak,
  resolvePeriodDays,
  filterHabitStats,
} from '@/utils/stats'
import type { StatsViewData, HabitStatsRow, StatsPeriod, HabitFilter } from '@/types'

/**
 * Composite hook: assembles all data required by StatsView.
 *
 * Reads ALL habits (including archived) and ALL completions from Dexie.
 * Reactive — updates automatically when IndexedDB changes.
 *
 * @param period - StatsPeriod for completion rate window
 * @param habitFilter - HabitFilter for table display (does not affect heatmap or summary)
 * @returns StatsViewData
 */
export function useStatsData(
  period: StatsPeriod,
  habitFilter: HabitFilter
): StatsViewData {
  const today = format(new Date(), 'yyyy-MM-dd')

  // ── Reactive Dexie reads ──

  const habits = useLiveQuery(
    () => db.habits.orderBy('sortOrder').toArray(),
    [],
    [] as import('@/types').Habit[]
  )

  const completions = useLiveQuery(
    () => db.completions.toArray(),
    [],
    [] as import('@/types').Completion[]
  )

  // ── Memoized derivations (expensive only when habits/completions change) ──

  return useMemo<StatsViewData>(() => {
    const isLoading = habits === undefined || completions === undefined

    const emptyState: StatsViewData = {
      isLoading: true,
      summary: {
        totalDaysTracked: 0,
        overallCompletionRate: 0,
        bestCurrentStreak: 0,
        bestCurrentStreakHabitName: null,
        bestLongestStreak: 0,
        bestLongestStreakHabitName: null,
        activeHabitsCount: 0,
        archivedHabitsCount: 0,
        totalCompletionsAllTime: 0,
      },
      heatmapData: {},
      heatmapMaxCount: 0,
      heatmapWeeks: [],
      habitStats: [],
      top3ByCurrentStreak: [],
      period,
      today,
    }

    if (isLoading || !habits || !completions) return emptyState

    // Group completions by habitId for fast lookup
    const completionsByHabit = new Map<string, string[]>()
    for (const c of completions) {
      const arr = completionsByHabit.get(c.habitId) ?? []
      arr.push(c.date)
      completionsByHabit.set(c.habitId, arr)
    }

    // Resolve period days for completion rate
    const earliestCreatedAt =
      habits.length > 0
        ? habits.map((h) => h.createdAt).sort()[0]
        : today
    const periodDays = resolvePeriodDays(period, today, earliestCreatedAt)

    // Compute per-habit stats rows (all habits, no filter yet)
    const allHabitStats: HabitStatsRow[] = habits.map((habit) => {
      const dates = completionsByHabit.get(habit.id) ?? []
      const firstCompletionDate =
        dates.length > 0 ? [...dates].sort()[0] : null
      return {
        habit,
        currentStreak: calcCurrentStreak(dates, today),
        longestStreak: calcLongestStreak(dates),
        completionRate: calcCompletionRate(dates, periodDays, today),
        totalCompletions: new Set(dates.filter((d) => d <= today)).size,
        firstCompletionDate,
      }
    })

    // Heatmap over ALL completions (active + archived history)
    const heatmapData = calcHeatmap(completions)
    const heatmapMaxCount =
      Object.values(heatmapData).length > 0
        ? Math.max(...Object.values(heatmapData))
        : 0

    const heatmapWeeks = buildHeatmapWeeks(heatmapData, heatmapMaxCount, today)

    // Global summary
    const summary = computeSummary(allHabitStats, habits, completions.length, today)

    // Top-3 by current streak (active only)
    const top3ByCurrentStreak = getTopByCurrentStreak(allHabitStats, 3)

    // Apply habit filter for table display
    const filteredHabitStats = filterHabitStats(allHabitStats, habitFilter)

    return {
      isLoading: false,
      summary,
      heatmapData,
      heatmapMaxCount,
      heatmapWeeks,
      habitStats: filteredHabitStats,
      top3ByCurrentStreak,
      period,
      today,
    }
  }, [habits, completions, period, habitFilter, today])
}
