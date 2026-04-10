// Full implementation in Phase 1
// Phase 0: stub

export function useCompletions(_habitId?: string) {
  return {
    completions: [] as import('@/types').Completion[],
    toggle: async (_habitId: string, _date: string) => {},
  }
}
