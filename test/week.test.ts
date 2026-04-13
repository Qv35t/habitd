import { describe, it, expect } from 'vitest'
import {
  getWeekReferenceDate,
  getWeekDays,
  getWeekLabel,
  getWeekBounds,
  buildWeekCompletionMap,
  isCellCompleted,
  calcWeekTotalPossible,
  calcWeekTotalCompleted,
  calcWeekCompletionRate,
} from '@/utils/week'
import type { WeekDay, Completion } from '@/types'

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const TODAY = '2026-04-10' // Saturday (ISO: 2026-W15, Fri=10th is Sat)

function makeCompletion(
  habitId: string,
  date: string
): Completion {
  return { id: `c-${habitId}-${date}`, habitId, date }
}

// ─────────────────────────────────────────────────────────────────
// getWeekReferenceDate
// ─────────────────────────────────────────────────────────────────

describe('getWeekReferenceDate', () => {
  it('returns Monday of current week when offset=0', () => {
    // 2026-04-10 is Saturday. Monday of that week is 2026-04-06.
    const result = getWeekReferenceDate(0, TODAY)
    expect(result).toBe('2026-04-06')
  })

  it('returns Monday of next week when offset=1', () => {
    const result = getWeekReferenceDate(1, TODAY)
    expect(result).toBe('2026-04-13')
  })

  it('returns Monday of previous week when offset=-1', () => {
    const result = getWeekReferenceDate(-1, TODAY)
    expect(result).toBe('2026-03-30')
  })

  it('returns Monday 3 weeks ahead when offset=3', () => {
    const result = getWeekReferenceDate(3, TODAY)
    expect(result).toBe('2026-04-27')
  })
})

// ─────────────────────────────────────────────────────────────────
// getWeekDays
// ─────────────────────────────────────────────────────────────────

describe('getWeekDays', () => {
  it('returns exactly 7 days', () => {
    const days = getWeekDays('2026-04-06', TODAY)
    expect(days).toHaveLength(7)
  })

  it('starts on Monday', () => {
    const days = getWeekDays('2026-04-06', TODAY)
    expect(days[0].date).toBe('2026-04-06')
    expect(days[0].dayLabel.toLowerCase()).toBe('mon')
  })

  it('ends on Sunday', () => {
    const days = getWeekDays('2026-04-06', TODAY)
    expect(days[6].date).toBe('2026-04-12')
    expect(days[6].dayLabel.toLowerCase()).toBe('sun')
  })

  it('marks today as isToday=true', () => {
    const days = getWeekDays('2026-04-06', TODAY)
    const todayDay = days.find(d => d.date === TODAY)
    expect(todayDay?.isToday).toBe(true)
  })

  it('marks future days as isFuture=true', () => {
    const days = getWeekDays('2026-04-06', TODAY)
    // Apr 11 and Apr 12 are in the future relative to Apr 10
    expect(days[5].isFuture).toBe(true) // Apr 11
    expect(days[6].isFuture).toBe(true) // Apr 12
  })

  it('does not mark past days as isFuture', () => {
    const days = getWeekDays('2026-04-06', TODAY)
    expect(days[0].isFuture).toBe(false) // Apr 06
    expect(days[3].isFuture).toBe(false) // Apr 09
  })
})

// ─────────────────────────────────────────────────────────────────
// getWeekLabel
// ─────────────────────────────────────────────────────────────────

describe('getWeekLabel', () => {
  it('formats same-month week as "Apr 6 – 12, 2026"', () => {
    const days = getWeekDays('2026-04-06', TODAY)
    const label = getWeekLabel(days)
    expect(label).toBe('Apr 6 – 12, 2026')
  })

  it('formats cross-month week correctly', () => {
    // 2026-03-30 is Monday, 2026-04-05 is Sunday
    const days = getWeekDays('2026-03-30', TODAY)
    const label = getWeekLabel(days)
    expect(label).toBe('Mar 30 – Apr 5, 2026')
  })

  it('handles year boundary cross-month', () => {
    // 2025-12-29 is Monday, 2026-01-04 is Sunday
    const days = getWeekDays('2025-12-29', '2026-01-01')
    const label = getWeekLabel(days)
    expect(label).toBe('Dec 29 – Jan 4, 2026')
  })
})

// ─────────────────────────────────────────────────────────────────
// getWeekBounds
// ─────────────────────────────────────────────────────────────────

describe('getWeekBounds', () => {
  it('returns correct Monday and Sunday for a given date', () => {
    const { weekStart, weekEnd } = getWeekBounds('2026-04-10')
    expect(weekStart).toBe('2026-04-06')
    expect(weekEnd).toBe('2026-04-12')
  })
})

// ─────────────────────────────────────────────────────────────────
// buildWeekCompletionMap & isCellCompleted
// ─────────────────────────────────────────────────────────────────

describe('buildWeekCompletionMap', () => {
  it('builds correct map from completions', () => {
    const completions = [
      makeCompletion('h1', '2026-04-06T00:00:00Z'),
      makeCompletion('h2', '2026-04-06T00:00:00Z'),
      makeCompletion('h1', '2026-04-07T00:00:00Z'),
    ]
    const map = buildWeekCompletionMap(completions)

    expect(map['2026-04-06']?.has('h1')).toBe(true)
    expect(map['2026-04-06']?.has('h2')).toBe(true)
    expect(map['2026-04-07']?.has('h1')).toBe(true)
    expect(map['2026-04-07']?.has('h2')).toBe(false)
  })

  it('handles empty completions', () => {
    const map = buildWeekCompletionMap([])
    expect(Object.keys(map)).toHaveLength(0)
  })
})

