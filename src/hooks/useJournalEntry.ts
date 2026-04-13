/**
 * useJournalEntry — composite Dexie hook for JournalView.
 * Reads entry, habits, completions for a given date.
 * Provides saveContent and saveMood upsert functions.
 */
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { nanoid } from 'nanoid'
import { db } from '../db'
import {
  getJournalDateLabel,
  isJournalDateFuture,
  createJournalEntry,
} from '../utils/journal'
import type { JournalViewData, MoodLevel } from '../types'

/**
 * Assembles all JournalView data from Dexie for a given date.
 * @param date - YYYY-MM-DD
 */
export function useJournalEntry(date: string): JournalViewData & {
  saveContent: (content: string) => Promise<void>
  saveMood: (mood: MoodLevel) => Promise<void>
} {
  const today = format(new Date(), 'yyyy-MM-dd')

  const entry = useLiveQuery(
    () => db.notes.where('date').equals(date).first(),
    [date],
  )

  const habits = useLiveQuery(
    () => db.habits.where('archivedAt').equals('').sortBy('sortOrder'),
    [],
  )

  const completions = useLiveQuery(
    () => db.completions.where('date').equals(date).toArray(),
    [date],
  )

  const data = useMemo<JournalViewData>(() => {
    // Only habits and completions being undefined means "still loading from Dexie"
    // entry can be undefined (no record yet) — valid non-loading state
    if (habits === undefined || completions === undefined) {
      return {
        isLoading: true,
        entry: null,
        habits: [],
        completedCount: 0,
        totalCount: 0,
        completionRate: 0,
        dateLabel: '',
        isToday: false,
        isFuture: false,
      }
    }

    const resolvedEntry = entry !== undefined ? entry : null
    const completedIds = new Set(completions.map(c => c.habitId))
    const habitItems = habits.map(h => ({
      id: h.id,
      name: h.name,
      symbol: h.symbol,
      isCompleted: completedIds.has(h.id),
    }))
    const completedCount = habitItems.filter(h => h.isCompleted).length
    const totalCount = habitItems.length
    const completionRate = totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * 1000) / 10

    return {
      isLoading: false,
      entry: resolvedEntry,
      habits: habitItems,
      completedCount,
      totalCount,
      completionRate,
      dateLabel: getJournalDateLabel(date),
      isToday: date === today,
      isFuture: isJournalDateFuture(date, today),
    }
  }, [entry, habits, completions, date, today])

  /** Upserts the journal entry content for the current date. */
  const saveContent = useCallback(async (content: string) => {
    try {
      const existing = await db.notes.where('date').equals(date).first()
      if (existing) {
        await db.notes.update(existing.id, { content, updatedAt: new Date().toISOString() })
      } else {
        await db.notes.add({ id: nanoid(), ...createJournalEntry(date, content, 0) })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[useJournalEntry] saveContent failed:', err)
      throw err
    }
  }, [date])

  /** Upserts the journal entry mood for the current date. */
  const saveMood = useCallback(async (mood: MoodLevel) => {
    try {
      const existing = await db.notes.where('date').equals(date).first()
      if (existing) {
        await db.notes.update(existing.id, { mood, updatedAt: new Date().toISOString() })
      } else {
        await db.notes.add({ id: nanoid(), ...createJournalEntry(date, '', mood) })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[useJournalEntry] saveMood failed:', err)
      throw err
    }
  }, [date])

  return { ...data, saveContent, saveMood }
}
