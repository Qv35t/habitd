import { subDays, addDays, format, parseISO, isToday } from 'date-fns'
import { useUIStore } from '@/stores/useUIStore'

/**
 * Date navigation for TasksView.
 *
 * Visual: ← [28 января 2026] →   [сегодня]
 *
 * Uses Russian month abbreviations for display.
 * Button [сегодня] shown only when active date ≠ today.
 */
export function DateNav() {
  const tasksActiveDate = useUIStore((s) => s.tasksActiveDate)
  const setTasksActiveDate = useUIStore((s) => s.setTasksActiveDate)

  const monthsRu = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]

  const date = parseISO(tasksActiveDate + 'T00:00:00')
  const day = date.getDate()
  const month = monthsRu[date.getMonth()]
  const year = date.getFullYear()
  const label = `${day} ${month} ${year}`

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
          сегодня
        </button>
      )}
    </div>
  )
}