describe('isCellCompleted', () => {
  it('returns true when habit completed on date', () => {
    const map: Record<string, Set<string>> = {
      '2026-04-06': new Set(['h1', 'h2']),
    }
    expect(isCellCompleted(map, 'h1', '2026-04-06')).toBe(true)
    expect(isCellCompleted(map, 'h2', '2026-04-06')).toBe(true)
  })

  it('returns false when habit not completed on date', () => {
    const map: Record<string, Set<string>> = {
      '2026-04-06': new Set(['h1']),
    }
    expect(isCellCompleted(map, 'h2', '2026-04-06')).toBe(false)
  })

  it('returns false for missing date', () => {
    const map: Record<string, Set<string>> = {}
    expect(isCellCompleted(map, 'h1', '2026-04-06')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
// calcWeekTotalPossible, calcWeekTotalCompleted, calcWeekCompletionRate
// ─────────────────────────────────────────────────────────────────

describe('calcWeekTotalPossible', () => {
  it('calculates habits × non-future days', () => {
    const habits = [{ id: 'h1' }, { id: 'h2' }, { id: 'h3' }]
    const weekDays: WeekDay[] = [
      { date: '2026-04-06', dayLabel: 'Mon', dayOfMonth: 6, monthLabel: 'Apr', isToday: false, isFuture: false },
      { date: '2026-04-07', dayLabel: 'Tue', dayOfMonth: 7, monthLabel: 'Apr', isToday: false, isFuture: false },
      { date: '2026-04-08', dayLabel: 'Wed', dayOfMonth: 8, monthLabel: 'Apr', isToday: false, isFuture: false },
      { date: '2026-04-09', dayLabel: 'Thu', dayOfMonth: 9, monthLabel: 'Apr', isToday: false, isFuture: false },
      { date: '2026-04-10', dayLabel: 'Fri', dayOfMonth: 10, monthLabel: 'Apr', isToday: true,  isFuture: false },
      { date: '2026-04-11', dayLabel: 'Sat', dayOfMonth: 11, monthLabel: 'Apr', isToday: false, isFuture: true },
      { date: '2026-04-12', dayLabel: 'Sun', dayOfMonth: 12, monthLabel: 'Apr', isToday: false, isFuture: true },
    ]
    // 3 habits × 5 non-future days = 15
    expect(calcWeekTotalPossible(habits, weekDays)).toBe(15)
  })

  it('returns 0 when no habits', () => {
    const weekDays: WeekDay[] = []
    expect(calcWeekTotalPossible([], weekDays)).toBe(0)
  })
})

describe('calcWeekTotalCompleted', () => {
  it('counts completed cells excluding future days', () => {
    const habits = [{ id: 'h1' }, { id: 'h2' }]
    const weekDays: WeekDay[] = [
      { date: '2026-04-06', dayLabel: 'Mon', dayOfMonth: 6, monthLabel: 'Apr', isToday: false, isFuture: false },
      { date: '2026-04-07', dayLabel: 'Tue', dayOfMonth: 7, monthLabel: 'Apr', isToday: false, isFuture: false },
      { date: '2026-04-08', dayLabel: 'Wed', dayOfMonth: 8, monthLabel: 'Apr', isToday: false, isFuture: true },
      { date: '2026-04-09', dayLabel: 'Thu', dayOfMonth: 9, monthLabel: 'Apr', isToday: false, isFuture: false },
      { date: '2026-04-10', dayLabel: 'Fri', dayOfMonth: 10, monthLabel: 'Apr', isToday: true,  isFuture: false },
      { date: '2026-04-11', dayLabel: 'Sat', dayOfMonth: 11, monthLabel: 'Apr', isToday: false, isFuture: true },
      { date: '2026-04-12', dayLabel: 'Sun', dayOfMonth: 12, monthLabel: 'Apr', isToday: false, isFuture: true },
    ]
    const map: Record<string, Set<string>> = {
      '2026-04-06': new Set(['h1']),        // 1
      '2026-04-07': new Set(['h1', 'h2']),  // 2
      '2026-04-08': new Set(['h1', 'h2']),  // future — should be excluded
      '2026-04-09': new Set(['h2']),        // 1
      '2026-04-10': new Set(['h1']),        // 1
    }
    // Non-future days: Mon, Tue, Thu, Fri = 4 days
    // Completed on non-future: h1 Mon + h1 Tue + h2 Tue + h2 Thu + h1 Fri = 5
    expect(calcWeekTotalCompleted(map, habits, weekDays)).toBe(5)
  })
})

describe('calcWeekCompletionRate', () => {
  it('returns correct percentage rounded to 1 decimal', () => {
    expect(calcWeekCompletionRate(7, 10)).toBe(70)
    expect(calcWeekCompletionRate(1, 3)).toBe(33.3)
    expect(calcWeekCompletionRate(2, 3)).toBe(66.7)
  })

  it('returns 0 when totalPossible is 0', () => {
    expect(calcWeekCompletionRate(0, 0)).toBe(0)
    expect(calcWeekCompletionRate(5, 0)).toBe(0)
  })

  it('returns 100 when all completed', () => {
    expect(calcWeekCompletionRate(16, 16)).toBe(100)
  })
})
