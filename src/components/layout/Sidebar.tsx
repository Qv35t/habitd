import { useUIStore } from '@/stores/useUIStore'
import type { ViewName } from '@/types'

const NAV_ITEMS: { view: ViewName; label: string }[] = [
  { view: 'habits',   label: 'habits'   },
  { view: 'calendar', label: 'calendar' },
  { view: 'stats',    label: 'stats'    },
  { view: 'settings', label: 'settings' },
]

export function Sidebar() {
  const { activeView, setActiveView } = useUIStore()

  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="section-header">nav</div>

      <ul>
        {NAV_ITEMS.map(({ view, label }) => (
          <li key={view}>
            <button
              className={`nav-item w-full text-left ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}
              aria-current={activeView === view ? 'page' : undefined}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
