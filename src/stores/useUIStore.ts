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
import { todayYearMonth } from '@/utils/calendar'
import type { Habit, StatsPeriod, HabitFilter } from '@/types'

type ActiveView = 'habits' | 'calendar' | 'stats' | 'settings'

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
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: 'habits',
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
}))
