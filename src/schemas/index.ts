import { z } from 'zod'
import { HABIT_SYMBOLS } from '@/types'

export const HabitCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name too long').trim(),
  symbol: z.enum(HABIT_SYMBOLS),
  accentChar: z.enum(['dim', 'bright']),
})

export const HabitUpdateSchema = HabitCreateSchema.partial()

export const CompletionSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
})

export type HabitCreateInput = z.infer<typeof HabitCreateSchema>
export type HabitUpdateInput = z.infer<typeof HabitUpdateSchema>
export type CompletionInput = z.infer<typeof CompletionSchema>
