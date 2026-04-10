// Integration tests for Dexie CRUD hooks.
// IndexedDB polyfilled via fake-indexeddb/auto (setup in test/setup.ts).
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/db'
import { addHabit, updateHabit, deleteHabit, archiveHabit, restoreHabit } from '@/hooks/useHabits'
import { toggleCompletion, isCompleted, getCompletedDatesForHabit } from '@/hooks/useCompletions'

beforeEach(async () => {
  await db.habits.clear()
  await db.completions.clear()
})

afterEach(async () => {
  await db.habits.clear()
  await db.completions.clear()
})

// ── addHabit ─────────────────────────────────────────────────────

describe('addHabit', () => {
  it('creates a habit and returns a string id', async () => {
    const id = await addHabit({ name: 'Morning run', symbol: '●', accentChar: 'bright' })
    expect(typeof id).toBe('string')
    const h = await db.habits.get(id)
    expect(h?.name).toBe('Morning run')
    expect(h?.archivedAt).toBe('')
  })
  it('increments sortOrder for each new habit', async () => {
    const id1 = await addHabit({ name: 'A', symbol: '●', accentChar: 'dim' })
    const id2 = await addHabit({ name: 'B', symbol: '◆', accentChar: 'dim' })
    const [h1, h2] = await Promise.all([db.habits.get(id1), db.habits.get(id2)])
    expect(h2!.sortOrder).toBeGreaterThan(h1!.sortOrder)
  })
  it('throws on empty name', async () => {
    await expect(
      addHabit({ name: '', symbol: '●', accentChar: 'bright' })
    ).rejects.toThrow('Validation failed')
  })
  it('throws on invalid symbol', async () => {
    await expect(
      addHabit({ name: 'Test', symbol: '🔥', accentChar: 'bright' })
    ).rejects.toThrow('Validation failed')
  })
})

// ── updateHabit ──────────────────────────────────────────────────

describe('updateHabit', () => {
  it('updates name', async () => {
    const id = await addHabit({ name: 'Old name', symbol: '●', accentChar: 'dim' })
    await updateHabit(id, { name: 'New name' })
    const habit = await db.habits.get(id)
    expect(habit?.name).toBe('New name')
  })
  it('throws not found for missing id', async () => {
    await expect(updateHabit('nonexistent', { name: 'X' })).rejects.toThrow('not found')
  })
})

// ── archiveHabit / restoreHabit ──────────────────────────────────

describe('archiveHabit / restoreHabit', () => {
  it('sets archivedAt to a YYYY-MM-DD date string', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    await archiveHabit(id)
    const h = await db.habits.get(id)
    expect(h?.archivedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('restores archived habit to active (archivedAt = "")', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    await archiveHabit(id)
    await restoreHabit(id)
    const h = await db.habits.get(id)
    expect(h?.archivedAt).toBe('')
  })
})

// ── deleteHabit (cascade) ────────────────────────────────────────

describe('deleteHabit (cascade)', () => {
  it('deletes habit AND all its completions atomically', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    await toggleCompletion(id, '2026-04-01')
    await toggleCompletion(id, '2026-04-02')
    await toggleCompletion(id, '2026-04-03')
    expect(await db.completions.where('habitId').equals(id).count()).toBe(3)
    await deleteHabit(id)
    expect(await db.habits.get(id)).toBeUndefined()
    expect(await db.completions.where('habitId').equals(id).count()).toBe(0)
  })
  it('throws not found for ghost id', async () => {
    await expect(deleteHabit('ghost')).rejects.toThrow('not found')
  })
})

// ── toggleCompletion ─────────────────────────────────────────────

describe('toggleCompletion', () => {
  it('returns "added" when no completion exists', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    expect(await toggleCompletion(id, '2026-04-10')).toBe('added')
    expect(await isCompleted(id, '2026-04-10')).toBe(true)
  })
  it('returns "removed" when completion exists', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    await toggleCompletion(id, '2026-04-10')
    expect(await toggleCompletion(id, '2026-04-10')).toBe('removed')
    expect(await isCompleted(id, '2026-04-10')).toBe(false)
  })
  it('no duplicates after add → remove → add cycle', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    await toggleCompletion(id, '2026-04-10')
    await toggleCompletion(id, '2026-04-10')
    await toggleCompletion(id, '2026-04-10')
    expect(await db.completions.where('habitId').equals(id).count()).toBe(1)
  })
  it('throws Validation failed on invalid date format', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    await expect(toggleCompletion(id, '2026/04/10')).rejects.toThrow('Validation failed')
  })
})

// ── getCompletedDatesForHabit ────────────────────────────────────

describe('getCompletedDatesForHabit', () => {
  it('returns dates in ascending order', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    await toggleCompletion(id, '2026-04-03')
    await toggleCompletion(id, '2026-04-01')
    await toggleCompletion(id, '2026-04-02')
    expect(await getCompletedDatesForHabit(id))
      .toEqual(['2026-04-01', '2026-04-02', '2026-04-03'])
  })
  it('returns empty array when no completions', async () => {
    const id = await addHabit({ name: 'T', symbol: '●', accentChar: 'dim' })
    expect(await getCompletedDatesForHabit(id)).toEqual([])
  })
})
