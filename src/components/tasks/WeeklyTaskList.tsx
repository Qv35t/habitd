import { useTasksForWeek } from '@/hooks/useTasks'
import { TaskItem } from './TaskItem'
import { TaskInlineInput } from './TaskInlineInput'
import { useTranslation } from 'react-i18next'
import type { Task } from '@/types'

interface WeeklyTaskListProps {
  date: string
}

/**
 * Weekly task list for the week containing the given date.
 *
 * Shows inline add input for weekly tasks.
 */
export function WeeklyTaskList({ date }: WeeklyTaskListProps) {
  const { t } = useTranslation()
  const tasks = useTasksForWeek(date)

  if (!tasks) {
    return <div className="task-list-loading">loading...</div>
  }

  return (
    <div className="task-list task-list--weekly">
      <div className="task-list__header">
        <span className="task-list__title">{t('tasks.weeklyTitle')}</span>
      </div>

      <div className="task-list__items" role="list" aria-label="Weekly tasks">
        {tasks.length === 0 && (
          <div className="task-list__empty">{t('tasks.noWeekly')}</div>
        )}

        {tasks.map((task: Task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <TaskInlineInput scope="weekly" date={date} placeholder={t('tasks.addWeeklyPlaceholder')} />
    </div>
  )
}
