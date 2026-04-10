import { describe, it, expect } from 'vitest'
import {
  calcCurrentStreak,
  calcLongestStreak,
  calcCompletionRate,
  calcHeatmap,
  computeHabitStats,
  computeGlobalStats,
  getHeatmapLevel,
  getHeatmapChar,
  HEATMAP_CHARS,
} from '@/engine/streakEngine'
import type { Habit } from '@/types'

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const TODAY = '2026-04-10'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id:         'test-id',
    name:       'Test Habit',
    symbol:     '●',
    accentChar: 'bright',
    createdAt:  '2026-01-01',
    archivedAt: '',
    sortOrder:  0,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────
// calcCurrentStreak
// ─────────────────────────────────────────────────────────────────

describe('calcCurrentStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calcCurrentStreak([], TODAY)).toBe(0)
  })

  it('returns 1 if only today is completed', () => {
    expect(calcCurrentStreak([TODAY], TODAY)).toBe(1)
  })

  it('returns 1 if only yesterday is completed', () => {
    expect(calcCurrentStreak(['2026-04-09'], TODAY)).toBe(1)
  })

  it('returns 0 if last completion was 2 days ago', () => {
    expect(calcCurrentStreak(['2026-04-08'], TODAY)).toBe(0)
  })

  it('returns 0 if last completion was a week ago', () => {
    expect(calcCurrentStreak(['2026-04-03'], TODAY)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const dates = ['2026-04-08', '2026-04-09', '2026-04-10']
    expect(calcCurrentStreak(dates, TODAY)).toBe(3)
  })

  it('counts consecutive days ending yesterday (today not marked)', () => {
    const dates = ['2026-04-07', '2026-04-08', '2026-04-09']
    expect(calcCurrentStreak(dates, TODAY)).toBe(3)
  })

  it('stops at first gap', () => {
    // 04-06 is missing → gap between 05 and 07
    const dates = ['2026-04-05', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10']
    expect(calcCurrentStreak(dates, TODAY)).toBe(4) // 07,08,09,10
  })

  it('handles large streak of 30 days', () => {
    const dates: string[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date('2026-04-10')
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().slice(0, 10))
    }
    expect(calcCurrentStreak(dates, TODAY)).toBe(30)
  })

  it('ignores future dates', () => {
    const dates = ['2026-04-09', '2026-04-10', '2026-04-11', '2026-04-12']
    expect(calcCurrentStreak(dates, TODAY)).toBe(2) // only 09 and 10 count
  })

  it('handles duplicate dates (deduplication)', () => {
    const dates = ['2026-04-09', '2026-04-09', '2026-04-10', '2026-04-10']
    expect(calcCurrentStreak(dates, TODAY)).toBe(2)
  })

  it('does not mutate the input array', () => {
    const dates = ['2026-04-10', '2026-04-09', '2026-04-08']
    const original = [...dates]
    calcCurrentStreak(dates, TODAY)
    expect(dates).toEqual(original)
  })

  it('returns 0 when all dates are in the future', () => {
    const dates = ['2026-04-11', '2026-04-12', '2026-04-13']
    expect(calcCurrentStreak(dates, TODAY)).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────
// calcLongestStreak
// ─────────────────────────────────────────────────────────────────

describe('calcLongestStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calcLongestStreak([])).toBe(0)
  })

  it('returns 1 for single date', () => {
    expect(calcLongestStreak([TODAY])).toBe(1)
  })

  it('returns 2 for two consecutive days', () => {
    expect(calcLongestStreak(['2026-04-09', '2026-04-10'])).toBe(2)
  })

  it('returns 1 for two non-consecutive days', () => {
    expect(calcLongestStreak(['2026-04-08', '2026-04-10'])).toBe(1)
  })

  it('finds longest streak across multiple segments', () => {
    // Segment 1: 01,02,03 (3) | Segment 2: 05,06 (2) | Segment 3: 08,09,10,11 (4)
    const dates = [
      '2026-04-01', '2026-04-02', '2026-04-03',
      '2026-04-05', '2026-04-06',
      '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-11',
    ]
    expect(calcLongestStreak(dates)).toBe(4)
  })

  it('handles streak entirely in the past', () => {
    const dates = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05']
    expect(calcLongestStreak(dates)).toBe(5)
  })

  it('handles duplicate dates', () => {
    const dates = ['2026-04-09', '2026-04-09', '2026-04-10', '2026-04-10', '2026-04-11']
    expect(calcLongestStreak(dates)).toBe(3)
  })

  it('does not mutate input array', () => {
    const dates = ['2026-04-10', '2026-04-09', '2026-04-08']
    const original = [...dates]
    calcLongestStreak(dates)
    expect(dates).toEqual(original)
  })

  it('handles single-day gaps throughout (longest = 1)', () => {
    const dates = ['2026-04-02', '2026-04-04', '2026-04-06', '2026-04-08']
    expect(calcLongestStreak(dates)).toBe(1)
  })

  it('returns correct value when streak crosses month boundary', () => {
    const dates = ['2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02']
    expect(calcLongestStreak(dates)).toBe(4)
  })
})

