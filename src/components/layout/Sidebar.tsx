import { useUIStore } from '@/stores/useUIStore'
import { useTranslation } from 'react-i18next'
import type { ViewName } from '@/types'
import type { FinanceTab } from '@/stores/useUIStore'

type NavItem = { view: ViewName; i18nKey: string }

const NAV_ITEMS: NavItem[] = [
  { view: 'home',     i18nKey: 'nav.home' },
  { view: 'habits',   i18nKey: 'nav.habits' },
  { view: 'calendar', i18nKey: 'nav.calendar' },
  { view: 'stats',    i18nKey: 'nav.stats' },
  { view: 'tasks',    i18nKey: 'nav.tasks' },
  { view: 'week',     i18nKey: 'nav.week' },
  { view: 'journal',  i18nKey: 'nav.journal' },
  { view: 'finance',  i18nKey: 'nav.finance' },
  { view: 'settings', i18nKey: 'nav.settings' },
  { view: 'help',     i18nKey: 'nav.help' },
]

// Indices after which to show a separator
const SEPARATOR_AFTER = new Set([3, 7, 8]) // after stats, after journal

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
            {view === 'finance' && <FinanceSubNav />}
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ─── Finance sub-navigation ─────────────────────────────────────────────

function FinanceSubNav() {
  const financeTab = useUIStore((s) => s.financeTab)
  const setFinanceTab = useUIStore((s) => s.setFinanceTab)

  const SUB_ITEMS: { id: FinanceTab; label: string }[] = [
    { id: 'overview', label: '– overview' },
    { id: 'transactions', label: '– transactions' },
    { id: 'goals', label: '– goals' },
  ]

  return (
    <div className="sidebar__subnav">
      {SUB_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`sidebar__subitem ${financeTab === item.id ? 'sidebar__subitem--active' : ''}`}
          onClick={() => setFinanceTab(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
