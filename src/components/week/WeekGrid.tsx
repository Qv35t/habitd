import { useMemo } from 'react'
import { format } from 'date-fns'
import { calcCurrentStreak } from '../../engine/streakEngine'
import { WeekDayHeader } from './WeekDayHeader'
import { WeekHabitRow }  from './WeekHabitRow'
import type { WeekViewData } from '../../types'

interface WeekGridProps {
  data: WeekViewData
}

/**
 * 7-column habit×day grid.
 * grid-template-columns: 22ch repeat(7, 1fr) 5ch
 * Loading → "loading..."   habits=0 → "no active habits"
 *
 * Cells call toggleCompletion() directly — no prop drilling needed.
 */
export function WeekGrid({ data }: WeekGridProps) {
  if (data.isLoading) {
    return <div className="week-grid-empty">loading...</div>
  }

  if (data.habits.length === 0) {
    return <div className="week-grid-empty">no active habits</div>
  }

  // Compute streaks for each habit
  const streaks = useMemo<Record<string, number>>(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const result: Record<string, number> = {}
    for (const habit of data.habits) {
      const dates = data.completionMap[habit.id]
        ? Array.from(data.completionMap[habit.id])
        : []
      result[habit.id] = calcCurrentStreak(dates, today)
    }
    return result
  }, [data.habits, data.completionMap])

  // Determine which columns need month labels
  const monthVisibility = useMemo<boolean[]>(() => {
    const vis: boolean[] = []
    for (let i = 0; i < data.weekDays.length; i++) {
      if (i === 0) {
        vis.push(true)
      } else {
        vis.push(data.weekDays[i].monthLabel !== data.weekDays[i - 1].monthLabel)
      }
    }
    return vis
  }, [data.weekDays])

  return (
    <div className="week-grid-wrapper">
      <div className="week-grid" role="table">
        {/* Header row */}
        <div className="week-grid-header-name" role="columnheader" />
        {data.weekDays.map((day, i) => (
          <WeekDayHeader key={day.date} day={day} showMonth={monthVisibility[i]} />
        ))}
        <div className="week-grid-header-spacer" role="columnheader" />

        {/* Habit rows */}
        {data.habits.map(habit => (
          <WeekHabitRow
            key={habit.id}
            habit={habit}
            weekDays={data.weekDays}
            completionMap={data.completionMap}
            streakDays={streaks[habit.id] ?? 0}
          />
        ))}
      </div>
    </div>
  )
}
