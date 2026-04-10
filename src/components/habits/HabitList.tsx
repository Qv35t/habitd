import { useLiveQuery } from 'dexie-react-hooks'
import { format, subDays } from 'date-fns'
import { HabitRow } from './HabitRow'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/useUIStore'
import { db } from '@/db'
import type { Completion } from '@/types'

/**
 * List of all active habits with reactive data from Dexie.
 *
 * Data:
 *  - habits: active (archivedAt === ''), sorted by sortOrder ASC
 *  - completions: all completions in the last 7 days (one query for all habits)
 *
 * Optimization: single useLiveQuery for completions, not one per habit.
 * Filtering by habitId done in render via completionsByHabit Map.
 */
export function HabitList() {
  const { openAddModal } = useUIStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')

  // Reactive query for active habits
  const habits = useLiveQuery(
    () => db.habits.where('archivedAt').equals('').sortBy('sortOrder'),
    []
  )

  // Reactive query for completions in last 7 days (all habits, one query)
  const recentCompletions = useLiveQuery(
    () =>
      db.completions
        .where('date')
        .between(sevenDaysAgo, today, true, true)
        .toArray(),
    [sevenDaysAgo, today]
  ) as Completion[] | undefined

  // Loading state — useLiveQuery returns undefined before first resolve
  if (habits === undefined || recentCompletions === undefined) {
    return (
      <div className="habit-list-loading" aria-busy="true" aria-label="Loading habits">
        <span className="text-muted">loading...</span>
      </div>
    )
  }

  // Group completions by habitId for O(1) lookup in HabitRow
  const completionsByHabit = new Map<string, Set<string>>()
  const completionDatesByHabit = new Map<string, string[]>()

  for (const c of recentCompletions) {
    if (!completionsByHabit.has(c.habitId)) {
      completionsByHabit.set(c.habitId, new Set())
      completionDatesByHabit.set(c.habitId, [])
    }
    completionsByHabit.get(c.habitId)!.add(c.date)
    completionDatesByHabit.get(c.habitId)!.push(c.date)
  }

  // Empty state
  if (habits.length === 0) {
    return (
      <div className="habit-list-empty">
        <p className="text-muted">no habits yet.</p>
        <p className="text-muted">
          press{' '}
          <Button variant="ghost" onClick={openAddModal}>
            [+ add habit]
          </Button>{' '}
          to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="habit-list" role="list" aria-label="Active habits">
      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          completedDatesSet={completionsByHabit.get(habit.id) ?? new Set()}
          completedDates={completionDatesByHabit.get(habit.id) ?? []}
          today={today}
        />
      ))}

      {/* Add habit button */}
      <div className="habit-list-add">
        <Button variant="ghost" onClick={openAddModal}>
          [+ add habit]
        </Button>
      </div>
    </div>
  )
}
