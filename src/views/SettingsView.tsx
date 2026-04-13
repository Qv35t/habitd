import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'
import { DataSection } from '@/components/settings/DataSection'
import { HabitsSection } from '@/components/settings/HabitsSection'
import { DangerSection } from '@/components/settings/DangerSection'
import { ConfirmModal } from '@/components/settings/ConfirmModal'
import type { Theme } from '@/stores/useUIStore'

/**
 * SettingsView — settings and data management screen.
 */
export function SettingsView() {
  const { t } = useTranslation()
  const {
    confirmModal,
    closeConfirmModal,
    theme,
    setTheme,
  } = useUIStore()

  const themes: { value: Theme; label: string }[] = [
    { value: 'terminal-dark', label: t('settings.themes.terminal-dark') },
    { value: 'terminal-dim', label: t('settings.themes.terminal-dim') },
  ]

  return (
    <div className="settings-view">
      <div className="settings-header">
        <span className="section-label">{t('settings.title')}</span>
      </div>

      {/* Theme */}
      <section className="settings-section">
        <div className="settings-section-label">{t('settings.theme')}</div>
        <div className="settings-toggle-group">
          {themes.map(({ value, label }) => (
            <button
              key={value}
              className={`settings-toggle-btn ${theme === value ? 'settings-toggle-btn--active' : ''}`}
              onClick={() => setTheme(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <DataSection />
      <HabitsSection />
      <DangerSection />

      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmLabel={confirmModal.confirmLabel}
          keyword={confirmModal.keyword}
          isDangerous={confirmModal.isDangerous}
          onConfirm={async () => {
            await confirmModal.onConfirm()
            closeConfirmModal()
          }}
          onCancel={closeConfirmModal}
        />
      )}
    </div>
  )
}
