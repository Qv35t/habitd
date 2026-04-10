import { describe, it, expect } from 'vitest'
import {
  HabitCreateSchema,
  HabitUpdateSchema,
  CompletionSchema,
  validateHabitCreate,
  validateCompletion,
} from '@/schemas'

// ── HabitCreateSchema ────────────────────────────────────────────

describe('HabitCreateSchema', () => {
  it('accepts a valid habit input', () => {
    const r = HabitCreateSchema.safeParse({ name: 'Morning run', symbol: '●', accentChar: 'bright' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('Morning run')
  })
  it('trims whitespace from name', () => {
    const r = HabitCreateSchema.safeParse({ name: '  Read  ', symbol: '◆', accentChar: 'dim' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('Read')
  })
  it('rejects empty name', () => {
    const r = HabitCreateSchema.safeParse({ name: '', symbol: '●', accentChar: 'bright' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('Name is required')
  })
  it('rejects name longer than 60 chars', () => {
    const r = HabitCreateSchema.safeParse({ name: 'a'.repeat(61), symbol: '●', accentChar: 'bright' })
    expect(r.success).toBe(false)
  })
  it('rejects invalid symbol', () => {
    const r = HabitCreateSchema.safeParse({ name: 'Test', symbol: '🚀', accentChar: 'bright' })
    expect(r.success).toBe(false)
  })
  it('accepts all 7 valid symbols', () => {
    const symbols = ['●', '◆', '✦', '▪', '○', '◇', '⬡']
    for (const symbol of symbols) {
      const r = HabitCreateSchema.safeParse({ name: 'T', symbol, accentChar: 'dim' })
      expect(r.success).toBe(true)
    }
  })
  it('rejects invalid accentChar', () => {
    const r = HabitCreateSchema.safeParse({ name: 'Test', symbol: '●', accentChar: 'neon' })
    expect(r.success).toBe(false)
  })
})

// ── HabitUpdateSchema ────────────────────────────────────────────

describe('HabitUpdateSchema', () => {
  it('accepts partial update — name only', () => {
    expect(HabitUpdateSchema.safeParse({ name: 'Updated' }).success).toBe(true)
  })
  it('accepts partial update — symbol only', () => {
    expect(HabitUpdateSchema.safeParse({ symbol: '◆' }).success).toBe(true)
  })
  it('accepts empty object (no-op)', () => {
    expect(HabitUpdateSchema.safeParse({}).success).toBe(true)
  })
})

// ── CompletionSchema ─────────────────────────────────────────────

describe('CompletionSchema', () => {
  it('accepts valid YYYY-MM-DD', () => {
    expect(CompletionSchema.safeParse({ habitId: 'abc', date: '2026-04-10' }).success).toBe(true)
  })
  it('rejects DD-MM-YYYY', () => {
    expect(CompletionSchema.safeParse({ habitId: 'abc', date: '10-04-2026' }).success).toBe(false)
  })
  it('rejects date without dashes', () => {
    expect(CompletionSchema.safeParse({ habitId: 'abc', date: '20260410' }).success).toBe(false)
  })
  it('rejects empty habitId', () => {
    expect(CompletionSchema.safeParse({ habitId: '', date: '2026-04-10' }).success).toBe(false)
  })
  it('rejects missing date', () => {
    expect(CompletionSchema.safeParse({ habitId: 'abc' }).success).toBe(false)
  })
})

// ── validateHabitCreate helper ───────────────────────────────────

describe('validateHabitCreate helper', () => {
  it('returns parsed data on success', () => {
    const data = validateHabitCreate({ name: 'Meditate', symbol: '✦', accentChar: 'bright' })
    expect(data.name).toBe('Meditate')
  })
  it('throws "Validation failed" on invalid input', () => {
    expect(() => validateHabitCreate({ name: '', symbol: '●', accentChar: 'bright' }))
      .toThrow('Validation failed')
  })
})

// ── validateCompletion helper ────────────────────────────────────

describe('validateCompletion helper', () => {
  it('does not throw on valid input', () => {
    expect(() => validateCompletion({ habitId: 'xyz', date: '2026-01-01' })).not.toThrow()
  })
  it('throws on bad date format', () => {
    expect(() => validateCompletion({ habitId: 'xyz', date: 'today' })).toThrow('Validation failed')
  })
})
