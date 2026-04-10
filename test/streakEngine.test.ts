import { describe, it, expect } from 'vitest'
import { calcCurrentStreak, calcLongestStreak, calcCompletionRate } from '@/engine/streakEngine'

describe('streakEngine — Phase 0 smoke tests', () => {
  it('returns 0 for empty array (currentStreak)', () => {
    expect(calcCurrentStreak([], '2026-04-10')).toBe(0)
  })

  it('returns 0 for empty array (longestStreak)', () => {
    expect(calcLongestStreak([])).toBe(0)
  })

  it('returns 0 for empty array (completionRate)', () => {
    expect(calcCompletionRate([], 30, '2026-04-10')).toBe(0)
  })
})
