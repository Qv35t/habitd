import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'

/**
 * HomeView — welcome screen with navigation to all views.
 */
export function HomeView() {
  const { t } = useTranslation()
  const { setActiveView } = useUIStore()

  const sections = [
    { key: 'habits',   view: 'habits' as const },
    { key: 'calendar', view: 'calendar' as const },
    { key: 'stats',    view: 'stats' as const },
    { key: 'settings', view: 'settings' as const },
  ] as const

  return (
    <div className="home-view">
      <header className="home-header">
        <h1 className="home-title">{t('home.title')}</h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
      </header>

      <nav className="home-nav">
        {sections.map(({ key, view }) => (
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
