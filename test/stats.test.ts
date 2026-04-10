import { describe, it, expect } from 'vitest'
import {
  resolvePeriodDays,
  buildHeatmapWeeks,
  calcTotalDaysTracked,
  getTopByCurrentStreak,
  computeSummary,
  filterHabitStats,
} from '@/utils/stats'
import type { Habit, HabitStatsRow, StatsPeriod } from '@/types'

// ─────────────────────────────────────────────
// TEST FIXTURES
// ─────────────────────────────────────────────

const TODAY = '2026-04-10'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'test habit',
    symbol: '●',
    accentChar: 'bright',
    createdAt: '2026-01-01',
    archivedAt: '',
    sortOrder: 0,
    ...overrides,
  }
}

function makeRow(overrides: Partial<HabitStatsRow> = {}): HabitStatsRow {
  return {
    habit: makeHabit(),
    currentStreak: 5,
    longestStreak: 10,
    completionRate: 50,
    totalCompletions: 30,
    firstCompletionDate: '2026-01-10',
    ...overrides,
  }
}

// ─────────────────────────────────────────────
// resolvePeriodDays
// ─────────────────────────────────────────────

describe('resolvePeriodDays', () => {
  it('returns fixed days for 7d', () => {
    expect(resolvePeriodDays('7d', TODAY, '2026-01-01')).toBe(7)
  })

  it('returns 30 for 30d', () => {
    expect(resolvePeriodDays('30d', TODAY, '2026-01-01')).toBe(30)
  })

  it('returns 90 for 90d', () => {
    expect(resolvePeriodDays('90d', TODAY, '2026-01-01')).toBe(90)
  })

  it('calculates days from earliestCreatedAt for all', () => {
    // 2026-01-01 to 2026-04-10 = 99 diff + 1 = 100
    expect(resolvePeriodDays('all', '2026-04-10', '2026-01-01')).toBe(100)
  })

  it('returns minimum 1 for all with same-day createdAt', () => {
    expect(resolvePeriodDays('all', TODAY, TODAY)).toBe(1)
  })

  it('returns minimum 1 for all with future createdAt', () => {
    expect(resolvePeriodDays('all', '2026-04-10', '2026-04-15')).toBe(1)
  })
})

// ─────────────────────────────────────────────
// buildHeatmapWeeks
// ─────────────────────────────────────────────

describe('buildHeatmapWeeks', () => {
  it('returns exactly 52 weeks', () => {
    const weeks = buildHeatmapWeeks({}, 0, TODAY)
    expect(weeks).toHaveLength(52)
  })

  it('each week has exactly 7 cells', () => {
    const weeks = buildHeatmapWeeks({}, 0, TODAY)
    weeks.forEach((w) => expect(w.cells).toHaveLength(7))
  })

  it('today cell has isToday=true', () => {
    const weeks = buildHeatmapWeeks({}, 0, TODAY)
    const todayCells = weeks.flatMap((w) => w.cells).filter((c) => c.isToday)
    expect(todayCells).toHaveLength(1)
    expect(todayCells[0].date).toBe(TODAY)
  })

  it('future cells have isFuture=true and count=0', () => {
    const weeks = buildHeatmapWeeks({}, 0, TODAY)
    const futureCells = weeks.flatMap((w) => w.cells).filter((c) => c.isFuture)
    futureCells.forEach((c) => {
      expect(c.count).toBe(0)
      expect(c.level).toBe(0)
    })
  })

  it('cells with count > 0 have level > 0', () => {
    const heatmap: Record<string, number> = { [TODAY]: 5 }
    const weeks = buildHeatmapWeeks(heatmap, 5, TODAY)
    const todayCells = weeks.flatMap((w) => w.cells).filter((c) => c.isToday)
    expect(todayCells[0].level).toBeGreaterThan(0)
  })

  it('empty heatmap → all cells level 0', () => {
    const weeks = buildHeatmapWeeks({}, 0, TODAY)
    const nonZero = weeks.flatMap((w) => w.cells).filter((c) => !c.isFuture && c.level !== 0)
    expect(nonZero).toHaveLength(0)
  })

  it('cell at max count gets level 4 and char █', () => {
    const heatmap: Record<string, number> = { [TODAY]: 10 }
    const weeks = buildHeatmapWeeks(heatmap, 10, TODAY)
    const todayCells = weeks.flatMap((w) => w.cells).filter((c) => c.isToday)
    expect(todayCells[0].level).toBe(4)
    expect(todayCells[0].char).toBe('█')
  })

  it('first week starts on a Monday', () => {
    const weeks = buildHeatmapWeeks({}, 0, TODAY)
    const firstCellDate = new Date(weeks[0].cells[0].date)
    expect(firstCellDate.getDay()).toBe(1) // 1 = Monday
  })

  it('weekIndex increments 0 to 51', () => {
    const weeks = buildHeatmapWeeks({}, 0, TODAY)
    weeks.forEach((w, i) => expect(w.weekIndex).toBe(i))
  })
})

// ─────────────────────────────────────────────
// calcTotalDaysTracked
// ─────────────────────────────────────────────

