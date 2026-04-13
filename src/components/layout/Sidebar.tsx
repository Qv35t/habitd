import { useUIStore } from '@/stores/useUIStore'
import { useTranslation } from 'react-i18next'
import type { ViewName } from '@/types'

const NAV_ITEMS: { view: ViewName; i18nKey: string }[] = [
  { view: 'habits',   i18nKey: 'nav.habits' },
  { view: 'calendar', i18nKey: 'nav.calendar' },
  { view: 'week',     i18nKey: 'nav.week' },
  { view: 'journal',  i18nKey: 'nav.journal' },
  { view: 'stats',    i18nKey: 'nav.stats' },
  { view: 'tasks',    i18nKey: 'nav.tasks' },
  { view: 'settings', i18nKey: 'nav.settings' },
]

export function Sidebar() {
  const { activeView, setActiveView } = useUIStore()
  const { t } = useTranslation()

  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="section-header">nav</div>

      <ul>
        {NAV_ITEMS.map(({ view, i18nKey }) => (
          <li key={view}>
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
