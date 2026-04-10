import { create } from 'zustand'
import type { ViewName } from '@/types'
import { format } from 'date-fns'

interface UIState {
  activeView: ViewName
  selectedDate: string       // 'YYYY-MM-DD'
  isHabitFormOpen: boolean
  editingHabitId: string | null

  setActiveView: (view: ViewName) => void
  setSelectedDate: (date: string) => void
  openHabitForm: (habitId?: string) => void
  closeHabitForm: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'habits',
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  isHabitFormOpen: false,
  editingHabitId: null,

  setActiveView: (view) => set({ activeView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  openHabitForm: (habitId) => set({ isHabitFormOpen: true, editingHabitId: habitId ?? null }),
  closeHabitForm: () => set({ isHabitFormOpen: false, editingHabitId: null }),
}))
