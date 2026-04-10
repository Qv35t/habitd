import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { addHabit, updateHabit } from '@/hooks/useHabits'
import { HabitCreateSchema } from '@/schemas'
import type { Habit } from '@/types'

const HABIT_SYMBOLS = ['●', '◆', '✦', '▪', '○', '◇', '⬡'] as const
const SYMBOL_OPTIONS = HABIT_SYMBOLS.map((s) => ({ value: s, label: s }))
const ACCENT_OPTIONS = [
  { value: 'dim', label: 'dim (subtle)' },
  { value: 'bright', label: 'bright (prominent)' },
]

interface HabitFormProps {
  mode: 'add' | 'edit'
  initialData?: Habit
  onClose: () => void
}

/**
 * Form for creating or editing a habit.
 * Rendered inside Modal.tsx.
 * Validates with Zod HabitCreateSchema before writing to Dexie.
 */
export function HabitForm({ mode, initialData, onClose }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [symbol, setSymbol] = useState(initialData?.symbol ?? '●')
  const [accentChar, setAccentChar] = useState<'dim' | 'bright'>(
    (initialData?.accentChar as 'dim' | 'bright') ?? 'dim'
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = HabitCreateSchema.safeParse({ name: name.trim(), symbol, accentChar })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0] ?? 'general')
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      if (mode === 'add') {
        await addHabit(result.data)
      } else if (mode === 'edit' && initialData) {
        await updateHabit(initialData.id, result.data)
      }
      onClose()
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Operation failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="habit-form" noValidate>
      <Input
        label="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Morning run"
        autoFocus
        maxLength={60}
        error={errors.name}
        autoComplete="off"
      />

      <div className="habit-form-row">
        <Select
          label="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          options={SYMBOL_OPTIONS}
          error={errors.symbol}
        />

        <Select
          label="accent"
          value={accentChar}
          onChange={(e) => setAccentChar(e.target.value as 'dim' | 'bright')}
          options={ACCENT_OPTIONS}
          error={errors.accentChar}
        />
      </div>

      {errors.general && (
        <p className="field-error" role="alert">
          {errors.general}
        </p>
      )}

      <Divider />

      <div className="habit-form-actions">
        <Button type="submit" variant="active" disabled={isLoading}>
          {isLoading ? 'saving...' : mode === 'add' ? '[save]' : '[update]'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
          [cancel]
        </Button>
      </div>
    </form>
  )
}
