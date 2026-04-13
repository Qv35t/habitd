import { toggleCompletion } from '../../hooks/useCompletions'

interface WeekCellProps {
  date: string
  habitId: string
  isCompleted: boolean
  isFuture: boolean
  isToday: boolean
}

/** Single toggle cell: ▓ completed · ░ not done · · future */
export function WeekCell({ date, habitId, isCompleted, isFuture, isToday }: WeekCellProps) {
  const char  = isFuture ? '·' : isCompleted ? '▓' : '░'
  const label = `${date}: ${isCompleted ? 'completed' : 'not completed'}`

  return (
    <button
      className={[
        'week-cell',
        isCompleted ? 'week-cell--completed' : '',
        isFuture    ? 'week-cell--future'    : '',
        isToday     ? 'week-cell--today'     : '',
      ].filter(Boolean).join(' ')}
      onClick={() => !isFuture && toggleCompletion(habitId, date)}
      onKeyDown={e => {
        if (!isFuture && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          toggleCompletion(habitId, date)
        }
      }}
      aria-label={label}
      aria-pressed={isCompleted}
      tabIndex={isFuture ? -1 : 0}
      disabled={isFuture}
    >
      {char}
    </button>
  )
}
