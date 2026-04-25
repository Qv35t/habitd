import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { FinanceTab } from '@/stores/useUIStore'

interface NavItemProps {
  shortcut: string
  label: string
  desc: string
  onClick: () => void
}

function NavItem({ shortcut, label, desc, onClick }: NavItemProps) {
  return (
    <button className="home-nav-item" onClick={onClick}>
      <span className="home-nav-key">{shortcut}</span>
      <span className="home-nav-label">{label}</span>
      <span className="home-nav-desc">{desc}</span>
    </button>
  )
}

interface FinanceNavItemProps {
  label: string
  desc: string
  onClick: () => void
}

function FinanceNavItem({ label, desc, onClick }: FinanceNavItemProps) {
  return (
    <button className="home-nav-item" onClick={onClick}>
      <span className="home-nav-key" />
      <span className="home-nav-label">{label}</span>
      <span className="home-nav-desc">{desc}</span>
    </button>
  )
}

/**
 * HomeView — welcome screen with two-panel navigation layout.
 * Left panel: CORE / EXTENDED / UTILITY menus.
 * Right panel: FINANCE menu with tab navigation.
 */
export function HomeView() {
  const { t } = useTranslation()
  const { setActiveView, setFinanceTab } = useUIStore()

  const navigate = (view: string) =>
    setActiveView(view as Parameters<typeof setActiveView>[0])

  const navigateFinance = (tab: FinanceTab) => {
    setActiveView('finance')
    setFinanceTab(tab)
  }

  useHotkeys({
    t: () => navigate('tasks'),
    v: () => navigate('week'),
    j: () => navigate('journal'),
  }, [])

  return (
    <div className="home-view">
      <header className="home-header">
        <h1 className="home-title">{t('home.title')}</h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
      </header>

      <div className="home-panels">
        <div className="home-panel-left">
          <div className="home-panel-inner">
            <nav className="home-nav home-nav--core">
              <span className="home-nav-group-label">{t('home.menu.core')}</span>
              <NavItem shortcut="[h]" label={t('home.items.habits')} desc={t('home.descriptions.habits')} onClick={() => navigate('habits')} />
              <NavItem shortcut="[c]" label={t('home.items.calendar')} desc={t('home.descriptions.calendar')} onClick={() => navigate('calendar')} />
              <NavItem shortcut="[s]" label={t('home.items.stats')} desc={t('home.descriptions.stats')} onClick={() => navigate('stats')} />
            </nav>

            <nav className="home-nav home-nav--extended">
              <span className="home-nav-group-label">{t('home.menu.extended')}</span>
              <NavItem shortcut="[t]" label={t('home.items.tasks')} desc={t('home.descriptions.tasks')} onClick={() => navigate('tasks')} />
              <NavItem shortcut="[v]" label={t('home.items.week')} desc={t('home.descriptions.week')} onClick={() => navigate('week')} />
              <NavItem shortcut="[j]" label={t('home.items.journal')} desc={t('home.descriptions.journal')} onClick={() => navigate('journal')} />
            </nav>

            <nav className="home-nav home-nav--utility">
              <span className="home-nav-group-label">{t('home.menu.utility')}</span>
              <NavItem shortcut="[,]" label={t('home.items.settings')} desc={t('home.descriptions.settings')} onClick={() => navigate('settings')} />
            </nav>
          </div>
        </div>

        <div className="home-panel-right">
          <div className="home-panel-inner">
            <nav className="home-nav home-nav--finance">
              <span className="home-nav-group-label">{t('home.menu.finance')}</span>
              <NavItem shortcut="[f]" label={t('home.items.overview')} desc={t('home.descriptions.overview')} onClick={() => navigateFinance('overview')} />
              <FinanceNavItem label={t('home.items.transactions')} desc={t('home.descriptions.transactions')} onClick={() => navigateFinance('transactions')} />
              <FinanceNavItem label={t('home.items.goals')} desc={t('home.descriptions.goals')} onClick={() => navigateFinance('goals')} />
            </nav>
          </div>
        </div>
      </div>

      <footer className="home-footer">
        <span className="home-tip">{t('home.tip')}</span>
      </footer>
    </div>
  )
}
