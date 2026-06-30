import { useUIStore } from '@/stores/useUIStore'
import { useTranslation } from 'react-i18next'
import type { ViewName } from '@/types'
import type { FinanceTab } from '@/stores/useUIStore'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { DrumFootCard } from '@/components/home/DrumFootCard'
import {
  Home,
  CheckSquare,
  Calendar,
  BarChart3,
  ListTodo,
  Columns3,
  BookOpen,
  DollarSign,
  Settings,
  HelpCircle,
} from 'lucide-react'

type NavItem = { view: ViewName; i18nKey: string; icon: React.ComponentType<{ size?: number; className?: string }> }

const NAV_ITEMS: NavItem[] = [
  { view: 'home',     i18nKey: 'nav.home',     icon: Home },
  { view: 'habits',   i18nKey: 'nav.habits',   icon: CheckSquare },
  { view: 'calendar', i18nKey: 'nav.calendar', icon: Calendar },
  { view: 'stats',    i18nKey: 'nav.stats',    icon: BarChart3 },
  { view: 'tasks',    i18nKey: 'nav.tasks',    icon: ListTodo },
  { view: 'week',     i18nKey: 'nav.week',     icon: Columns3 },
  { view: 'journal',  i18nKey: 'nav.journal',  icon: BookOpen },
  { view: 'finance',  i18nKey: 'nav.finance',  icon: DollarSign },
  { view: 'settings', i18nKey: 'nav.settings', icon: Settings },
  { view: 'help',     i18nKey: 'nav.help',     icon: HelpCircle },
]

// Section label indices — inserted before the nav item
const SECTION_BEFORE = new Set([0, 2, 5, 7, 9])
const SECTION_KEYS: Record<number, string> = {
  0: '— TODAY —',
  2: '— TRACKING —',
  5: '— LEDGER —',
  7: '— SYSTEM —',
  9: '— INFO —',
}

export function Sidebar() {
  const { activeView, setActiveView } = useUIStore()
  const { t } = useTranslation()

  const habitsCount = useLiveQuery(
    () => db.habits.where('archivedAt').equals('').count(),
    [],
    0,
  )

  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-logo">habit<span>d</span></div>
      <div className="drum-sub">RISO · v2.0</div>

      <ul>
        {NAV_ITEMS.map(({ view, i18nKey, icon: Icon }, idx) => (
          <li key={view}>
            {SECTION_BEFORE.has(idx) && (
              <div className="nav-section-label">{SECTION_KEYS[idx]}</div>
            )}
            <button
              className={`nav-item ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}
              aria-current={activeView === view ? 'page' : undefined}
            >
              <Icon size={16} className="nav-icon" />
              <span className="nav-label">{t(i18nKey)}</span>
              {view === 'habits' && habitsCount > 0 && (
                <span className="nav-badge">{habitsCount}</span>
              )}
            </button>
            {view === 'finance' && <FinanceSubNav />}
          </li>
        ))}
      </ul>

      <DrumFootCard />
    </nav>
  )
}

// ─── Finance sub-navigation ─────────────────────────────────────────────

function FinanceSubNav() {
  const financeTab = useUIStore((s) => s.financeTab)
  const setFinanceTab = useUIStore((s) => s.setFinanceTab)

  const SUB_ITEMS: { id: FinanceTab; label: string }[] = [
    { id: 'overview', label: 'overview' },
    { id: 'transactions', label: 'transactions' },
    { id: 'goals', label: 'goals' },
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