import { useLiveQuery } from 'dexie-react-hooks'
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { validateCompletion } from '@/schemas'
import type { Completion } from '@/types'

// ── Reactive Queries (useLiveQuery) ───────────────────────────────

/**
 * Returns all completions for a specific habit in a date range.
 * from/to are inclusive 'YYYY-MM-DD' strings.
 * Reactively updates when IndexedDB changes.
 */
export function useCompletionsForHabit(
  habitId: string,
  from: string,
  to: string
): Completion[] | undefined {
  return useLiveQuery(
    () =>
      db.completions
        .where('habitId')
        .equals(habitId)
        .and((c) => c.date >= from && c.date <= to)
        .toArray(),
    [habitId, from, to]
  )
}

/**
 * Returns all completions for ALL habits on a specific date.
 * Used in CalendarView DayCell and StatusBar.
 */
export function useCompletionsForDate(date: string): Completion[] | undefined {
  return useLiveQuery(
    () => db.completions.where('date').equals(date).toArray(),
    [date]
  )
}

/**
 * Returns all completions for a single habit (no date range).
 * Used by streak engine to compute all-time stats.
 */
export function useAllCompletionsForHabit(habitId: string): Completion[] | undefined {
  return useLiveQuery(
    () => db.completions.where('habitId').equals(habitId).toArray(),
    [habitId]
  )
}

// ── Non-reactive Helpers (for streak engine / stats) ──────────────

/**
 * Fetch completions for a habit in a date range (non-reactive, one-shot).
 * Use in computations, NOT in React components (use hooks above instead).
 */
export async function getCompletionsForHabit(
  habitId: string,
  from: string,
  to: string
): Promise<Completion[]> {
  return db.completions
    .where('habitId')
    .equals(habitId)
    .and((c) => c.date >= from && c.date <= to)
    .toArray()
}

/**
 * Fetch all completions for a specific date (non-reactive).
 */
export async function getCompletionsForDate(date: string): Promise<Completion[]> {
  return db.completions.where('date').equals(date).toArray()
}

// ── Mutation Functions ────────────────────────────────────────────

/**
 * Toggle a completion for a habit on a specific date.
 * If completion exists → delete it (uncheck).
 * If completion doesn't exist → create it (check).
 *
 * Uses compound index [habitId+date] for O(log n) lookup.
 * Validates input with Zod before any DB operation.
 *
 * @returns 'added' | 'removed'
 * @throws if validation fails
 */
export async function toggleCompletion(
  habitId: string,
  date: string
): Promise<'added' | 'removed'> {
  validateCompletion({ habitId, date })

  const existing = await db.completions
    .where('[habitId+date]')
    .equals([habitId, date])
    .first()

  if (existing) {
    await db.completions.delete(existing.id)
    return 'removed'
  } else {
    const completion: Completion = {
      id:      nanoid(),
      habitId,
      date,
    }
    await db.completions.add(completion)
    return 'added'
  }
}

/**
 * Check if a specific completion exists (non-reactive).
 * @returns boolean
 */
export async function isCompleted(habitId: string, date: string): Promise<boolean> {
  const count = await db.completions
    .where('[habitId+date]')
    .equals([habitId, date])
    .count()
  return count > 0
}

/**
 * Bulk-fetch dates completed for a habit (for streak engine).
 * Returns sorted array of 'YYYY-MM-DD' strings ASC.
 */
export async function getCompletedDatesForHabit(habitId: string): Promise<string[]> {
  const completions = await db.completions
    .where('habitId')
    .equals(habitId)
    .toArray()
  return completions.map((c) => c.date).sort()
}

/**
 * Returns ALL completions for ALL habits within a given month.
 * Used by CalendarView to build the completion map for the entire grid.
 * `monthStart` and `monthEnd` are YYYY-MM-DD strings (inclusive).
 * Reactively updates via useLiveQuery.
 */
export function useCompletionsForMonth(
  monthStart: string,
  monthEnd: string
): Completion[] | undefined {
  return useLiveQuery(
    () =>
      db.completions
        .where('date')
        .between(monthStart, monthEnd, true, true)
        .toArray(),
    [monthStart, monthEnd]
  )
}