// ─────────────────────────────────────────────────────────────────
// calcCompletionRate
// ─────────────────────────────────────────────────────────────────

describe('calcCompletionRate', () => {
  it('returns 0 for empty array', () => {
    expect(calcCompletionRate([], 30, TODAY)).toBe(0)
  })

  it('returns 0 when days <= 0', () => {
    expect(calcCompletionRate([TODAY], 0, TODAY)).toBe(0)
    expect(calcCompletionRate([TODAY], -1, TODAY)).toBe(0)
  })

  it('returns 100 when all days completed (days=1)', () => {
    expect(calcCompletionRate([TODAY], 1, TODAY)).toBe(100)
  })

  it('returns 100 when every day in 7-day window completed', () => {
    const dates = [
      '2026-04-04', '2026-04-05', '2026-04-06', '2026-04-07',
      '2026-04-08', '2026-04-09', '2026-04-10',
    ]
    expect(calcCompletionRate(dates, 7, TODAY)).toBe(100)
  })

  it('calculates rate correctly for 3/30 days', () => {
    const dates = ['2026-04-08', '2026-04-09', '2026-04-10']
    expect(calcCompletionRate(dates, 30, TODAY)).toBe(10.0)
  })

  it('excludes completions outside the window', () => {
    const datesInWindow    = ['2026-04-08', '2026-04-09', '2026-04-10']
    const datesOutOfWindow = ['2026-03-01', '2026-02-15']
    expect(calcCompletionRate([...datesInWindow, ...datesOutOfWindow], 30, TODAY))
      .toBe(10.0)
  })

  it('handles duplicate dates within window (dedup)', () => {
    const dates = ['2026-04-10', '2026-04-10', '2026-04-10']
    expect(calcCompletionRate(dates, 7, TODAY)).toBeCloseTo(14.3, 0)
  })

  it('caps result at 100 (no overflow)', () => {
    const dates = Array.from({ length: 35 }, (_, i) => {
      const d = new Date('2026-04-10')
      d.setDate(d.getDate() - i)
      return d.toISOString().slice(0, 10)
    })
    expect(calcCompletionRate(dates, 30, TODAY)).toBe(100)
  })

  it('returns rate with 1 decimal precision', () => {
    const dates = ['2026-04-10']
    const rate = calcCompletionRate(dates, 3, TODAY)
    expect(rate).toBe(33.3)
  })

  it('excludes future dates from calculation', () => {
    const dates = ['2026-04-10', '2026-04-11', '2026-04-12']
    expect(calcCompletionRate(dates, 7, TODAY)).toBeCloseTo(14.3, 0)
  })
})

// ─────────────────────────────────────────────────────────────────
// calcHeatmap
// ─────────────────────────────────────────────────────────────────

