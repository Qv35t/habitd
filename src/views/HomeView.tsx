import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'
import { useHotkeys } from '@/hooks/useHotkeys'

interface HomeNavItemProps {
  navKey: string
  view: string
  onNavigate: (view: string) => void
}

function HomeNavItem({ navKey, view, onNavigate }: HomeNavItemProps) {
  const { t } = useTranslation()
  return (
    <button
      className="home-nav-item"
      onClick={() => onNavigate(view)}
    >
      <span className="home-nav-key">{t(`home.sections.${navKey}.key`)}</span>
      <span className="home-nav-label">{t(`home.sections.${navKey}.label`)}</span>
      <span className="home-nav-desc">{t(`home.sections.${navKey}.desc`)}</span>
    </button>
  )
}

const SECTIONS = [
  { key: 'habits',   view: 'habits'   },
  { key: 'calendar', view: 'calendar' },
  { key: 'stats',    view: 'stats'    },
  { key: 'tasks',    view: 'tasks'    },
  { key: 'week',     view: 'week'     },
  { key: 'journal',  view: 'journal'  },
  { key: 'settings', view: 'settings' },
] as const

/**
 * HomeView — welcome screen with navigation to all views.
 */
export function HomeView() {
  const { t } = useTranslation()
  const { setActiveView } = useUIStore()

  const navigate = (view: string) => setActiveView(view as Parameters<typeof setActiveView>[0])

  const primarySections = SECTIONS.filter(s =>
    ['habits', 'calendar', 'stats'].includes(s.view)
  )
  const extendedSections = SECTIONS.filter(s =>
    ['tasks', 'week', 'journal'].includes(s.view)
  )
  const utilitySections = SECTIONS.filter(s =>
    ['settings'].includes(s.view)
  )

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

      <div className="home-nav-groups">
        {/* Group 1: Core */}
        <nav className="home-nav home-nav--core">
          <span className="home-nav-group-label">– core</span>
          {primarySections.map(({ key, view }) => (
            <HomeNavItem key={key} navKey={key} view={view} onNavigate={navigate} />
          ))}
        </nav>

        {/* Group 2: Extended */}
        <nav className="home-nav home-nav--extended">
          <span className="home-nav-group-label">– extended</span>
          {extendedSections.map(({ key, view }) => (
            <HomeNavItem key={key} navKey={key} view={view} onNavigate={navigate} />
          ))}
        </nav>

        {/* Group 3: Utility */}
        <nav className="home-nav home-nav--utility">
          <span className="home-nav-group-label">– utility</span>
          {utilitySections.map(({ key, view }) => (
            <HomeNavItem key={key} navKey={key} view={view} onNavigate={navigate} />
          ))}
        </nav>
      </div>

      <footer className="home-footer">
        <span className="home-tip">{t('home.tip')}</span>
      </footer>
    </div>
  )
}
