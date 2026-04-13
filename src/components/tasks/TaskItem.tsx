import { useState, useRef, useEffect } from 'react'
import { toggleTask, deleteTask, updateTaskText } from '@/hooks/useTasks'
import type { Task } from '@/types'

interface TaskItemProps {
  task: Task
}

/**
 * Single task row.
 *
 * Visual: [●/○]  [text.......................]  [×]
 *
 * Interaction:
 *  - Click ●/○ → toggle
 *  - Double-click text → inline edit
 *  - Enter in edit → save, Escape → cancel
 *  - Click × → delete
 *  - Delete/Backspace on focused row → delete
 */
export function TaskItem({ task }: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  async function handleToggle() {
    try {
      await toggleTask(task.id)
    } catch {
      /* silently ignore */
    }
  }

  async function handleDelete() {
    try {
      await deleteTask(task.id)
    } catch {
      /* silently ignore */
    }
  }

  async function handleSaveEdit() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.text) {
      try {
        await updateTaskText(task.id, trimmed)
      } catch {
        /* revert */
      }
    } else {
      setEditValue(task.text)
    }
    setEditing(false)
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setEditValue(task.text)
      setEditing(false)
    }
  }

  function handleRowKeyDown(e: React.KeyboardEvent) {
    if (editing) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      handleDelete()
    }
  }

  return (
    <div
      className={`task-item ${task.done === 1 ? 'task-item--done' : ''} ${editing ? 'task-item--editing' : ''}`}
      tabIndex={editing ? -1 : 0}
      onKeyDown={handleRowKeyDown}
      role="listitem"
    >
      <button
        className="task-toggle"
        onClick={handleToggle}
        aria-label={task.done === 1 ? 'Mark as incomplete' : 'Mark as complete'}
        tabIndex={-1}
      >
        {task.done === 1 ? '●' : '○'}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          className="task-text-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleSaveEdit}
          maxLength={200}
          aria-label="Edit task text"
        />
      ) : (
        <span
          className={`task-text ${task.done === 1 ? 'task-text--done' : ''}`}
          onDoubleClick={() => {
            setEditing(true)
            setEditValue(task.text)
          }}
          title="Double-click to edit"
        >
          {task.text}
        </span>
      )}

      <button
        className="task-delete"
        onClick={handleDelete}
        aria-label="Delete task"
        tabIndex={-1}
      >
        ×
      </button>
    </div>
  )
}
