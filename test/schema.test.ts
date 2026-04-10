import { describe, it, expect } from 'vitest'
import { HabitCreateSchema, CompletionSchema } from '@/schemas'

describe('HabitCreateSchema', () => {
  it('validates a valid habit input', () => {
    const result = HabitCreateSchema.safeParse({
      name: 'Morning run',
      symbol: '●',
      accentChar: 'bright',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = HabitCreateSchema.safeParse({
      name: '',
      symbol: '●',
      accentChar: 'bright',
    })
    expect(result.success).toBe(false)
  })
})

describe('CompletionSchema', () => {
  it('validates correct date format', () => {
    const result = CompletionSchema.safeParse({ habitId: 'abc123', date: '2026-04-10' })
    expect(result.success).toBe(true)
  })

  it('rejects malformed date', () => {
    const result = CompletionSchema.safeParse({ habitId: 'abc123', date: '10-04-2026' })
    expect(result.success).toBe(false)
  })
})
