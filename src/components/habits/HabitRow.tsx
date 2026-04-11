import { useState, useRef, useEffect } from 'react'
import { HabitDots } from './HabitDots'
import { archiveHabit } from '@/hooks/useHabits'
import { useUIStore } from '@/stores/useUIStore'
import { calcCurrentStreak } from '@/engine/streakEngine'
import type { Habit } from '@/types'

interface HabitRowProps {
  habit: Habit
  completedDatesSet: Set<string>
  completedDates: string[]
  today: string
  isSelected?: boolean
}

/**
 * Single habit row in the list.
 *
 * Visual structure:
 *   [symbol]  [name.................]  [◌ ● ● ◌ ● ● ●]  [streak]  [⋯]
 */
export function HabitRow({ habit, completedDatesSet, completedDates, today, isSelected }: HabitRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { openEditModal, openConfirmDeleteModal } = useUIStore()

  const currentStreak = calcCurrentStreak(completedDates, today)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  return (
    <div
      className={`habit-row habit-row--${habit.accentChar} ${isSelected ? 'habit-row--selected' : ''}`}
      role="listitem"
    >
      {/* Symbol */}
      <span className="habit-symbol" aria-hidden="true">
        {habit.symbol}
      </span>

      {/* Name */}
      <span className="habit-name">{habit.name}</span>

      {/* 7-day dots */}
      <HabitDots
        habitId={habit.id}
        completedDatesSet={completedDatesSet}
        today={today}
      />

      {/* Streak counter */}
      <span
        className="habit-streak"
        title={`Current streak: ${currentStreak} days`}
        aria-label={`${currentStreak} day streak`}
      >
        {currentStreak > 0 ? `${currentStreak}d` : '–'}
      </span>

      {/* Context menu */}
      <div className="habit-menu" ref={menuRef}>
        <button
          className="habit-menu-trigger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Habit options"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          ⋯
        </button>
        {menuOpen && (
          <div className="habit-menu-dropdown" role="menu">
            <button
              className="habit-menu-item"
              role="menuitem"
              onClick={() => {
                openEditModal(habit)
                setMenuOpen(false)
              }}
            >
              [edit]
            </button>
            <button
              className="habit-menu-item"
              role="menuitem"
              onClick={() => {
                archiveHabit(habit.id)
                setMenuOpen(false)
              }}
            >
              [archive]
            </button>
            <button
              className="habit-menu-item habit-menu-item--danger"
              role="menuitem"
              onClick={() => {
                openConfirmDeleteModal(habit.id, habit.name)
                setMenuOpen(false)
              }}
            >
              [delete]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
