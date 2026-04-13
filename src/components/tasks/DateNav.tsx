import { subDays, addDays, format, parseISO, isToday } from 'date-fns'
import { useUIStore } from '@/stores/useUIStore'
import { useTranslation } from 'react-i18next'

/**
 * Date navigation for TasksView.
 *
 * Visual: ← [Jan 28, 2026] →   [today]
 *
 * Button [today] shown only when active date ≠ today.
 */
export function DateNav() {
  const { t } = useTranslation()
  const tasksActiveDate = useUIStore((s) => s.tasksActiveDate)
  const setTasksActiveDate = useUIStore((s) => s.setTasksActiveDate)

  const date = parseISO(tasksActiveDate + 'T00:00:00')
  const label = format(date, 'MMM d, yyyy').toLowerCase()

  function goPrev() {
    setTasksActiveDate(format(subDays(date, 1), 'yyyy-MM-dd'))
  }

  function goNext() {
    setTasksActiveDate(format(addDays(date, 1), 'yyyy-MM-dd'))
  }

  function goToday() {
    setTasksActiveDate(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="date-nav">
      <button className="date-nav__btn" onClick={goPrev} aria-label="Previous day">
        ←
      </button>
      <span className="date-nav__label">
        {label}
      </span>
      <button className="date-nav__btn" onClick={goNext} aria-label="Next day">
        →
      </button>
      {!isToday(date) && (
        <button className="date-nav__today" onClick={goToday}>
          {t('tasks.today')}
        </button>
      )}
    </div>
  )
}
