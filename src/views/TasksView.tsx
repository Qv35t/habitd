import { useUIStore } from '@/stores/useUIStore'
import { DateNav } from '@/components/tasks/DateNav'
import { TaskCounters } from '@/components/tasks/TaskCounters'
import { DailyTaskList } from '@/components/tasks/DailyTaskList'
import { WeeklyTaskList } from '@/components/tasks/WeeklyTaskList'

/**
 * TasksView — daily + weekly task manager.
 *
 * Layout:
 *   [DateNav]          ← ← 28 января 2026 → →   [сегодня]
 *   [TaskCounters]     ГОТОВО: 3 · ОСТАЛОСЬ: 2 · ИТОГО: 5  ██████░░░░ 60%
 *   [DailyTaskList]    – задачи на сегодня  [все] [активные] [выполненные]
 *   [WeeklyTaskList]   – задачи на неделю (28 янв – 3 фев 2026)
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
