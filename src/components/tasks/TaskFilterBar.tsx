import { useUIStore } from '@/stores/useUIStore'
import type { TaskFilter } from '@/types'

interface TaskFilterBarProps {
  scope: 'daily' | 'weekly'
}

/**
 * Segmented filter: [все] [активные] [выполненные]
 */
export function TaskFilterBar({ scope: _scope }: TaskFilterBarProps) {
  const tasksFilter = useUIStore((s) => s.tasksFilter)
  const setTasksFilter = useUIStore((s) => s.setTasksFilter)

  const filters: { value: TaskFilter; label: string }[] = [
    { value: 'all', label: 'все' },
    { value: 'active', label: 'активные' },
    { value: 'done', label: 'выполненные' },
  ]

  return (
    <div className="segmented-control">
      {filters.map(({ value: f, label }) => (
        <button
          key={f}
          className={`segmented-control__btn ${tasksFilter === f ? 'segmented-control__btn--active' : ''}`}
          onClick={() => setTasksFilter(f)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
