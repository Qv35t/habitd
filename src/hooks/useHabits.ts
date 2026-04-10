// Full implementation in Phase 1
// Phase 0: stub — prevents import errors in layout components

export function useHabits() {
  return {
    habits: [] as import('@/types').Habit[],
    isLoading: false,
  }
}
