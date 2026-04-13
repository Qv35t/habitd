import { useTaskCounters } from '@/hooks/useTasks'
import { useTranslation } from 'react-i18next'

interface TaskCountersProps {
  date: string
}

/**
 * Task counters: DONE / LEFT / TOTAL + ASCII progress bar.
 *
 * Visual:
 *   DONE: 3   LEFT: 2   TOTAL: 5   ██████░░░░ 60%
 */
export function TaskCounters({ date }: TaskCountersProps) {
  const { t } = useTranslation()
  const { done, left, total, percent } = useTaskCounters(date)

  const barWidth = 10
  const filled = Math.round((percent / 100) * barWidth)
  const empty = barWidth - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  if (total === 0) return null

  return (
    <div className="task-counters" role="status" aria-live="polite">
      <span className="task-counters__done">
        {t('tasks.done')}: <span className="task-counters__value">{done}</span>
      </span>
      <span className="task-counters__sep">·</span>
      <span className="task-counters__left">
        {t('tasks.left')}: <span className="task-counters__value">{left}</span>
      </span>
      <span className="task-counters__sep">·</span>
      <span className="task-counters__total">
        {t('tasks.total')}: <span className="task-counters__value">{total}</span>
      </span>
      <span className="task-counters__bar">
        {bar} {percent}%
      </span>
    </div>
  )
}
