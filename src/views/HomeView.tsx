import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'

const NAV_ITEMS: Array<{ key: string; view: import('@/types').ViewName }> = [
  { key: 'habits',   view: 'habits' },
  { key: 'calendar', view: 'calendar' },
  { key: 'stats',    view: 'stats' },
  { key: 'settings', view: 'settings' },
]

/**
 * HomeView — welcome screen with navigation to all views.
 */
export function HomeView() {
  const { t } = useTranslation()
  const { setActiveView } = useUIStore()

  return (
    <div className="home-view">
      <header className="home-header">
        <h1 className="home-title">{t('home.title')}</h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
      </header>

      <nav className="home-nav">
        {NAV_ITEMS.map(({ key, view }) => (
          <button
            key={key}
            className="home-nav-item"
            onClick={() => setActiveView(view)}
          >
            <span className="home-nav-key">{t(`home.sections.${key}.key`)}</span>
            <span className="home-nav-label">{t(`home.sections.${key}.label`)}</span>
            <span className="home-nav-desc">{t(`home.sections.${key}.desc`)}</span>
          </button>
        ))}
      </nav>

      <footer className="home-footer">
        <span className="home-tip">{t('home.tip')}</span>
      </footer>
    </div>
  )
}
