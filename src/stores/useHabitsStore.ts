/**
 * useHabitsStore — UI state for habits operations.
 *
 * SCOPE: Only UI concerns (loading, error, optimistic UI state).
 * DO NOT store habits[] or completions[] here — use useLiveQuery hooks.
 *
 * Dexie is the source of truth.
 * useLiveQuery subscriptions in components ARE the reactive layer.
 * Zustand here handles: async operation status, error messages.
 */

import { create } from 'zustand'

interface HabitsUIState {
  // Async operation status
  isAdding: boolean
  isUpdating: boolean
  isDeleting: boolean
  operationError: string | null

  // Set loading state for add operation
  setAdding: (value: boolean) => void
  // Set loading state for update/archive operation
  setUpdating: (value: boolean) => void
  // Set loading state for delete operation
  setDeleting: (value: boolean) => void
  // Set error message (null = clear error)
  setOperationError: (message: string | null) => void
  // Reset all async state
  resetOperationState: () => void
}

export const useHabitsStore = create<HabitsUIState>((set) => ({
  isAdding:       false,
  isUpdating:     false,
  isDeleting:     false,
  operationError: null,

  setAdding:          (value) => set({ isAdding: value }),
  setUpdating:        (value) => set({ isUpdating: value }),
  setDeleting:        (value) => set({ isDeleting: value }),
  setOperationError:  (message) => set({ operationError: message }),
  resetOperationState: () =>
    set({ isAdding: false, isUpdating: false, isDeleting: false, operationError: null }),
}))
