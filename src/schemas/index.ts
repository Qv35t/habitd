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

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 6 — Backup Validation Schemas
// ═══════════════════════════════════════════════════════════════════════════

export const BackupHabitSchema = z.object({
  id:          z.string().min(1),
  name:        z.string().min(1).max(80),
  symbol:      z.string().min(1).max(2),
  accentChar:  z.string().min(1),
  createdAt:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  archivedAt:  z.string().optional(),
  sortOrder:   z.number().int(),
})

export const BackupCompletionSchema = z.object({
  id:      z.string().min(1),
  habitId: z.string().min(1),
  date:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
})

export const BackupDataSchema = z.object({
  version:     z.literal(1),
  exportedAt:  z.string().min(1),
  habits:      z.array(BackupHabitSchema),
  completions: z.array(BackupCompletionSchema),
})

// ── Task Schemas (Phase 9) ──────────────────────────────────────

export const TaskCreateSchema = z.object({
  text: z
    .string()
    .min(1, 'Task text is required')
    .max(200, 'Task text too long (max 200 chars)')
    .trim(),
  scope: z.enum(['daily', 'weekly']),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

export const TaskUpdateSchema = z.object({
  text: z.string().min(1).max(200).trim().optional(),
  done: z.union([z.literal(0), z.literal(1)]).optional(),
})

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>
export type TaskUpdateInput  = z.infer<typeof TaskUpdateSchema>

export function validateTaskCreate(input: unknown): TaskCreateInput {
  const result = TaskCreateSchema.safeParse(input)
  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(', ')
    throw new Error(`Task validation failed: ${messages}`)
  }
  return result.data
}

export function validateTaskUpdate(input: unknown): TaskUpdateInput {
  const result = TaskUpdateSchema.safeParse(input)
  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(', ')
    throw new Error(`Task update validation failed: ${messages}`)
  }
  return result.data
}

// ── Finance schemas (Phase F0) ────────────────────────────────────────────────
export * from './finance'
