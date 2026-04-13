import { useState, useRef } from 'react'
import { addTask } from '@/hooks/useTasks'
import type { TaskScope } from '@/types'

interface TaskInlineInputProps {
  scope: TaskScope
  date: string
  placeholder?: string
}

/**
 * Inline task input — no modal, input directly in the list.
 *
 * UX:
 *  - Enter → add task → clear + refocus
 *  - Escape → clear + blur
 *  - Empty text → ignored
 */
export function TaskInlineInput({
  scope,
  date,
  placeholder = '+ добавить задачу',
}: TaskInlineInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed) return
    try {
      await addTask(trimmed, scope, date)
      setText('')
      inputRef.current?.focus()
    } catch {
      /* silently ignore */
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setText('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className="task-inline-input">
      <input
        ref={inputRef}
        className="task-inline-input__field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={200}
        aria-label="Add new task"
      />
    </div>
  )
}
