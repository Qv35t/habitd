/**
 * useTasks — reactive queries and mutations for the Tasks feature.
 *
 * Dexie is the source of truth. useLiveQuery handles reactive subscriptions.
 * Zustand (useUIStore) holds only UI state (activeDate, filters).
 */
import { useLiveQuery } from 'dexie-react-hooks'
import { nanoid } from 'nanoid'
import {
  format,
  getISOWeek,
  getISOWeekYear,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { db } from '@/db'
import { validateTaskCreate, validateTaskUpdate } from '@/schemas'
import type {
  Task,
  TaskScope,
  TaskCounters,
  WeekRange,
} from '@/types'

// ── Utils ─────────────────────────────────────────────────────────

/**
 * Returns weekKey in format 'YYYY-WNN' for a given date.
 * Uses ISO week (Monday = start).
 * Example: '2026-W04'
 */
export function getWeekKey(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const week = String(getISOWeek(d)).padStart(2, '0')
  const year = getISOWeekYear(d)
  return `${year}-W${week}`
}

/**
 * Returns WeekRange for a given date (the week containing it, Mon–Sun).
 */
export function getWeekRange(date: string): WeekRange {
  const d = new Date(date + 'T00:00:00')
  const from = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const to = format(endOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekKey = getWeekKey(date)
  const monthsRu = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ]
  const fromD = new Date(from + 'T00:00:00')
  const toD = new Date(to + 'T00:00:00')
  const label = `${fromD.getDate()} ${monthsRu[fromD.getMonth()]} – ${toD.getDate()} ${monthsRu[toD.getMonth()]} ${toD.getFullYear()}`
  return { from, to, weekKey, label }
}

// ── Reactive Queries ──────────────────────────────────────────────

/**
 * Returns ALL daily tasks for a specific date.
 * Reactive — re-renders consumers automatically when IndexedDB changes.
 */
export function useTasksForDate(date: string): Task[] | undefined {
  return useLiveQuery(
    () =>
      db.tasks
        .where('[scope+date]')
        .equals(['daily', date])
        .sortBy('sortOrder'),
    [date]
  )
}

/**
 * Returns ALL weekly tasks for the week containing the given date.
 */
export function useTasksForWeek(date: string): Task[] | undefined {
  const weekKey = getWeekKey(date)
  return useLiveQuery(
    () =>
      db.tasks
        .where('weekKey')
        .equals(weekKey)
        .and((t) => t.scope === 'weekly')
        .sortBy('sortOrder'),
    [weekKey]
  )
}

/**
 * Returns task counters (DONE / LEFT / TOTAL / PERCENT) for a specific date.
 * Only counts daily tasks (scope: 'daily').
 */
export function useTaskCounters(date: string): TaskCounters {
  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where('[scope+date]')
        .equals(['daily', date])
        .toArray(),
    [date]
  )

  if (!tasks) return { done: 0, left: 0, total: 0, percent: 0 }

  const done = tasks.filter((t) => t.done === 1).length
  const total = tasks.length
  const left = total - done
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return { done, left, total, percent }
}

// ── Mutation Functions ────────────────────────────────────────────

/**
 * Add a new task.
 * scope: 'daily' — task for a specific day
 * scope: 'weekly' — task for the entire week
 *
 * @throws if Zod validation fails
 */
export async function addTask(
  text: string,
  scope: TaskScope,
  date: string
): Promise<string> {
  const validated = validateTaskCreate({ text, scope, date })

  // Determine sortOrder: max + 1 within the same group
  const existing =
    scope === 'daily'
      ? await db.tasks
          .where('[scope+date]')
          .equals(['daily', date])
          .toArray()
      : await db.tasks
          .where('weekKey')
          .equals(getWeekKey(date))
          .and((t) => t.scope === 'weekly')
          .toArray()

  const maxOrder =
    existing.length > 0
      ? Math.max(...existing.map((t) => t.sortOrder))
      : -1

  const task: Task = {
    id: nanoid(),
    text: validated.text,
    scope: validated.scope,
    date:
      validated.scope === 'daily'
        ? validated.date
        : getWeekRange(validated.date).from,
    weekKey: getWeekKey(validated.date),
    done: 0,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
    sortOrder: maxOrder + 1,
  }

  await db.tasks.add(task)
  return task.id
}

/**
 * Toggle task done state: 0 ↔ 1.
 * @throws if task not found
 */
export async function toggleTask(id: string): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) throw new Error(`Task not found: ${id}`)
  await db.tasks.update(id, { done: task.done === 0 ? 1 : 0 })
}

/**
 * Update task text.
 * @throws if task not found or validation fails
 */
export async function updateTaskText(
  id: string,
  text: string
): Promise<void> {
  const validated = validateTaskUpdate({ text })
  const task = await db.tasks.get(id)
  if (!task) throw new Error(`Task not found: ${id}`)
  await db.tasks.update(id, { text: validated.text })
}

/**
 * Delete a task permanently.
 * @throws if task not found
 */
export async function deleteTask(id: string): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) throw new Error(`Task not found: ${id}`)
  await db.tasks.delete(id)
}

/**
 * Delete ALL completed tasks for a date (archive).
 */
export async function archiveCompletedForDate(date: string): Promise<number> {
  return db.tasks
    .where('[scope+date]')
    .equals(['daily', date])
    .and((t) => t.done === 1)
    .delete()
}

/**
 * Carry over all incomplete daily tasks from one date to another.
 */
export async function carryOverTasks(
  fromDate: string,
  toDate: string
): Promise<void> {
  const pending = await db.tasks
    .where('[scope+date]')
    .equals(['daily', fromDate])
    .and((t) => t.done === 0)
    .toArray()

  if (pending.length === 0) return

  const toWeekKey = getWeekKey(toDate)

  await db.transaction('rw', db.tasks, async () => {
    for (const task of pending) {
      await db.tasks.update(task.id, {
        date: toDate,
        weekKey: toWeekKey,
      })
    }
  })
}
