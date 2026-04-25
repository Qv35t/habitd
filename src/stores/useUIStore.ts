/**
 * useUIStore — global UI state (NOT habit data).
 *
 * Stores:
 *  - activeView: current navigation screen
 *  - selectedDate: selected date (for Calendar view)
 *  - modal: modal dialog state (add/edit/confirm)
 *
 * DOES NOT store: habits[], completions[] — those are Dexie via useLiveQuery.
 */
import { create } from 'zustand'
import { format } from 'date-fns'
import { todayYearMonth } from '@/utils/calendar'
import i18n from '@/i18n'
import type {
  Habit,
  StatsPeriod,
  HabitFilter,
  SettingsSection,
  ConfirmModalState,
  ImportResult,
  TaskFilter,
} from '@/types'

type Theme = 'terminal-dark' | 'terminal-dim'

export type FinanceTab = 'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics';

export type LocaleLayout = 'en' | 'ru';

type ActiveView = 'home' | 'habits' | 'calendar' | 'week' | 'journal' | 'stats' | 'tasks' | 'finance' | 'settings' | 'help'

type ModalState =
  | { type: 'closed' }
  | { type: 'add' }
  | { type: 'edit'; habit: Habit }
  | { type: 'confirmDelete'; habitId: string; habitName: string }

interface UIStore {
  // Navigation
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void

  // Date selection (Calendar view)
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void

  // Modal state
  modal: ModalState
  openAddModal: () => void
  openEditModal: (habit: Habit) => void
  openConfirmDeleteModal: (habitId: string, habitName: string) => void
  closeModal: () => void

  // Calendar navigation state
  calendarYear: number
  calendarMonth: number         // 0-indexed (JS convention): Jan=0, Dec=11
  selectedCalendarDate: string | null  // YYYY-MM-DD or null
  setCalendarMonth: (year: number, month: number) => void
  setSelectedCalendarDate: (date: string | null) => void

  // Stats view filters
  statsPeriod: StatsPeriod
  statsHabitFilter: HabitFilter
  setStatsPeriod: (p: StatsPeriod) => void
  setStatsHabitFilter: (f: HabitFilter) => void

  // Settings view state (Phase 6)
  settingsSection: SettingsSection
  confirmModal: ConfirmModalState | null
  importResult: ImportResult
  setSettingsSection: (s: SettingsSection) => void
  openConfirmModal: (state: ConfirmModalState) => void
  closeConfirmModal: () => void
  setImportResult: (r: ImportResult) => void

  // Phase 8: Keyboard nav, help, theme
  selectedHabitIndex: number
  helpOpen: boolean
  theme: Theme
  setSelectedHabitIndex: (i: number) => void
  setHelpOpen: (v: boolean) => void
  setTheme: (t: Theme) => void

  // Phase 9: Tasks view state
  tasksActiveDate: string
  tasksFilter: TaskFilter
  tasksWeeklyFilter: TaskFilter
  setTasksActiveDate: (date: string) => void
  setTasksFilter: (filter: TaskFilter) => void
  setTasksWeeklyFilter: (filter: TaskFilter) => void

  // Phase 10: WeekView state
  weekOffset: number
  setWeekOffset: (offset: number) => void
  resetWeekToToday: () => void

  // Phase 11: JournalView state
  journalDate: string
  setJournalDate: (date: string) => void
  resetJournalToToday: () => void

  // Phase F8: Finance import state
  finImportResult: { status: import("@/types").FinanceImportStatus; transactionsImported: number; categoriesImported: number; budgetsImported: number; goalsImported: number; errorMessage?: string }
  setFinImportResult: (r: { status: import("@/types").FinanceImportStatus; transactionsImported: number; categoriesImported: number; budgetsImported: number; goalsImported: number; errorMessage?: string }) => void

  // Phase F2: FinanceView state
  financeTab: FinanceTab
  setFinanceTab: (tab: FinanceTab) => void

  // Phase 9: Locale and selection state
  localeLayout: LocaleLayout
  setLocaleLayout: (layout: LocaleLayout) => void
  selectedTxId: string | null
  setSelectedTxId: (id: string | null) => void
}

export type { Theme }
export const useUIStore = create<UIStore>((set) => ({
  activeView: 'home',
  setActiveView: (view) => set({ activeView: view }),

  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),

  modal: { type: 'closed' },
  openAddModal: () => set({ modal: { type: 'add' } }),
  openEditModal: (habit) => set({ modal: { type: 'edit', habit } }),
  openConfirmDeleteModal: (habitId, habitName) =>
    set({ modal: { type: 'confirmDelete', habitId, habitName } }),
  closeModal: () => set({ modal: { type: 'closed' } }),

  calendarYear: todayYearMonth().year,
  calendarMonth: todayYearMonth().month,
  selectedCalendarDate: null,
  setCalendarMonth: (year, month) => set({ calendarYear: year, calendarMonth: month }),
  setSelectedCalendarDate: (date) => set({ selectedCalendarDate: date }),

  statsPeriod: '30d',
  statsHabitFilter: 'active',
  setStatsPeriod: (p) => set({ statsPeriod: p }),
  setStatsHabitFilter: (f) => set({ statsHabitFilter: f }),

  // Phase 6 settings state
  settingsSection: 'data',
  confirmModal: null,
  importResult: { status: 'idle', habitsImported: 0, completionsImported: 0 },
  setSettingsSection: (s) => set({ settingsSection: s }),
  openConfirmModal: (state) => set({ confirmModal: state }),
  closeConfirmModal: () => set({ confirmModal: null }),
  setImportResult: (r) => set({ importResult: r }),

  // Phase 8
  selectedHabitIndex: 0,
  helpOpen: false,
  theme: (localStorage.getItem('habitd-theme') as Theme) ?? 'terminal-dark',
  setSelectedHabitIndex: (i) => set({ selectedHabitIndex: i }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  setTheme: (t) => {
    localStorage.setItem('habitd-theme', t)
    set({ theme: t })
    document.documentElement.setAttribute('data-theme', t)
  },

  // Phase 9: Tasks view state
  tasksActiveDate: format(new Date(), 'yyyy-MM-dd'),
  tasksFilter: 'all',
  tasksWeeklyFilter: 'all',
  setTasksActiveDate: (date) => set({ tasksActiveDate: date }),
  setTasksFilter: (filter) => set({ tasksFilter: filter }),
  setTasksWeeklyFilter: (filter) => set({ tasksWeeklyFilter: filter }),

  // Phase 10
  weekOffset: 0,
  setWeekOffset: (offset) => set({ weekOffset: offset }),
  resetWeekToToday: () => set({ weekOffset: 0 }),

  // Phase 11
  journalDate: format(new Date(), 'yyyy-MM-dd'),
  setJournalDate: (date) => set({ journalDate: date }),
  resetJournalToToday: () => set({ journalDate: format(new Date(), 'yyyy-MM-dd') }),

  // Phase F2
  financeTab: 'overview' as FinanceTab,
  setFinanceTab: (tab) => set({ financeTab: tab }),

  // Phase F8
  finImportResult: { status: 'idle', transactionsImported: 0, categoriesImported: 0, budgetsImported: 0, goalsImported: 0 },
  setFinImportResult: (r) => set({ finImportResult: r }),

  // Phase 9
  localeLayout: (localStorage.getItem('habitd-locale') as LocaleLayout) ?? 'en',
  setLocaleLayout: (layout) => {
    localStorage.setItem('habitd-locale', layout)
    i18n.changeLanguage(layout)
    set({ localeLayout: layout })
  },
  selectedTxId: null,
  setSelectedTxId: (id) => set({ selectedTxId: id }),
}))