describe('calcTotalDaysTracked', () => {
  it('returns 0 for empty habits array', () => {
    expect(calcTotalDaysTracked([], TODAY)).toBe(0)
  })

  it('returns correct days for single habit', () => {
    const h = makeHabit({ createdAt: '2026-01-01' })
    // 2026-01-01 to 2026-04-10 = 99 diff + 1 = 100
    expect(calcTotalDaysTracked([h], '2026-04-10')).toBe(100)
  })

  it('uses earliest createdAt for multiple habits', () => {
    const h1 = makeHabit({ id: 'h1', createdAt: '2026-03-01' })
    const h2 = makeHabit({ id: 'h2', createdAt: '2026-01-01' })
    expect(calcTotalDaysTracked([h1, h2], '2026-04-10')).toBe(100)
  })

  it('returns minimum 1 for same-day habit', () => {
    const h = makeHabit({ createdAt: TODAY })
    expect(calcTotalDaysTracked([h], TODAY)).toBe(1)
  })
})

// ─────────────────────────────────────────────
// getTopByCurrentStreak
// ─────────────────────────────────────────────

describe('getTopByCurrentStreak', () => {
  it('returns top 3 by currentStreak descending', () => {
    const rows = [
      makeRow({ habit: makeHabit({ id: 'h1', name: 'a' }), currentStreak: 5 }),
      makeRow({ habit: makeHabit({ id: 'h2', name: 'b' }), currentStreak: 14 }),
      makeRow({ habit: makeHabit({ id: 'h3', name: 'c' }), currentStreak: 7 }),
      makeRow({ habit: makeHabit({ id: 'h4', name: 'd' }), currentStreak: 3 }),
    ]
    const top = getTopByCurrentStreak(rows, 3)
    expect(top).toHaveLength(3)
    expect(top[0].currentStreak).toBe(14)
    expect(top[1].currentStreak).toBe(7)
    expect(top[2].currentStreak).toBe(5)
  })

  it('excludes archived habits', () => {
    const rows = [
      makeRow({ habit: makeHabit({ id: 'h1', archivedAt: '2026-03-01' }), currentStreak: 99 }),
      makeRow({ habit: makeHabit({ id: 'h2' }), currentStreak: 5 }),
    ]
    const top = getTopByCurrentStreak(rows, 3)
    expect(top).toHaveLength(1)
    expect(top[0].currentStreak).toBe(5)
  })

  it('returns empty array for empty input', () => {
    expect(getTopByCurrentStreak([], 3)).toHaveLength(0)
  })

  it('returns fewer than n if not enough active habits', () => {
    const rows = [makeRow({ habit: makeHabit({ id: 'h1' }), currentStreak: 5 })]
    expect(getTopByCurrentStreak(rows, 3)).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────
// filterHabitStats
// ─────────────────────────────────────────────

describe('filterHabitStats', () => {
  const activeRow = makeRow({ habit: makeHabit({ id: 'h1', archivedAt: undefined }) })
  const archivedRow = makeRow({ habit: makeHabit({ id: 'h2', archivedAt: '2026-03-01' }) })
  const rows = [activeRow, archivedRow]

  it('filter=active returns only active', () => {
    const r = filterHabitStats(rows, 'active')
    expect(r).toHaveLength(1)
    expect(r[0].habit.id).toBe('h1')
  })

  it('filter=archived returns only archived', () => {
    const r = filterHabitStats(rows, 'archived')
    expect(r).toHaveLength(1)
    expect(r[0].habit.id).toBe('h2')
  })

  it('filter=all returns all', () => {
    expect(filterHabitStats(rows, 'all')).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(filterHabitStats([], 'active')).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────
// computeSummary
// ─────────────────────────────────────────────

describe('computeSummary', () => {
  it('returns zeroes for empty data', () => {
    const s = computeSummary([], [], 0, TODAY)
    expect(s.overallCompletionRate).toBe(0)
    expect(s.bestCurrentStreak).toBe(0)
    expect(s.bestCurrentStreakHabitName).toBeNull()
    expect(s.activeHabitsCount).toBe(0)
    expect(s.archivedHabitsCount).toBe(0)
  })

  it('counts active and archived separately', () => {
    const rows = [
      makeRow({ habit: makeHabit({ id: 'h1' }) }),
      makeRow({ habit: makeHabit({ id: 'h2', archivedAt: '2026-01-01' }) }),
    ]
    const habits = [makeHabit({ id: 'h1' }), makeHabit({ id: 'h2', archivedAt: '2026-01-01' })]
    const s = computeSummary(rows, habits, 50, TODAY)
    expect(s.activeHabitsCount).toBe(1)
    expect(s.archivedHabitsCount).toBe(1)
    expect(s.totalCompletionsAllTime).toBe(50)
  })

  it('picks best current streak from active habits only', () => {
    const rows = [
      makeRow({ habit: makeHabit({ id: 'h1', archivedAt: '2026-01-01' }), currentStreak: 99 }),
      makeRow({ habit: makeHabit({ id: 'h2', name: 'run' }), currentStreak: 7 }),
    ]
    const habits = [makeHabit({ id: 'h1', archivedAt: '2026-01-01' }), makeHabit({ id: 'h2', name: 'run' })]
    const s = computeSummary(rows, habits, 0, TODAY)
    expect(s.bestCurrentStreak).toBe(7)
    expect(s.bestCurrentStreakHabitName).toBe('run')
  })

  it('overallCompletionRate is rounded to 1 decimal', () => {
    const rows = [
      makeRow({ habit: makeHabit({ id: 'h1' }), completionRate: 66.7 }),
      makeRow({ habit: makeHabit({ id: 'h2' }), completionRate: 33.3 }),
    ]
    const s = computeSummary(rows, [], 0, TODAY)
    // avg(66.7, 33.3) = 50.0
    expect(s.overallCompletionRate).toBe(50)
  })
})
