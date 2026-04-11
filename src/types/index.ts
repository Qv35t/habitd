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

export type ViewName = 'home' | 'habits' | 'calendar' | 'stats' | 'settings'

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

// ── Phase 5: Stats View Types ──────────────────────────────

export type StatsPeriod = '7d' | '30d' | '90d' | 'all'

export const STATS_PERIOD_DAYS: Record<StatsPeriod, number> = {
  '7d':  7,
  '30d': 30,
  '90d': 90,
  'all': 0,
}

export type HabitFilter = 'active' | 'archived' | 'all'

export interface HabitStatsRow {
  habit: Habit
  currentStreak: number
  longestStreak: number
  completionRate: number
  totalCompletions: number
  firstCompletionDate: string | null
}

export interface GlobalSummaryData {
  totalDaysTracked: number
  overallCompletionRate: number
  bestCurrentStreak: number
  bestCurrentStreakHabitName: string | null
  bestLongestStreak: number
  bestLongestStreakHabitName: string | null
  activeHabitsCount: number
  archivedHabitsCount: number
  totalCompletionsAllTime: number
}

export interface TopStreakEntry {
  habit: Habit
  currentStreak: number
  longestStreak: number
}

export interface HeatmapCell {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  char: string
  isToday: boolean
  isFuture: boolean
}

/**
 * One column (Mon–Sun) in the calendar-year heatmap.
 * weekIndex: 0-based index within the year grid (0–51 for 52-week years,
 * 0–52 for 53-week years like 2015, 2026).
 */
export interface HeatmapWeek {
  weekIndex: number  // 0-based, max 52 for 53-week years
  cells: HeatmapCell[]  // always 7 items (Mon–Sun)
}

export interface StatsViewData {
  isLoading: boolean
  summary: GlobalSummaryData
  heatmapData: Record<string, number>
  heatmapMaxCount: number
  heatmapWeeks: HeatmapWeek[]
  habitStats: HabitStatsRow[]
  top3ByCurrentStreak: TopStreakEntry[]
  period: StatsPeriod
  today: string
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 6 — Settings & Export Types
// ═══════════════════════════════════════════════════════════════════════════

export type SettingsSection = 'data' | 'habits' | 'danger'

export interface BackupData {
  version: 1
  exportedAt: string
  habits: Habit[]
  completions: Completion[]
}

export type ImportStatus = 'success' | 'error' | 'idle'

export interface ImportResult {
  status: ImportStatus
  habitsImported: number
  completionsImported: number
  errorMessage?: string
}

export interface ConfirmModalState {
  title: string
  description: string
  confirmLabel: string
  keyword?: string
  isDangerous: boolean
  onConfirm: () => void | Promise<void>
}
