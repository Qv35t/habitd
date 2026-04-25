import { useLiveQuery } from 'dexie-react-hooks'
import { format } from 'date-fns'
import { db } from '@/db'
import { useUIStore } from '@/stores/useUIStore'
import { useTransactionCount } from '@/hooks/useTransactions'

/**
 * Bottom status bar (like in an IDE).
 *
 * Format: habitd  •  habits: N  •  today: X/N  •  v1.0.0  •  [?]
 * On finance view: adds finance: MMM yyyy • tx: N
 */
export function StatusBar() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { activeView, setHelpOpen } = useUIStore()

  const activeHabits = useLiveQuery(
    () => db.habits.where('archivedAt').equals('').count(),
    [],
    0,
  )

  const todayCompletions = useLiveQuery(
    () => db.completions.where('date').equals(today).count(),
    [today],
    0,
  )

  const txCount = useTransactionCount()

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
      {activeView === 'finance' && (
        <>
          <span className="statusbar-sep" aria-hidden="true">•</span>
          <span>
            finance:{' '}
            <span className="statusbar-value">
              tx: {txCount ?? 0}
            </span>
          </span>
        </>
      )}
      <span className="statusbar-sep" aria-hidden="true">•</span>
      <span className="statusbar-version">v{__APP_VERSION__}</span>
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
