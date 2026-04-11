import { useTranslation } from 'react-i18next'
import { useArchivedHabits } from '@/hooks/useArchivedHabits'
import { useUIStore } from '@/stores/useUIStore'
import { purgeArchivedHabits } from '@/utils/export'
import { ArchivedHabitRow } from './ArchivedHabitRow'
import { Button } from '@/components/ui/Button'

/**
 * HabitsSection — lists archived habits with restore/delete per row,
 * and a purge-all action with keyword confirmation.
 */
export function HabitsSection() {
  const { t } = useTranslation()
  const archived = useArchivedHabits()
  const { openConfirmModal } = useUIStore()

  if (archived === undefined) {
    return (
      <section className="settings-section">
        <div className="settings-section-label">– {t('nav.habits')}</div>
        <p className="text-muted">loading...</p>
      </section>
    )
  }

  const handlePurge = () => {
    openConfirmModal({
      title: 'purge all archived',
      description: `Permanently delete all ${archived.length} archived habits and their completion logs.`,
      confirmLabel: 'purge all',
      isDangerous: true,
      keyword: 'purge',
      onConfirm: async () => {
        await purgeArchivedHabits()
      },
    })
  }

  return (
    <section className="settings-section">
      <div className="settings-section-label">– {t('nav.habits')}</div>

      {archived.length === 0 ? (
        <p className="text-muted">{t('settings.no_archived') ?? 'no archived habits'}</p>
      ) : (
        <>
          {archived.map((habit) => (
            <ArchivedHabitRow key={habit.id} habit={habit} />
          ))}
          <div className="settings-action-row">
            <Button variant="danger" onClick={handlePurge}>
              [{t('habits.purge_all') ?? 'purge all archived'}]
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
