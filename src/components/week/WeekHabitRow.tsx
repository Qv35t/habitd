import { isCellCompleted } from '../../utils/week'
import { WeekCell } from './WeekCell'
import type { Habit, WeekDay } from '../../types'

interface WeekHabitRowProps {
  habit: Habit
  weekDays: WeekDay[]
  completionMap: Record<string, Set<string>>
  streakDays: number
}

/** Habit row: name (22ch max) + 7 WeekCell columns + streak badge */
export function WeekHabitRow({ habit, weekDays, completionMap, streakDays }: WeekHabitRowProps) {
  const nameStr = `${habit.symbol} ${habit.name}`.slice(0, 22)
  return (
    <div className="week-habit-row" role="row">
      <div className="week-habit-name" title={`${habit.symbol} ${habit.name}`}>
        {nameStr}
      </div>
      {weekDays.map(day => (
        <WeekCell
          key={day.date}
          date={day.date}
          habitId={habit.id}
          isCompleted={isCellCompleted(completionMap, habit.id, day.date)}
          isFuture={day.isFuture}
          isToday={day.isToday}
        />
      ))}
      <div className="week-streak-badge">
        {streakDays > 0 ? `${streakDays}d` : '–'}
      </div>
    </div>
  )
}
