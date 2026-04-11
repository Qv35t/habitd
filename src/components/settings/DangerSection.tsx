import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'
import { resetAllData } from '@/utils/export'
import { Button } from '@/components/ui/Button'

/**
 * DangerSection — full data reset with two-step keyword confirmation.
 */
export function DangerSection() {
  const { t } = useTranslation()
  const { openConfirmModal } = useUIStore()

  const handleReset = () => {
    openConfirmModal({
      title: 'reset all data',
      description:
        'This will permanently delete ALL habits and completion logs. This action cannot be undone.',
      confirmLabel: 'reset everything',
      isDangerous: true,
      keyword: 'reset',
      onConfirm: async () => {
        await resetAllData()
      },
    })
  }

  return (
    <section className="settings-section danger-section">
      <div className="settings-section-label danger-section-label">
        – {t('settings.danger_zone') ?? 'danger zone'}
      </div>

      <div className="settings-action-row">
        <Button variant="danger" onClick={handleReset}>
          [{t('settings.reset')}]
        </Button>
        <span className="settings-action-description">
          {t('settings.reset_desc') ?? 'permanently delete all habits & logs'}
        </span>
      </div>

      <p className="danger-warning">
        {t('settings.reset_warning') ?? 'type "reset" in the confirmation dialog to proceed'}
      </p>
    </section>
  )
}
