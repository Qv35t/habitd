import { HabitList } from '@/components/habits/HabitList'
import { HabitForm } from '@/components/habits/HabitForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/useUIStore'
import { deleteHabit } from '@/hooks/useHabits'

/**
 * HabitsView — main screen of the app.
 *
 * Layout:
 *  - Section header "– habits" with [+ add] button
 *  - HabitList (reactive list)
 *  - Modal with HabitForm (for add and edit)
 *  - Modal with delete confirmation
 *
 * Only manages modal state via useUIStore.
 * All data flows through useLiveQuery in HabitList.
 */
export function HabitsView() {
  const { modal, openAddModal, closeModal } = useUIStore()

  const handleConfirmDelete = async (habitId: string) => {
    await deleteHabit(habitId)
    closeModal()
  }

  return (
    <main className="app-content" role="main">
      {/* Section header */}
      <div className="section-header">
        <span>– habits</span>
        <Button variant="ghost" onClick={openAddModal} aria-label="Add new habit">
          [+ add]
        </Button>
      </div>

      {/* Main list */}
      <HabitList />

      {/* Add modal */}
      <Modal
        isOpen={modal.type === 'add'}
        onClose={closeModal}
        title="add habit"
      >
        <HabitForm mode="add" onClose={closeModal} />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={modal.type === 'edit'}
        onClose={closeModal}
        title="edit habit"
      >
        {modal.type === 'edit' && (
          <HabitForm
            mode="edit"
            initialData={modal.habit}
            onClose={closeModal}
          />
        )}
      </Modal>

      {/* Confirm delete modal */}
      <Modal
        isOpen={modal.type === 'confirmDelete'}
        onClose={closeModal}
        title="confirm delete"
      >
        {modal.type === 'confirmDelete' && (
          <div className="confirm-dialog">
            <p className="confirm-text">
              delete <strong>{modal.habitName}</strong>?
            </p>
            <p className="confirm-subtext">
              this will permanently remove the habit and all its completion history.
            </p>
            <div className="confirm-actions">
              <Button
                variant="danger"
                onClick={() => handleConfirmDelete(modal.habitId)}
              >
                [delete forever]
              </Button>
              <Button variant="ghost" onClick={closeModal}>
                [cancel]
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  )
}
