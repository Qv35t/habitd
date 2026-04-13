import { useTasksForDate } from '@/hooks/useTasks'
import { useUIStore } from '@/stores/useUIStore'
import { TaskItem } from './TaskItem'
import { TaskInlineInput } from './TaskInlineInput'
import { TaskFilterBar } from './TaskFilterBar'
import type { Task } from '@/types'

interface DailyTaskListProps {
  date: string
}

/**
 * Daily task list for a specific date.
 *
 * Contains: filter bar, task items, inline add input.
 * Filter (all/active/done) applied from UIStore.
 */
export function DailyTaskList({ date }: DailyTaskListProps) {
  const tasks = useTasksForDate(date)
  const tasksFilter = useUIStore((s) => s.tasksFilter)

  if (!tasks) {
    return <div className="task-list-loading">loading...</div>
  }

  const filtered = tasks.filter((t: Task) => {
    if (tasksFilter === 'active') return t.done === 0
    if (tasksFilter === 'done') return t.done === 1
    return true
  })

  return (
    <div className="task-list">
      <div className="task-list__header">
        <span className="task-list__title">– задачи на сегодня</span>
        <TaskFilterBar scope="daily" />
      </div>

      <div className="task-list__items" role="list" aria-label="Daily tasks">
        {filtered.length === 0 && (
          <div className="task-list__empty">
            {tasksFilter !== 'all' ? 'нет задач по фильтру' : 'нет задач на сегодня'}
          </div>
        )}

        {filtered.map((task: Task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <TaskInlineInput scope="daily" date={date} placeholder="+ добавить задачу..." />
    </div>
  )
}
