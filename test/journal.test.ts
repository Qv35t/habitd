import { describe, it, expect } from 'vitest'
import {
  getJournalDateLabel,
  getPrevJournalDate,
  getNextJournalDate,
  isJournalDateFuture,
  countWords,
  createJournalEntry,
  updateJournalEntry,
} from '@/utils/journal'
import type { JournalEntry, MoodLevel } from '@/types'

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const TODAY = '2026-04-13'

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'test-entry-id',
    date: TODAY,
    content: '',
    mood: 0,
    createdAt: '2026-04-13T10:00:00.000Z',
    updatedAt: '2026-04-13T10:00:00.000Z',
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────
// getJournalDateLabel
// ─────────────────────────────────────────────────────────────────

describe('getJournalDateLabel', () => {
  it('formats date as "EEE, d MMM yyyy"', () => {
    const label = getJournalDateLabel('2026-04-13')
    expect(label).toBe('Mon, 13 Apr 2026')
  })

  it('handles cross-month dates', () => {
    const label = getJournalDateLabel('2026-03-31')
    expect(label).toBe('Tue, 31 Mar 2026')
  })

  it('handles year boundary', () => {
    const label = getJournalDateLabel('2025-12-31')
    expect(label).toBe('Wed, 31 Dec 2025')
  })
})

// ─────────────────────────────────────────────────────────────────
// getPrevJournalDate / getNextJournalDate
// ─────────────────────────────────────────────────────────────────

describe('getPrevJournalDate', () => {
  it('returns the previous day', () => {
    expect(getPrevJournalDate('2026-04-13')).toBe('2026-04-12')
  })

  it('crosses month boundary', () => {
    expect(getPrevJournalDate('2026-04-01')).toBe('2026-03-31')
  })

  it('crosses year boundary', () => {
    expect(getPrevJournalDate('2026-01-01')).toBe('2025-12-31')
  })
})

describe('getNextJournalDate', () => {
  it('returns the next day', () => {
    expect(getNextJournalDate('2026-04-13')).toBe('2026-04-14')
  })

  it('crosses month boundary', () => {
    expect(getNextJournalDate('2026-04-30')).toBe('2026-05-01')
  })

  it('crosses year boundary', () => {
    expect(getNextJournalDate('2025-12-31')).toBe('2026-01-01')
  })
})

// ─────────────────────────────────────────────────────────────────
// isJournalDateFuture
// ─────────────────────────────────────────────────────────────────

describe('isJournalDateFuture', () => {
  it('returns true for dates after today', () => {
    expect(isJournalDateFuture('2026-04-14', TODAY)).toBe(true)
    expect(isJournalDateFuture('2027-01-01', TODAY)).toBe(true)
  })

  it('returns false for today', () => {
    expect(isJournalDateFuture(TODAY, TODAY)).toBe(false)
  })

  it('returns false for past dates', () => {
    expect(isJournalDateFuture('2026-04-12', TODAY)).toBe(false)
    expect(isJournalDateFuture('2020-01-01', TODAY)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
// countWords
// ─────────────────────────────────────────────────────────────────

describe('countWords', () => {
  it('counts single word', () => {
    expect(countWords('hello')).toBe(1)
  })

  it('counts multiple words separated by spaces', () => {
    expect(countWords('hello world foo bar')).toBe(4)
  })

  it('handles multiple spaces between words', () => {
    expect(countWords('hello   world')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0)
  })

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   \n\t  ')).toBe(0)
  })

  it('trims leading and trailing whitespace', () => {
    expect(countWords('  hello world  ')).toBe(2)
  })

  it('handles newlines and tabs as separators', () => {
    expect(countWords('hello\nworld\tfoo')).toBe(3)
  })
})

// ─────────────────────────────────────────────────────────────────
// createJournalEntry
// ─────────────────────────────────────────────────────────────────

describe('createJournalEntry', () => {
  it('creates entry with correct fields', () => {
    const entry = createJournalEntry('2026-04-13', 'hello', 3)
    expect(entry.date).toBe('2026-04-13')
    expect(entry.content).toBe('hello')
    expect(entry.mood).toBe(3)
    expect(entry.createdAt).toBeDefined()
    expect(entry.updatedAt).toBeDefined()
  })

  it('creates entry with empty content', () => {
    const entry = createJournalEntry('2026-04-13', '', 0)
    expect(entry.content).toBe('')
    expect(entry.mood).toBe(0)
  })

  it('sets createdAt and updatedAt to ISO strings', () => {
    const entry = createJournalEntry('2026-04-13', 'test', 1)
    expect(() => new Date(entry.createdAt)).not.toThrow()
    expect(() => new Date(entry.updatedAt)).not.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────
// updateJournalEntry
// ─────────────────────────────────────────────────────────────────

describe('updateJournalEntry', () => {
  it('updates content and refreshes updatedAt', () => {
    const existing = makeEntry({ content: 'old', updatedAt: '2026-04-13T10:00:00.000Z' })
    const updated = updateJournalEntry(existing, { content: 'new' })

    expect(updated.content).toBe('new')
    expect(updated.mood).toBe(0) // unchanged
    expect(updated.date).toBe(TODAY) // unchanged
    expect(updated.updatedAt).not.toBe(existing.updatedAt) // refreshed
  })

  it('updates mood without changing content', () => {
    const existing = makeEntry({ content: 'hello', mood: 0 })
    const updated = updateJournalEntry(existing, { mood: 4 as MoodLevel })

    expect(updated.mood).toBe(4)
    expect(updated.content).toBe('hello')
  })

  it('updates both content and mood', () => {
    const existing = makeEntry({ content: 'old', mood: 1 })
    const updated = updateJournalEntry(existing, { content: 'new', mood: 5 as MoodLevel })

    expect(updated.content).toBe('new')
    expect(updated.mood).toBe(5)
  })

  it('does not mutate the original entry', () => {
    const existing = makeEntry({ content: 'original' })
    updateJournalEntry(existing, { content: 'changed' })
    expect(existing.content).toBe('original')
  })
})
