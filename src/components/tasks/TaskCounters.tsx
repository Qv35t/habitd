import { useTaskCounters } from '@/hooks/useTasks'

interface TaskCountersProps {
  date: string
}

/**
 * Task counters: ГОТОВО / ОСТАЛОСЬ / ИТОГО + ASCII progress bar.
 *
 * Visual:
 *   ГОТОВО: 3   ОСТАЛОСЬ: 2   ИТОГО: 5   ██████░░░░ 60%
 */
export function TaskCounters({ date }: TaskCountersProps) {
  const { done, left, total, percent } = useTaskCounters(date)

  const barWidth = 10
  const filled = Math.round((percent / 100) * barWidth)
  const empty = barWidth - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  if (total === 0) return null

  return (
    <div className="task-counters" role="status" aria-live="polite">
      <span className="task-counters__done">
        ГОТОВО: <span className="task-counters__value">{done}</span>
      </span>
      <span className="task-counters__sep">·</span>
      <span className="task-counters__left">
        ОСТАЛОСЬ: <span className="task-counters__value">{left}</span>
      </span>
      <span className="task-counters__sep">·</span>
      <span className="task-counters__total">
        ИТОГО: <span className="task-counters__value">{total}</span>
      </span>
      <span className="task-counters__bar">
        {bar} {percent}%
      </span>
    </div>
  )
}
