import type { Habit } from '@/types'
import { restoreHabit, deleteHabit } from '@/hooks/useHabits'
import { useUIStore } from '@/stores/useUIStore'
import { Button } from '@/components/ui/Button'

interface ArchivedHabitRowProps {
  habit: Habit
}

/**
 * Single row for an archived habit with restore and delete actions.
 */
export function ArchivedHabitRow({ habit }: ArchivedHabitRowProps) {
  const { openConfirmModal } = useUIStore()

  const handleRestore = async () => {
    await restoreHabit(habit.id)
  }

  const handleDelete = () => {
    openConfirmModal({
      title: 'delete habit',
      description: `Permanently delete "${habit.name}" and all its logs. This cannot be undone.`,
      confirmLabel: 'delete',
      isDangerous: true,
      onConfirm: () => deleteHabit(habit.id),
    })
  }

  return (
    <div className="archived-habit-row">
      <span className="archived-habit-row__symbol" aria-hidden="true">
        {habit.symbol}
      </span>
      <span className="archived-habit-row__name">{habit.name}</span>
      <span className="archived-habit-row__date">
        archived {habit.archivedAt}
      </span>
      <Button variant="ghost" onClick={handleRestore}>
        [restore]
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        [delete]
      </Button>
    </div>
  )
}
