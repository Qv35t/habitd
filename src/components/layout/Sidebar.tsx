import { useUIStore } from '@/stores/useUIStore'
import { useTranslation } from 'react-i18next'
import type { ViewName } from '@/types'

type NavItem = { view: ViewName; i18nKey: string }

const NAV_ITEMS: NavItem[] = [
  { view: 'home',     i18nKey: 'nav.home' },
  { view: 'habits',   i18nKey: 'nav.habits' },
  { view: 'calendar', i18nKey: 'nav.calendar' },
  { view: 'stats',    i18nKey: 'nav.stats' },
  { view: 'tasks',    i18nKey: 'nav.tasks' },
  { view: 'week',     i18nKey: 'nav.week' },
  { view: 'journal',  i18nKey: 'nav.journal' },
  { view: 'settings', i18nKey: 'nav.settings' },
]

// Indices after which to show a separator
const SEPARATOR_AFTER = new Set([3, 7]) // after stats, after journal

export function Sidebar() {
  const { activeView, setActiveView } = useUIStore()
  const { t } = useTranslation()

  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="section-header">nav</div>

      <ul>
        {NAV_ITEMS.map(({ view, i18nKey }, idx) => (
          <li key={view}>
            {SEPARATOR_AFTER.has(idx) && <div className="sidebar-separator" />}
            <button
              className={`nav-item w-full text-left ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}
              aria-current={activeView === view ? 'page' : undefined}
            >
              {t(i18nKey)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
