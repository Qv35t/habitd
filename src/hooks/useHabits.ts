import { useLiveQuery } from 'dexie-react-hooks'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import { db } from '@/db'
import { validateHabitCreate, validateHabitUpdate } from '@/schemas'
import type { Habit } from '@/types'

// ── Reactive Queries (useLiveQuery) ───────────────────────────────

/**
 * Returns all ACTIVE habits sorted by sortOrder ASC.
 * Reactively updates when IndexedDB changes.
 * archivedAt === '' means active (Dexie compound index requirement).
 */
export function useActiveHabits(): Habit[] | undefined {
  return useLiveQuery(
    () => db.habits.where('archivedAt').equals('').sortBy('sortOrder'),
    []
  )
}

/**
 * Returns all ARCHIVED habits (soft-deleted).
 */
export function useArchivedHabits(): Habit[] | undefined {
  return useLiveQuery(
    () =>
      db.habits
        .filter((h) => typeof h.archivedAt === 'string' && h.archivedAt !== '')
        .sortBy('sortOrder'),
    []
  )
}

/**
 * Returns a single habit by id. Returns undefined if not found.
 */
export function useHabitById(id: string): Habit | undefined {
  return useLiveQuery(() => db.habits.get(id), [id])
}

// ── Mutation Functions (non-reactive, call in event handlers) ─────

/**
 * Add a new habit.
 * Validates with Zod before writing to Dexie.
 * sortOrder = current max + 1 (append to end of list).
 * @throws if validation fails
 */
export async function addHabit(
  input: { name: string; symbol: string; accentChar: string }
): Promise<string> {
  const validated = validateHabitCreate(input)

  const existing = await db.habits.where('archivedAt').equals('').toArray()
  const maxOrder = existing.length > 0
    ? Math.max(...existing.map((h) => h.sortOrder))
    : -1

  const habit: Habit = {
    id:         nanoid(),
    name:       validated.name,
    symbol:     validated.symbol,
    accentChar: validated.accentChar,
    createdAt:  format(new Date(), 'yyyy-MM-dd'),
    archivedAt: '',        // empty string = active (Dexie index requirement)
    sortOrder:  maxOrder + 1,
  }

  await db.habits.add(habit)
  return habit.id
}

/**
 * Update an existing habit (partial update).
 * Validates with Zod before writing to Dexie.
 * @throws if habit not found or validation fails
 */
export async function updateHabit(
  id: string,
  patch: { name?: string; symbol?: string; accentChar?: string }
): Promise<void> {
  const validated = validateHabitUpdate(patch)

  const existing = await db.habits.get(id)
  if (!existing) throw new Error(`Habit not found: ${id}`)

  await db.habits.update(id, validated)
}

/**
 * Soft-delete a habit: sets archivedAt to today's date.
 * The habit remains in IndexedDB and is filterable.
 * @throws if habit not found
 */
export async function archiveHabit(id: string): Promise<void> {
  const existing = await db.habits.get(id)
  if (!existing) throw new Error(`Habit not found: ${id}`)

  await db.habits.update(id, {
    archivedAt: format(new Date(), 'yyyy-MM-dd'),
  })
}

/**
 * Restore an archived habit to active state.
 * @throws if habit not found
 */
export async function restoreHabit(id: string): Promise<void> {
  const existing = await db.habits.get(id)
  if (!existing) throw new Error(`Habit not found: ${id}`)

  await db.habits.update(id, { archivedAt: '' })
}

/**
 * Permanently delete a habit AND all its completions (cascade).
 * Uses Dexie.transaction() for atomicity.
 * @throws if habit not found
 */
export async function deleteHabit(id: string): Promise<void> {
  await db.transaction('rw', db.habits, db.completions, async () => {
    const existing = await db.habits.get(id)
    if (!existing) throw new Error(`Habit not found: ${id}`)

    // CASCADE: delete all completions for this habit first
    await db.completions.where('habitId').equals(id).delete()

    // Then delete the habit itself
    await db.habits.delete(id)
  })
}

/**
 * Reorder habits by updating sortOrder values.
 * Pass the full ordered array of habit ids.
 */
export async function reorderHabits(orderedIds: string[]): Promise<void> {
  await db.transaction('rw', db.habits, async () => {
    const updates = orderedIds.map((id, index) =>
      db.habits.update(id, { sortOrder: index })
    )
    await Promise.all(updates)
  })
}
