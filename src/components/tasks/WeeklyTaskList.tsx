import { useTasksForWeek, getWeekRange } from '@/hooks/useTasks'
import { TaskItem } from './TaskItem'
import { TaskInlineInput } from './TaskInlineInput'
import type { Task } from '@/types'

interface WeeklyTaskListProps {
  date: string
}

/**
 * Weekly task list for the week containing the given date.
 *
 * Header shows the week range label (e.g. "28 янв – 3 фев 2026").
 * Shows inline add input for weekly tasks.
 */
export function WeeklyTaskList({ date }: WeeklyTaskListProps) {
  const tasks = useTasksForWeek(date)
  const weekRange = getWeekRange(date)

  if (!tasks) {
    return <div className="task-list-loading">loading...</div>
  }

  return (
    <div className="task-list task-list--weekly">
      <div className="task-list__header">
        <span className="task-list__title">– задачи на неделю ({weekRange.label})</span>
      </div>

      <div className="task-list__items" role="list" aria-label="Weekly tasks">
        {tasks.length === 0 && (
          <div className="task-list__empty">нет задач на неделю</div>
        )}

        {tasks.map((task: Task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <TaskInlineInput scope="weekly" date={date} placeholder="+ добавить на неделю..." />
    </div>
  )
}
