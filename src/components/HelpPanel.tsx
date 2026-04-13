import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'
import { useHotkeys } from '@/hooks/useHotkeys'

const guideKeys = [
  'home', 'habits', 'calendar', 'stats',
  'tasks', 'week', 'journal', 'settings'
] as const

/**
 * HelpPanel — keyboard shortcuts overlay, toggled with [?].
 */
export function HelpPanel() {
  const { t } = useTranslation()
  const { helpOpen, setHelpOpen } = useUIStore()

  useHotkeys({
    '?': () => setHelpOpen(!helpOpen),
    escape: () => { if (helpOpen) setHelpOpen(false) },
  }, [helpOpen])

  if (!helpOpen) return null

  const navKeys = ['wasd_arrows', 'space', 'h', 'c', 's_view', 't', 'v', 'j', 'g', 'comma'] as const
  const actionKeys = ['n', 'e', 'd', 'question', 'esc'] as const

  return (
    <div className="help-overlay" role="dialog" aria-modal="true">
      <div className="help-panel">
        <header className="help-header">
          <span className="help-title">{t('help.title')}</span>
          <button className="help-close" onClick={() => setHelpOpen(false)}>
            [{t('common.cancel')}]
          </button>
        </header>
        <section>
          <p className="help-section-label">{t('help.navigation')}</p>
          {navKeys.map((k) => (
            <div key={k} className="help-row">{t(`help.keys.${k}`)}</div>
          ))}
        </section>
        <section>
          <p className="help-section-label">{t('help.actions')}</p>
          {actionKeys.map((k) => (
            <div key={k} className="help-row">{t(`help.keys.${k}`)}</div>
          ))}
        </section>

        {/* Divider */}
        <hr className="help-divider" />

        {/* User Guide */}
        <section className="help-guide-section">
          <p className="help-section-label">{t('help.guide_title')}</p>
          {guideKeys.map(k => (
            <div key={k} className="help-guide-item">
              <span className="help-guide-item-title">
                {t(`help.guide.${k}.title`)}
              </span>
              <span className="help-guide-item-desc">
                {t(`help.guide.${k}.desc`)}
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
