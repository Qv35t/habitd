import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HabitRow } from './HabitRow'
import type { Habit } from '@/types'

interface SortableHabitRowProps {
  habit: Habit
  completedDatesSet: Set<string>
  completedDates: string[]
  today: string
  isSelected: boolean
}

/**
 * Wraps HabitRow with drag-and-drop sorting via @dnd-kit.
 */
export function SortableHabitRow({
  habit,
  completedDatesSet,
  completedDates,
  today,
  isSelected,
}: SortableHabitRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="sortable-habit-row"
    >
      <HabitRow
        habit={habit}
        completedDatesSet={completedDatesSet}
        completedDates={completedDates}
        today={today}
        isSelected={isSelected}
      />
    </div>
  )
}
