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

// ── Task Types (Phase 9) ─────────────────────────────────────────

export type TaskScope = 'daily' | 'weekly'

export type TaskFilter = 'all' | 'active' | 'done'

export interface Task {
  id:        string       // nanoid()
  text:      string       // task text, max 200 chars
  scope:     TaskScope    // 'daily' | 'weekly'
  date:      string       // 'YYYY-MM-DD' — for daily: the day, for weekly: Monday of week
  weekKey:   string       // 'YYYY-WNN' — ISO week key
  done:      0 | 1        // 0 = active, 1 = done (Dexie can't index boolean)
  createdAt: string       // 'YYYY-MM-DD'
  sortOrder: number       // order within the list
}

export interface TaskCounters {
  done:    number   // completed tasks for the day
  left:    number   // remaining tasks for the day
  total:   number   // total tasks for the day
  percent: number   // 0-100
}

export interface WeekRange {
  from:    string   // 'YYYY-MM-DD' — Monday of week
  to:      string   // 'YYYY-MM-DD' — Sunday of week
  weekKey: string   // 'YYYY-WNN'
  label:   string   // '28 янв – 3 фев 2026'
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 10 — WeekView Types
// ═══════════════════════════════════════════════════════════════════════════

/** Extended ViewName with 'week' between 'calendar' and 'stats'. */
export type ViewName =
  | 'home'
  | 'habits'
  | 'calendar'
  | 'week'
  | 'journal'
  | 'stats'
  | 'tasks'
  | 'finance'
  | 'help'
  | 'settings'

/** One column in the WeekGrid header (Mon–Sun). */
export interface WeekDay {
  date: string        // YYYY-MM-DD
  dayLabel: string    // "Mon" | "Tue" | … | "Sun"
  dayOfMonth: number  // 1–31
  monthLabel: string  // "Jan" … "Dec"
  isToday: boolean
  isFuture: boolean
}

/** One cell in the WeekGrid body (habit × day intersection). */
export interface WeekCellData {
  date: string
  habitId: string
  isCompleted: boolean
  isFuture: boolean
  isToday: boolean
}

/** Return type of useWeekData hook — all data needed for WeekView. */
export interface WeekViewData {
  isLoading: boolean
  weekDays: WeekDay[]                          // always 7, Mon–Sun
  habits: Habit[]                              // active, sorted by sortOrder
  completionMap: Record<string, Set<string>>   // date → Set<habitId>
  weekLabel: string                            // "Apr 14 – 20, 2026"
  totalPossible: number                        // habits.length × non-future days
  totalCompleted: number
  completionRate: number                       // 0–100, 1 decimal
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 11 — JournalView Types
// ═══════════════════════════════════════════════════════════════════════════

/** Mood level 1–5. 0 = not set. */
export type MoodLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** ASCII representations for mood levels. Index = level (0 = unset). */
export const MOOD_CHARS: Record<MoodLevel, string> = {
  0: '·',
  1: '▁',
  2: '▃',
  3: '▅',
  4: '▇',
  5: '█',
};

/** A single day's journal entry stored in Dexie `notes` table. */
export interface JournalEntry {
  id: string        // nanoid()
  date: string      // YYYY-MM-DD (unique per day — upsert logic)
  content: string   // plain text, no markdown rendering
  mood: MoodLevel   // 0 = unset
  createdAt: string // ISO 8601 full datetime
  updatedAt: string // ISO 8601 full datetime — updated on every save
}

/** Auto-save lifecycle state for JournalEditor. */
export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

/** Habit row displayed in JournalHabitsBar (read-only). */
export interface JournalHabitItem {
  id: string
  name: string
  symbol: string
  isCompleted: boolean
}

/** Return type of useJournalEntry hook. */
export interface JournalViewData {
  isLoading: boolean
  entry: JournalEntry | null           // null = no entry for this date yet
  habits: JournalHabitItem[]           // active habits + today's completion state
  completedCount: number
  totalCount: number
  completionRate: number               // 0–100, 1 decimal
  dateLabel: string                    // "Mon, 13 Apr 2026"
  isToday: boolean
  isFuture: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE F0 — Finance Module Types
// ═══════════════════════════════════════════════════════════════════════════

export interface Transaction {
  id: string;           // nanoid()
  date: string;         // "YYYY-MM-DD"
  amount: number;       // ALWAYS positive. Direction is determined by `type`.
  type: 'income' | 'expense';
  categoryId: string;   // FK → FinCategory.id
  note?: string;        // optional description, max 200 chars
  tags?: string[];      // optional labels: ["coffee", "cafe"]
  createdAt: string;    // ISO timestamp: new Date().toISOString()
}

export interface FinCategory {
  id: string;
  name: string;                          // "Еда", "Транспорт", "Зарплата"
  type: 'income' | 'expense' | 'both';
  symbol: string;                        // SINGLE char: "▸", "◆", "●", "◌", "▪", "◇", "⬡", "·"
  color: 'dim' | 'bright' | 'accent';   // Terminal palette (from tokens.css)
  isDefault: boolean;                    // true = system category, cannot delete
  sortOrder: number;
}

export interface Budget {
  id: string;
  categoryId: string;   // FK → FinCategory.id
  month: string;        // "YYYY-MM", e.g. "2026-04"
  limitAmount: number;  // monthly spend limit
}

export interface FinancialGoal {
  id: string;
  name: string;              // "Buy laptop", "Emergency fund"
  targetAmount: number;      // goal target (> 0)
  currentAmount: number;     // amount saved so far (≥ 0)
  deadline?: string;         // optional: "YYYY-MM-DD"
  categoryTag?: string;      // optional category linkage
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

// VIEW types — computed in finEngine.ts, never stored in DB
export interface BudgetStatus {
  categoryId: string;
  spent: number;
  limit: number;
  usagePercent: number;   // 0-100+
  overBudget: boolean;    // spent > limit
  warning: boolean;       // usagePercent >= 80 && !overBudget
}

export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;          // totalIncome - totalExpense
  savingsRate: number;      // (balance / totalIncome) * 100; 0 if income = 0
  txCount: number;          // number of transactions (NOT number of categories)
  budgetStatus: BudgetStatus[];
}

export interface GoalProgress {
  percent: number;        // 0–100
  remaining: number;      // targetAmount - currentAmount
  onTrack: boolean;       // on schedule considering deadline
  daysLeft?: number;      // if deadline exists
  expectedPercent: number; // expected % by now (0 if no deadline)
}

// ── Computed result types for finEngine.ts ──────────────────────────

export interface BalanceResult {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;    // 0-100, %
}

export interface CategoryTotal {
  categoryId: string;
  total: number;
  txCount: number;        // number of transactions (not distinct!)
  avgPerTx: number;
}

export interface TopCategory extends CategoryTotal {
  rank: number;
  sharePercent: number;   // % of total expenses/income
}

export interface SparklineData {
  chars: string;          // "▁▂▃▄▅▆▇█" string
  values: number[];       // source values (normalized >= 0)
  max: number;
  avg: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE F8 — Finance Export / Import
// ═══════════════════════════════════════════════════════════════════════════

/** Scope for CSV export: current month or entire history. */
export type CsvExportScope = 'month' | 'all'

/** Options passed to exportTransactionsCSV(). */
export interface CsvExportOptions {
  scope: CsvExportScope
  /** Required when scope === 'month'. Format: "YYYY-MM". */
  month?: string
}

/** Full financial module backup payload — all 4 Dexie finance tables. */
export interface FinanceBackupData {
  version: 1
  exportedAt: string               // ISO datetime
  transactions: Transaction[]
  finCategories: FinCategory[]
  budgets: Budget[]
  financialGoals: FinancialGoal[]
}

/** Status of a finance JSON import operation. */
export type FinanceImportStatus = 'success' | 'error' | 'idle'

/** Result returned by importFinanceJSON(). */
export interface FinanceImportResult {
  status: FinanceImportStatus
  transactionsImported: number
  categoriesImported: number
  budgetsImported: number
  goalsImported: number
  errorMessage?: string
}

// ═══════════════════════════════════════════════════════════════
//  SCHEME — Risograph ink-drum color scheme
// ═══════════════════════════════════════════════════════════════

export type SchemeName = 'sun-sea' | 'flora' | 'midnight' | 'copperplate'

export const SCHEME_NAMES: SchemeName[] = ['sun-sea', 'flora', 'midnight', 'copperplate']
