import { useUIStore } from '@/stores/useUIStore'
import { DateNav } from '@/components/tasks/DateNav'
import { TaskCounters } from '@/components/tasks/TaskCounters'
import { DailyTaskList } from '@/components/tasks/DailyTaskList'
import { WeeklyTaskList } from '@/components/tasks/WeeklyTaskList'

/**
 * TasksView — daily + weekly task manager.
 *
 * Layout:
 *   [DateNav]          ← jan 28, 2026 →   [today]
 *   [TaskCounters]     DONE: 3 · LEFT: 2 · TOTAL: 5  ██████░░░░ 60%
 *   [DailyTaskList]    – daily tasks  [all] [active] [done]
 *   [WeeklyTaskList]   – weekly tasks
 */
export function TasksView() {
  const tasksActiveDate = useUIStore((s) => s.tasksActiveDate)

  return (
    <div className="tasks-view">
      <DateNav />
      <TaskCounters date={tasksActiveDate} />
      <DailyTaskList date={tasksActiveDate} />
      <WeeklyTaskList date={tasksActiveDate} />
    </div>
  )
}
