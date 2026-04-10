// Core domain types — source of truth for all other modules

export interface Habit {
  id: string           // nanoid()
  name: string         // Display name
  symbol: string       // Single unicode char: '●' | '◆' | '✦' | '▪' | '○' | '◇' | '⬡'
  accentChar: string   // CSS class modifier: 'dim' | 'bright'
  createdAt: string    // ISO date 'YYYY-MM-DD'
  archivedAt?: string  // ISO date, undefined = active
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

export interface HabitStats {
  currentStreak: number
  longestStreak: number
  completionRate: number
  totalCompletions: number
}

export interface StatsData {
  totalHabits: number
  activeHabits: number
  heatmapData: Record<string, number>  // date → count of completions
  topStreakHabit: HabitWithStats | null
  overallCompletionRate: number
}

export type ViewName = 'habits' | 'calendar' | 'stats' | 'settings'

export type AccentChar = 'dim' | 'bright'

export const HABIT_SYMBOLS = ['●', '◆', '✦', '▪', '○', '◇', '⬡'] as const
export type HabitSymbol = typeof HABIT_SYMBOLS[number]
