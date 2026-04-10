// Core domain types — source of truth for all other modules

export interface Habit {
  id: string           // nanoid()
  name: string         // Display name
  symbol: string       // Single unicode char: '●' | '◆' | '✦' | '▪' | '○' | '◇' | '⬡'
  accentChar: string   // CSS class modifier: 'dim' | 'bright'
  createdAt: string    // ISO date 'YYYY-MM-DD'
  archivedAt: string   // '' = active, 'YYYY-MM-DD' = archived
  sortOrder: number    // Manual sort position (ASC)
}

export interface Completion {
  id: string       // nanoid()
  habitId: string  // FK → Habit.id
  date: string     // ISO date 'YYYY-MM-DD'
}

export interface HabitWithStats {
  habit: Habit
  completedDates: string[]
  currentStreak: number
  longestStreak: number
  completionRate: number   // 0–100, last 30 days
  totalCompletions: number
}

/**
 * Computed stats for a single habit.
 * Result of computeHabitStats() in streakEngine.ts.
 */
export interface HabitStats {
  habit: Habit
  /** Sorted ASC, deduplicated array of completion dates 'YYYY-MM-DD' */
  completedDates: string[]
  /** Days in current unbroken streak (today or yesterday must be completed) */
  currentStreak: number
  /** Longest unbroken streak ever */
  longestStreak: number
  /** Completion rate for last 30 days (0-100, one decimal) */
  completionRate: number
  /** Total unique completion days (all time) */
  totalCompletions: number
}

/**
 * Aggregated stats across all active habits.
 * Result of computeGlobalStats() in streakEngine.ts.
 */
export interface StatsData {
  totalHabits: number
  activeHabits: number
  /** date → number of habits completed on that date */
  heatmapData: Record<string, number>
  /** Habit with the highest current streak among active habits */
  topStreakHabit: HabitStats | null
  /** Average completionRate across all active habits */
  overallCompletionRate: number
}

export type ViewName = 'habits' | 'calendar' | 'stats' | 'settings'

export type AccentChar = 'dim' | 'bright'

export const HABIT_SYMBOLS = ['●', '◆', '✦', '▪', '○', '◇', '⬡'] as const
export type HabitSymbol = typeof HABIT_SYMBOLS[number]

/**
 * Calendar utility type — represents one cell in the MonthGrid.
 */
export interface CalendarDay {
  date: string           // YYYY-MM-DD
  dayOfMonth: number     // 1–31
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
}

/**
 * Aggregated per-day data passed to DayCell.
 */
export interface DayCellData {
  day: CalendarDay
  completionCount: number    // how many habits completed on this date
  totalActiveHabits: number  // denominator for the bar
}
