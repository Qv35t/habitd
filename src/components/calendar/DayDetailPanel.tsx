import { format, parseISO, isValid } from 'date-fns'
import { useActiveHabits } from '@/hooks/useHabits'
import { useCompletionsForDate, toggleCompletion } from '@/hooks/useCompletions'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

interface DayDetailPanelProps {
  date: string
  onClose: () => void
}

/**
 * Side panel showing all active habits with toggleable completion
 * for the selected calendar date.
 */
export function DayDetailPanel({ date, onClose }: DayDetailPanelProps) {
  const { t } = useTranslation()

  const habits = useActiveHabits()
  const completions = useCompletionsForDate(date)

  const completedIds = new Set(completions?.map((c) => c.habitId) ?? [])

  const parsedDate = parseISO(date)
  const formattedDate = isValid(parsedDate)
    ? format(parsedDate, 'EEE dd MMM yyyy')
    : date

  const today = format(new Date(), 'yyyy-MM-dd')
  const isFuture = date > today

  const handleToggle = async (habitId: string) => {
    if (isFuture) return
    await toggleCompletion(habitId, date)
  }

  return (
    <aside className="day-detail-panel" aria-label={t('calendar.title')}>
      {/* Header */}
      <div className="day-detail-panel__header">
        <span className="day-detail-panel__date">{formattedDate}</span>
        <button
          className="day-detail-panel__close"
          onClick={onClose}
          aria-label={t('calendar.closePanel')}
        >
          ×
        </button>
      </div>

      <div className="day-detail-panel__divider" aria-hidden="true" />

      {/* Future warning */}
      {isFuture && (
        <p className="day-detail-panel__future-note">{t('calendar.futureNote')}</p>
      )}

      {/* Habit list */}
      <ul className="day-detail-panel__list" role="list">
        {habits === undefined && (
          <li className="day-detail-panel__loading">{t('calendar.loading')}</li>
        )}

        {habits?.length === 0 && (
          <li className="day-detail-panel__empty">{t('calendar.noHabits')}</li>
        )}

        {habits?.map((habit) => {
          const done = completedIds.has(habit.id)
          return (
            <li key={habit.id} className="day-detail-panel__item">
              <span className="day-detail-panel__symbol" aria-hidden="true">
                {habit.symbol}
              </span>
              <span className="day-detail-panel__habit-name">{habit.name}</span>
              <Button
                variant={done ? 'active' : 'ghost'}
                className="day-detail-panel__toggle"
                onClick={() => handleToggle(habit.id)}
                disabled={isFuture}
                aria-label={`${done ? t('calendar.habitsDone') : t('calendar.habitsNotDone')} ${habit.name} ${formattedDate}`}
                aria-pressed={done}
              >
                {done ? t('calendar.habitsDone') : t('calendar.habitsNotDone')}
              </Button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
