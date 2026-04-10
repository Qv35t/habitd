import Dexie, { type EntityTable } from 'dexie'
import type { Habit, Completion } from '@/types'

class HabitDB extends Dexie {
  habits!: EntityTable<Habit, 'id'>
  completions!: EntityTable<Completion, 'id'>

  constructor() {
    super('habitd')

    // Version 1: initial schema
    // habits index: id (PK), createdAt, archivedAt, sortOrder
    // completions index: id (PK), habitId, date, compound [habitId+date]
    // NOTE: archivedAt indexed as string — active habits store '' (empty string)
    // This allows .where('archivedAt').equals('') to efficiently list active habits
    // [habitId+date] compound index — O(log n) duplicate completion check
    this.version(1).stores({
      habits:      'id, createdAt, archivedAt, sortOrder',
      completions: 'id, habitId, date, [habitId+date]',
    })
  }
}

// Singleton instance — import { db } from '@/db' everywhere
export const db = new HabitDB()
export type { HabitDB }