describe('calcHeatmap', () => {
  it('returns empty object for empty array', () => {
    expect(calcHeatmap([])).toEqual({})
  })

  it('counts single completion', () => {
    expect(calcHeatmap([{ date: '2026-04-10' }])).toEqual({ '2026-04-10': 1 })
  })

  it('accumulates multiple completions on same day', () => {
    const completions = [
      { date: '2026-04-10' },
      { date: '2026-04-10' },
      { date: '2026-04-10' },
    ]
    expect(calcHeatmap(completions)).toEqual({ '2026-04-10': 3 })
  })

  it('groups completions by date correctly', () => {
    const completions = [
      { date: '2026-04-08' },
      { date: '2026-04-09' },
      { date: '2026-04-09' },
      { date: '2026-04-10' },
      { date: '2026-04-10' },
      { date: '2026-04-10' },
    ]
    expect(calcHeatmap(completions)).toEqual({
      '2026-04-08': 1,
      '2026-04-09': 2,
      '2026-04-10': 3,
    })
  })

  it('handles completions across different months', () => {
    const completions = [
      { date: '2026-03-31' },
      { date: '2026-04-01' },
      { date: '2026-04-01' },
    ]
    const result = calcHeatmap(completions)
    expect(result['2026-03-31']).toBe(1)
    expect(result['2026-04-01']).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────
// computeHabitStats
// ─────────────────────────────────────────────────────────────────

describe('computeHabitStats', () => {
  it('returns zeroed stats for habit with no completions', () => {
    const habit = makeHabit()
    const stats = computeHabitStats(habit, [], TODAY)

    expect(stats.habit).toBe(habit)
    expect(stats.completedDates).toEqual([])
    expect(stats.currentStreak).toBe(0)
    expect(stats.longestStreak).toBe(0)
    expect(stats.completionRate).toBe(0)
    expect(stats.totalCompletions).toBe(0)
  })

  it('returns correct stats for active streak', () => {
    const dates = ['2026-04-08', '2026-04-09', '2026-04-10']
    const stats = computeHabitStats(makeHabit(), dates, TODAY)

    expect(stats.currentStreak).toBe(3)
    expect(stats.longestStreak).toBe(3)
    expect(stats.totalCompletions).toBe(3)
  })

  it('normalizes completedDates (dedup, sort ASC, filter future)', () => {
    const dates = ['2026-04-10', '2026-04-08', '2026-04-09', '2026-04-12', '2026-04-08']
    const stats = computeHabitStats(makeHabit(), dates, TODAY)

    expect(stats.completedDates).toEqual(['2026-04-08', '2026-04-09', '2026-04-10'])
    expect(stats.totalCompletions).toBe(3)
  })

  it('currentStreak != longestStreak when history has larger streak', () => {
    const dates = [
      '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05', // 5-day streak
      '2026-04-09', '2026-04-10', // 2-day current streak
    ]
    const stats = computeHabitStats(makeHabit(), dates, TODAY)

    expect(stats.currentStreak).toBe(2)
    expect(stats.longestStreak).toBe(5)
  })
})

// ─────────────────────────────────────────────────────────────────
// computeGlobalStats
// ─────────────────────────────────────────────────────────────────

describe('computeGlobalStats', () => {
  it('returns zeroed stats for empty habits array', () => {
    const stats = computeGlobalStats([], TODAY)

    expect(stats.totalHabits).toBe(0)
    expect(stats.activeHabits).toBe(0)
    expect(stats.heatmapData).toEqual({})
    expect(stats.topStreakHabit).toBeNull()
    expect(stats.overallCompletionRate).toBe(0)
  })

  it('counts total vs active habits correctly', () => {
    const habitsWithDates = [
      { habit: makeHabit({ id: '1', archivedAt: '' }),          dates: [] },
      { habit: makeHabit({ id: '2', archivedAt: '' }),          dates: [] },
      { habit: makeHabit({ id: '3', archivedAt: '2026-03-01' }), dates: [] },
    ]
    const stats = computeGlobalStats(habitsWithDates, TODAY)

    expect(stats.totalHabits).toBe(3)
    expect(stats.activeHabits).toBe(2)
  })

  it('selects topStreakHabit from active habits only', () => {
    const habitsWithDates = [
      {
        habit: makeHabit({ id: '1', archivedAt: '' }),
        dates: ['2026-04-09', '2026-04-10'], // streak = 2
      },
      {
        habit: makeHabit({ id: '2', archivedAt: '' }),
        dates: ['2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10'], // streak = 4
      },
      {
        habit: makeHabit({ id: '3', archivedAt: '2026-03-01' }),
        dates: ['2026-04-08', '2026-04-09', '2026-04-10'], // streak = 3
      },
    ]
    const stats = computeGlobalStats(habitsWithDates, TODAY)

    expect(stats.topStreakHabit?.habit.id).toBe('2')
  })

  it('topStreakHabit is null when all habits are archived', () => {
    const habitsWithDates = [
      { habit: makeHabit({ id: '1', archivedAt: '2026-03-01' }), dates: ['2026-04-10'] },
    ]
    const stats = computeGlobalStats(habitsWithDates, TODAY)
    expect(stats.topStreakHabit).toBeNull()
  })

  it('computes heatmap across all habits (active + archived)', () => {
    const habitsWithDates = [
      {
        habit: makeHabit({ id: '1', archivedAt: '' }),
        dates: ['2026-04-10'],
      },
      {
        habit: makeHabit({ id: '2', archivedAt: '' }),
        dates: ['2026-04-10', '2026-04-09'],
      },
    ]
    const stats = computeGlobalStats(habitsWithDates, TODAY)

    expect(stats.heatmapData['2026-04-10']).toBe(2)
    expect(stats.heatmapData['2026-04-09']).toBe(1)
  })

  it('calculates overallCompletionRate as average of active habits', () => {
    const habit1Dates: string[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date('2026-04-10')
      d.setDate(d.getDate() - i)
      habit1Dates.push(d.toISOString().slice(0, 10))
    }
    const habitsWithDates = [
      { habit: makeHabit({ id: '1', archivedAt: '' }), dates: habit1Dates },
      { habit: makeHabit({ id: '2', archivedAt: '' }), dates: [] },
    ]
    const stats = computeGlobalStats(habitsWithDates, TODAY)
    expect(stats.overallCompletionRate).toBe(50.0) // (100 + 0) / 2
  })
})

// ─────────────────────────────────────────────────────────────────
// getHeatmapLevel
// ─────────────────────────────────────────────────────────────────

describe('getHeatmapLevel', () => {
  it('returns 0 for count=0', () => {
    expect(getHeatmapLevel(0, 10)).toBe(0)
  })

  it('returns 0 when maxCount=0 (avoid division by zero)', () => {
    expect(getHeatmapLevel(0, 0)).toBe(0)
  })

  it('returns 1 for ratio <= 0.25', () => {
    expect(getHeatmapLevel(2, 10)).toBe(1)
    expect(getHeatmapLevel(1, 4)).toBe(1)
  })

  it('returns 2 for ratio <= 0.5', () => {
    expect(getHeatmapLevel(3, 10)).toBe(2)
    expect(getHeatmapLevel(5, 10)).toBe(2)
  })

  it('returns 3 for ratio <= 0.75', () => {
    expect(getHeatmapLevel(6, 10)).toBe(3)
    expect(getHeatmapLevel(7, 10)).toBe(3)
  })

  it('returns 4 for ratio > 0.75', () => {
    expect(getHeatmapLevel(8, 10)).toBe(4)
    expect(getHeatmapLevel(10, 10)).toBe(4)
  })
})

// ─────────────────────────────────────────────────────────────────
// getHeatmapChar / HEATMAP_CHARS
// ─────────────────────────────────────────────────────────────────

describe('getHeatmapChar', () => {
  it('returns correct char for each level', () => {
    expect(getHeatmapChar(0)).toBe('·')
    expect(getHeatmapChar(1)).toBe('░')
    expect(getHeatmapChar(2)).toBe('▒')
    expect(getHeatmapChar(3)).toBe('▓')
    expect(getHeatmapChar(4)).toBe('█')
  })

  it('HEATMAP_CHARS has exactly 5 entries', () => {
    expect(HEATMAP_CHARS.length).toBe(5)
  })
})
