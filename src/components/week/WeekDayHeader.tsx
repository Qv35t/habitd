import type { WeekDay } from '../../types'

interface WeekDayHeaderProps {
  day: WeekDay
  showMonth: boolean
}

/** Column header: optional monthLabel · dayLabel lowercase · dayOfMonth */
export function WeekDayHeader({ day, showMonth }: WeekDayHeaderProps) {
  return (
    <div className={[
      'week-day-header',
      day.isToday  ? 'week-day-header--today'  : '',
      day.isFuture ? 'week-day-header--future' : '',
    ].filter(Boolean).join(' ')}>
      <span className="week-day-header__month">{showMonth ? day.monthLabel : ''}</span>
      <span className="week-day-header__label">{day.dayLabel.toLowerCase()}</span>
      <span className="week-day-header__num">{day.dayOfMonth}</span>
    </div>
  )
}
