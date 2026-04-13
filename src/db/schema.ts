import Dexie, { type EntityTable } from 'dexie'
import type { Habit, Completion, Task, JournalEntry } from '@/types'

class HabitDB extends Dexie {
  habits!:      EntityTable<Habit, 'id'>
  completions!: EntityTable<Completion, 'id'>
  tasks!:       EntityTable<Task, 'id'>
  notes!:       EntityTable<JournalEntry, 'id'>

  constructor() {
    super('habitd')

    // Version 1: initial schema
    this.version(1).stores({
      habits:      'id, createdAt, archivedAt, sortOrder',
      completions: 'id, habitId, date, [habitId+date]',
    })

    // Version 2: tasks table
    this.version(2).stores({
      habits:      'id, createdAt, archivedAt, sortOrder',
      completions: 'id, habitId, date, [habitId+date]',
      tasks:       'id, date, scope, weekKey, done, [scope+date], sortOrder',
    })

    // Version 3: notes table (JournalView)
    this.version(3).stores({
      habits:      'id, createdAt, archivedAt, sortOrder',
      completions: 'id, habitId, date, [habitId+date]',
      tasks:       'id, date, scope, weekKey, done, [scope+date], sortOrder',
      notes:       'id, date, createdAt, updatedAt',
    })
  }
}

// Singleton instance — import { db } from '@/db' everywhere
export const db = new HabitDB()
export type { HabitDB }
