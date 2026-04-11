import { useUIStore } from '@/stores/useUIStore'
import { DataSection } from '@/components/settings/DataSection'
import { HabitsSection } from '@/components/settings/HabitsSection'
import { DangerSection } from '@/components/settings/DangerSection'
import { ConfirmModal } from '@/components/settings/ConfirmModal'

/**
 * SettingsView — settings and data management screen.
 * Composes DataSection, HabitsSection, DangerSection vertically.
 * Renders ConfirmModal globally for all destructive actions.
 */
export function SettingsView() {
  const { confirmModal, closeConfirmModal } = useUIStore()

  return (
    <div className="settings-view">
      <div className="settings-header">
        <span className="section-label">settings</span>
      </div>

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
