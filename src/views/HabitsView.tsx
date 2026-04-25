import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useLiveQuery } from 'dexie-react-hooks'
import { format, subDays } from 'date-fns'
import { HabitForm } from '@/components/habits/HabitForm'
import { SortableHabitRow } from '@/components/habits/SortableHabitRow'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/useUIStore'
import { useHotkeys } from '@/hooks/useHotkeys'
import { deleteHabit, reorderHabits } from '@/hooks/useHabits'
import { toggleCompletion } from '@/hooks/useCompletions'
import { db } from '@/db'
import type { Completion } from '@/types'

/**
 * HabitsView — main screen of the app with keyboard navigation and drag-and-drop.
 */
export function HabitsView() {
  const { t } = useTranslation()
  const { modal, openAddModal, closeModal, selectedHabitIndex, setSelectedHabitIndex } = useUIStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')

  const habits = useLiveQuery(
    () => db.habits.where('archivedAt').equals('').sortBy('sortOrder'),
    []
  )

  const recentCompletions = useLiveQuery(
    () =>
      db.completions
        .where('date')
        .between(sevenDaysAgo, today, true, true)
        .toArray(),
    [sevenDaysAgo, today]
  ) as Completion[] | undefined

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !habits) return
    const oldIndex = habits.findIndex((h) => h.id === active.id)
    const newIndex = habits.findIndex((h) => h.id === over.id)
    const orderedIds = arrayMove(habits, oldIndex, newIndex).map((h) => h.id)
    await reorderHabits(orderedIds)
  }

  // Keyboard navigation
  useHotkeys({
    arrowdown: () => {
      if (habits) setSelectedHabitIndex(Math.min(selectedHabitIndex + 1, habits.length - 1))
    },
    arrowup: () => {
      setSelectedHabitIndex(Math.max(selectedHabitIndex - 1, 0))
    },
    ' ': () => {
      if (habits && habits[selectedHabitIndex]) {
        void toggleCompletion(habits[selectedHabitIndex].id, today)
      }
    },
    n: () => {
      openAddModal()
    },
    e: () => {
      if (habits && habits[selectedHabitIndex]) {
        useUIStore.getState().openEditModal(habits[selectedHabitIndex])
      }
    },
    d: () => {
      if (habits && habits[selectedHabitIndex]) {
        const h = habits[selectedHabitIndex]
        useUIStore.getState().openConfirmDeleteModal(h.id, h.name)
      }
    },
  }, [selectedHabitIndex, habits])

  const handleConfirmDelete = async (habitId: string) => {
    await deleteHabit(habitId)
    closeModal()
  }

  if (habits === undefined || recentCompletions === undefined) {
    return (
      <main className="app-content view--habits" role="main">
        <div className="section-header">
          <span>– {t('nav.habits')}</span>
        </div>
        <p className="text-muted">loading...</p>
      </main>
    )
  }

  // Group completions by habitId
  const completionsByHabit = new Map<string, Set<string>>()
  const completionDatesByHabit = new Map<string, string[]>()
  for (const c of recentCompletions) {
    if (!completionsByHabit.has(c.habitId)) {
      completionsByHabit.set(c.habitId, new Set())
      completionDatesByHabit.set(c.habitId, [])
    }
    completionsByHabit.get(c.habitId)!.add(c.date)
    completionDatesByHabit.get(c.habitId)!.push(c.date)
  }

  if (habits.length === 0) {
    return (
      <main className="app-content view--habits" role="main">
        <div className="section-header">
          <span>– {t('nav.habits')}</span>
          <Button variant="ghost" onClick={openAddModal} aria-label={t('habits.add')}>
            [+ {t('habits.add')}]
          </Button>
        </div>
        <div className="habit-list-empty">
          <p className="text-muted">{t('habits.empty')}</p>
        </div>

        {/* Modals must render even in empty state */}
        <Modal
          isOpen={modal.type === 'add'}
          onClose={closeModal}
          title={t('habits.add')}
        >
          <HabitForm mode="add" onClose={closeModal} />
        </Modal>
      </main>
    )
  }

  return (
    <main className="app-content view--habits" role="main">
      {/* Section header */}
      <div className="section-header">
        <span>– {t('nav.habits')}</span>
        <Button variant="ghost" onClick={openAddModal} aria-label={t('habits.add')}>
          [+ {t('habits.add')}]
        </Button>
      </div>

      {/* Draggable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={habits.map((h) => h.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="habit-list" role="list" aria-label="Active habits">
            {habits.map((habit, i) => (
              <SortableHabitRow
                key={habit.id}
                habit={habit}
                completedDatesSet={completionsByHabit.get(habit.id) ?? new Set()}
                completedDates={completionDatesByHabit.get(habit.id) ?? []}
                today={today}
                isSelected={i === selectedHabitIndex}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add habit button */}
      <div className="habit-list-add">
        <Button variant="ghost" onClick={openAddModal}>
          [+ {t('habits.add')}]
        </Button>
      </div>

      {/* Add modal */}
      <Modal
        isOpen={modal.type === 'add'}
        onClose={closeModal}
        title={t('habits.add')}
      >
        <HabitForm mode="add" onClose={closeModal} />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={modal.type === 'edit'}
        onClose={closeModal}
        title={t('habits.edit')}
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
        title={t('habits.delete')}
      >
        {modal.type === 'confirmDelete' && (
          <div className="confirm-dialog">
            <p className="confirm-text">
              {t('habits.delete')} <strong>{modal.habitName}</strong>?
            </p>
            <p className="confirm-subtext">
              {t('habits.archive')} — {t('common.confirm').toLowerCase()}
            </p>
            <div className="confirm-actions">
              <Button
                variant="danger"
                onClick={() => handleConfirmDelete(modal.habitId)}
              >
                [{t('common.confirm')}]
              </Button>
              <Button variant="ghost" onClick={closeModal}>
                [{t('common.cancel')}]
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  )
}
