import { useUIStore } from '@/stores/useUIStore'
import { resetAllData } from '@/utils/export'
import { Button } from '@/components/ui/Button'

/**
 * DangerSection — full data reset with two-step keyword confirmation.
 */
export function DangerSection() {
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
        – danger zone
      </div>

      <div className="settings-action-row">
        <Button variant="danger" onClick={handleReset}>
          [reset all data]
        </Button>
        <span className="settings-action-description">
          permanently delete all habits &amp; logs
        </span>
      </div>

      <p className="danger-warning">
        type "reset" in the confirmation dialog to proceed
      </p>
    </section>
  )
}
