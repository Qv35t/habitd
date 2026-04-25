import Dexie, { type EntityTable } from 'dexie'
import type { Habit, Completion, Task, JournalEntry, Transaction, FinCategory, Budget, FinancialGoal } from '@/types'
import { seedDefaultCategories } from './migrations/seedDefaultCategories'

class HabitDB extends Dexie {
  habits!:      EntityTable<Habit, 'id'>
  completions!: EntityTable<Completion, 'id'>
  tasks!:       EntityTable<Task, 'id'>
  notes!:       EntityTable<JournalEntry, 'id'>
  // ── Finance tables (v4) ──────────────────────────────────
  transactions!:   EntityTable<Transaction, 'id'>
  finCategories!:  EntityTable<FinCategory, 'id'>
  budgets!:        EntityTable<Budget, 'id'>
  financialGoals!: EntityTable<FinancialGoal, 'id'>

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

    // Version 4: finance module
    this.version(4).stores({
      // Existing tables — copy exactly, do not change indexes
      habits:      'id, createdAt, archivedAt, sortOrder',
      completions: 'id, habitId, date, [habitId+date]',
      tasks:       'id, date, scope, weekKey, done, [scope+date], sortOrder',
      notes:       'id, date, createdAt, updatedAt',
      // New finance tables
      transactions:   'id, date, type, categoryId, createdAt, [type+date]',
      finCategories:  'id, type, sortOrder',
      budgets:        'id, categoryId, month, [categoryId+month]',
      financialGoals: 'id, status, createdAt',
    }).upgrade(async (tx) => {
      // Seed default categories ONLY on first upgrade to v4
      const existingCount = await tx.table('finCategories').count();
      if (existingCount === 0) {
        await seedDefaultCategories(tx);
      }
    });
  }
}

// Singleton instance — import { db } from '@/db' everywhere
export const db = new HabitDB()
export type { HabitDB }
