import Dexie, { type EntityTable } from 'dexie'
import type { Habit, Completion } from '@/types'

class HabitDB extends Dexie {
  habits!: EntityTable<Habit, 'id'>
  completions!: EntityTable<Completion, 'id'>

  constructor() {
    super('habitd')

    this.version(1).stores({
      habits: 'id, createdAt, archivedAt, sortOrder',
      completions: 'id, habitId, date, [habitId+date]',
    })
  }
}

export const db = new HabitDB()
export type { HabitDB }
