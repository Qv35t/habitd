import { describe, it, expect } from 'vitest'
import {
  getCalendarDays,
  getMonthLabel,
  nextMonth,
  prevMonth,
  todayYearMonth,
  buildCompletionMap,
  completionBar,
} from '@/utils/calendar'

// ─────────────────────────────────────────────────────────────────
// getCalendarDays
// ─────────────────────────────────────────────────────────────────

describe('getCalendarDays', () => {
  it('returns 35 days for a month that fits in 5 weeks', () => {
    // February 2026: starts Sunday (Feb 1), ends Saturday (Feb 28)
    // With Monday-start padding: needs 5 full weeks = 35 days
    const days = getCalendarDays(2026, 1)
    expect(days.length).toBe(35)
  })

  it('returns 35 days for April 2026', () => {
    // April 2026: starts Wednesday, ends Thursday
    // Monday-start padding: Mon Mar 30 → Thu Apr 30 = exactly 5 weeks = 35 days
    const days = getCalendarDays(2026, 3)
    expect(days.length).toBe(35)
  })

  it('returns 42 days for a month that needs 6 weeks', () => {
    // March 2026: starts Sunday (dow=0), ends Tuesday
    // Monday-start: Mon Feb 23 → Tue Mar 31 = 6 weeks = 42 days
    const days = getCalendarDays(2026, 2)
    expect(days.length).toBe(42)
  })

  it('pads previous month days at the start', () => {
    // April 2026 starts Wednesday → Monday, Tuesday are March 30, 31
    const days = getCalendarDays(2026, 3)
    expect(days[0].date).toBe('2026-03-30')
    expect(days[0].isCurrentMonth).toBe(false)
  })

  it('April 1, 2026 is Wednesday → index 2 in Monday-start grid', () => {
    const days = getCalendarDays(2026, 3)
    const apr1 = days.find((d) => d.dayOfMonth === 1 && d.isCurrentMonth)
    expect(apr1).toBeDefined()
    expect(apr1?.date).toBe('2026-04-01')
    expect(days.indexOf(apr1!)).toBe(2)
  })

  it('marks today correctly', () => {
    const today = new Date()
    const days = getCalendarDays(today.getFullYear(), today.getMonth())
    const todayCell = days.find((d) => d.isToday)
    expect(todayCell).toBeDefined()
    expect(todayCell?.dayOfMonth).toBe(today.getDate())
  })

  it('marks future dates correctly', () => {
    const today = new Date()
    const days = getCalendarDays(today.getFullYear(), today.getMonth())
    const todayIndex = days.findIndex((d) => d.isToday)
    const futureDays = days.slice(todayIndex + 1).filter((d) => d.isCurrentMonth)
    expect(futureDays.every((d) => d.isFuture)).toBe(true)
  })

  it('handles December → January boundary', () => {
    const days = getCalendarDays(2026, 11)
    expect(days.some((d) => d.date.startsWith('2027-01'))).toBe(true)
  })

  it('handles leap year February (2028)', () => {
    const days = getCalendarDays(2028, 1)
    const febDays = days.filter((d) => d.isCurrentMonth)
    expect(febDays.length).toBe(29)
  })

  it('handles non-leap year February (2026)', () => {
    const days = getCalendarDays(2026, 1)
    const febDays = days.filter((d) => d.isCurrentMonth)
    expect(febDays.length).toBe(28)
  })
})

// ─────────────────────────────────────────────────────────────────
// getMonthLabel
// ─────────────────────────────────────────────────────────────────

describe('getMonthLabel', () => {
  it('returns "April 2026" for month=3 (0-indexed)', () => {
    expect(getMonthLabel(2026, 3)).toBe('April 2026')
  })

  it('returns "January 2026" for month=0', () => {
    expect(getMonthLabel(2026, 0)).toBe('January 2026')
  })

  it('returns "December 2026" for month=11', () => {
    expect(getMonthLabel(2026, 11)).toBe('December 2026')
  })
})

// ─────────────────────────────────────────────────────────────────
// nextMonth
// ─────────────────────────────────────────────────────────────────

describe('nextMonth', () => {
  it('advances from April to May 2026', () => {
    expect(nextMonth(2026, 3)).toEqual({ year: 2026, month: 4 })
  })

  it('wraps from December to January', () => {
    expect(nextMonth(2026, 11)).toEqual({ year: 2027, month: 0 })
  })
})

// ─────────────────────────────────────────────────────────────────
// prevMonth
// ─────────────────────────────────────────────────────────────────

describe('prevMonth', () => {
  it('goes back from April to March 2026', () => {
    expect(prevMonth(2026, 3)).toEqual({ year: 2026, month: 2 })
  })

  it('wraps from January to December', () => {
    expect(prevMonth(2027, 0)).toEqual({ year: 2026, month: 11 })
  })
})

// ─────────────────────────────────────────────────────────────────
// buildCompletionMap
// ─────────────────────────────────────────────────────────────────

describe('buildCompletionMap', () => {
  it('returns empty object for empty input', () => {
    expect(buildCompletionMap([])).toEqual({})
  })

  it('counts single completion', () => {
    const result = buildCompletionMap(['2026-04-10'])
    expect(result).toEqual({ '2026-04-10': 1 })
  })

  it('accumulates multiple completions on same day', () => {
    const result = buildCompletionMap(['2026-04-10', '2026-04-10', '2026-04-10'])
    expect(result['2026-04-10']).toBe(3)
  })

  it('handles multiple different dates', () => {
    const result = buildCompletionMap(['2026-04-09', '2026-04-09', '2026-04-10'])
    expect(result).toEqual({ '2026-04-09': 2, '2026-04-10': 1 })
  })

  it('does not mutate input array', () => {
    const input = ['2026-04-10', '2026-04-09']
    const original = [...input]
    buildCompletionMap(input)
    expect(input).toEqual(original)
  })
})

// ─────────────────────────────────────────────────────────────────
// completionBar
// ─────────────────────────────────────────────────────────────────

describe('completionBar', () => {
  it('returns empty string for total=0', () => {
    expect(completionBar(0, 0)).toBe('')
  })

  it('returns all empty for count=0', () => {
    expect(completionBar(0, 4)).toBe('░░░░')
  })

  it('returns partial bar', () => {
    expect(completionBar(3, 5)).toBe('███░░')
  })

  it('returns full bar', () => {
    expect(completionBar(4, 4)).toBe('████')
  })

  it('caps count at total (overflow guard)', () => {
    expect(completionBar(10, 4)).toBe('████')
  })

  it('handles single slot', () => {
    expect(completionBar(1, 1)).toBe('█')
    expect(completionBar(0, 1)).toBe('░')
  })
})
