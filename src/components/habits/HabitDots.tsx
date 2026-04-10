import { subDays, format } from 'date-fns'
import { toggleCompletion } from '@/hooks/useCompletions'

interface HabitDotsProps {
  habitId: string
  completedDatesSet: Set<string>
  today: string
}

const DOT_EMPTY = '◌'
const DOT_FILLED = '●'

/**
 * 7 clickable dots for the last 7 days (including today).
 *
 * Each dot:
 *  ◌ — day not completed
 *  ● — day completed
 *
 * Click calls toggleCompletion(habitId, date).
 * Reactivity: useLiveQuery in parent HabitList auto-updates completedDatesSet.
 */
export function HabitDots({ habitId, completedDatesSet, today }: HabitDotsProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(today + 'T00:00:00'), 6 - i)
    return format(d, 'yyyy-MM-dd')
  })

  return (
    <div className="habit-dots" role="group" aria-label="Weekly completion dots">
      {last7Days.map((date) => {
        const isCompleted = completedDatesSet.has(date)
        const isToday = date === today
        const shortDate = date.slice(5)

        return (
          <button
            key={date}
            className={[
              'habit-dot',
              isCompleted ? 'habit-dot--filled' : 'habit-dot--empty',
              isToday ? 'habit-dot--today' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => toggleCompletion(habitId, date)}
            aria-label={`${isCompleted ? 'Unmark' : 'Mark'} ${shortDate}`}
            aria-pressed={isCompleted}
            title={date}
          >
            {isCompleted ? DOT_FILLED : DOT_EMPTY}
          </button>
        )
      })}
    </div>
  )
}
