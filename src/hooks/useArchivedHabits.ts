import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { Habit } from '@/types'

/**
 * Returns all archived habits sorted by archivedAt descending.
 *
 * @returns Habit[] | undefined (undefined while loading)
 */
export function useArchivedHabits(): Habit[] | undefined {
  return useLiveQuery(
    () =>
      db.habits
        .filter((h) => Boolean(h.archivedAt) && h.archivedAt !== '')
        .toArray()
        .then((list) =>
          list.sort((a, b) =>
            (b.archivedAt ?? '').localeCompare(a.archivedAt ?? '')
          )
        ),
    []
  )
}
