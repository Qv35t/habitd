import { z } from 'zod'
import { HABIT_SYMBOLS } from '@/types'

// ── Habit Schemas ────────────────────────────────────────────────

export const HabitCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(60, 'Name too long (max 60 chars)')
    .trim(),
  symbol: z.enum(HABIT_SYMBOLS),
  accentChar: z.enum(['dim', 'bright']),
})

// Partial version for PATCH-style updates
export const HabitUpdateSchema = HabitCreateSchema.partial()

// ── Completion Schema ─────────────────────────────────────────────

export const CompletionSchema = z.object({
  habitId: z.string().min(1, 'habitId is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

// ── Inferred Types ────────────────────────────────────────────────

export type HabitCreateInput = z.infer<typeof HabitCreateSchema>
export type HabitUpdateInput = z.infer<typeof HabitUpdateSchema>
export type CompletionInput  = z.infer<typeof CompletionSchema>

// ── Validation Helpers ────────────────────────────────────────────

/**
 * Returns parsed data or throwing a formatted error string.
 * Use in hooks before writing to Dexie.
 */
export function validateHabitCreate(input: unknown): HabitCreateInput {
  const result = HabitCreateSchema.safeParse(input)
  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(', ')
    throw new Error(`Validation failed: ${messages}`)
  }
  return result.data
}

export function validateHabitUpdate(input: unknown): HabitUpdateInput {
  const result = HabitUpdateSchema.safeParse(input)
  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(', ')
    throw new Error(`Validation failed: ${messages}`)
  }
  return result.data
}

export function validateCompletion(input: unknown): CompletionInput {
  const result = CompletionSchema.safeParse(input)
  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(', ')
    throw new Error(`Validation failed: ${messages}`)
  }
  return result.data
}
