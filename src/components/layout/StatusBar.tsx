import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { db } from '@/db'
import { useUIStore } from '@/stores/useUIStore'

const APP_VERSION = '0.1.0'

/**
 * Bottom status bar (like in an IDE).
 *
 * Format: habitd  •  habits: N  •  today: X/N  •  v0.1.0  •  [?]
 */
export function StatusBar() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { setHelpOpen } = useUIStore()

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
      <button
        className="statusbar-help"
        onClick={() => setHelpOpen(true)}
        aria-label="Keyboard shortcuts"
      >
        [?]
      </button>
    </footer>
  )
}
