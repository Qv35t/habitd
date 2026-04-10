// Full implementation in Phase 3
// Phase 0: export empty stubs to prevent import errors

import type { Habit, HabitStats, HabitWithStats, StatsData } from '@/types'

export function calcCurrentStreak(_completedDates: string[], _today: string): number {
  return 0
}

export function calcLongestStreak(_completedDates: string[]): number {
  return 0
}

export function calcCompletionRate(_completedDates: string[], _days: number, _today: string): number {
  return 0
}

export function calcHeatmap(_completions: { date: string }[]): Record<string, number> {
  return {}
}

export function computeHabitStats(_habit: Habit, _completedDates: string[], _today: string): HabitStats {
  return { currentStreak: 0, longestStreak: 0, completionRate: 0, totalCompletions: 0 }
}

export function computeGlobalStats(
  _habitsWithDates: { habit: Habit; dates: string[] }[],
  _today: string
): StatsData {
  return {
    totalHabits: 0,
    activeHabits: 0,
    heatmapData: {},
    topStreakHabit: null,
    overallCompletionRate: 0,
  }
}

export function computeHabitWithStats(
  habit: Habit,
  completedDates: string[],
  today: string
): HabitWithStats {
  return {
    habit,
    completedDates,
    ...computeHabitStats(habit, completedDates, today),
  }
}
