/**
 * useWeekData — composite Dexie hook for WeekView.
 * Uses useLiveQuery for reactive data — never useEffect for fetching.
 */
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { db } from '../db'
import {
  getWeekReferenceDate,
  getWeekDays,
  getWeekLabel,
  getWeekBounds,
  buildWeekCompletionMap,
  calcWeekTotalPossible,
  calcWeekTotalCompleted,
  calcWeekCompletionRate,
} from '../utils/week'
import type { WeekViewData } from '../types'

/**
 * Assembles all data for WeekView from Dexie.
 * @param weekOffset - 0 = current week, negative = past, positive = future
 */
export function useWeekData(weekOffset: number): WeekViewData {
  const today   = format(new Date(), 'yyyy-MM-dd')
  const refDate = getWeekReferenceDate(weekOffset, today)
  const { weekStart, weekEnd } = getWeekBounds(refDate)

  const habits = useLiveQuery(
    () => db.habits.where('archivedAt').equals('').sortBy('sortOrder'),
    [],
  )

  const completions = useLiveQuery(
    () => db.completions
      .where('date')
      .between(weekStart, weekEnd, true, true)
      .toArray(),
    [weekStart, weekEnd],
  )

  return useMemo<WeekViewData>(() => {
    if (habits === undefined || completions === undefined) {
      return {
        isLoading: true,
        weekDays: [],
        habits: [],
        completionMap: {},
        weekLabel: '',
        totalPossible: 0,
        totalCompleted: 0,
        completionRate: 0,
      }
    }

    const weekDays       = getWeekDays(refDate, today)
    const completionMap  = buildWeekCompletionMap(completions)
    const weekLabel      = getWeekLabel(weekDays)
    const totalPossible  = calcWeekTotalPossible(habits, weekDays)
    const totalCompleted = calcWeekTotalCompleted(completionMap, habits, weekDays)
    const completionRate = calcWeekCompletionRate(totalCompleted, totalPossible)

    return {
      isLoading: false,
      weekDays,
      habits,
      completionMap,
      weekLabel,
      totalPossible,
      totalCompleted,
      completionRate,
    }
  }, [habits, completions, weekOffset, today])
}
