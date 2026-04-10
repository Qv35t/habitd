import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { db } from '@/db'

const APP_VERSION = '0.1.0'

/**
 * Bottom status bar (like in an IDE).
 *
 * Format: habitd  •  habits: N  •  today: X/N  •  v0.1.0
 *
 * Data:
 *  - activeHabits: count of habits with archivedAt === ''
 *  - todayCompletions: how many habits completed today
 *
 * useLiveQuery — reactively updates on any IndexedDB change.
 */
export function StatusBar() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const activeHabits = useLiveQuery(
    () => db.habits.where('archivedAt').equals('').count(),
    [],
    0
  )

  const todayCompletions = useLiveQuery(
    () => db.completions.where('date').equals(today).count(),
    [today],
    0
  )

  return (
    <footer className="app-statusbar" role="status" aria-live="polite">
      <span className="statusbar-brand">habitd</span>
      <span className="statusbar-sep" aria-hidden="true">•</span>
      <span>
        habits:{' '}
        <span className="statusbar-value">{activeHabits}</span>
      </span>
      <span className="statusbar-sep" aria-hidden="true">•</span>
      <span>
        today:{' '}
        <span className="statusbar-value">
          {todayCompletions}/{activeHabits}
        </span>
      </span>
      <span className="statusbar-sep" aria-hidden="true">•</span>
      <span className="statusbar-version">v{APP_VERSION}</span>
    </footer>
  )
}
