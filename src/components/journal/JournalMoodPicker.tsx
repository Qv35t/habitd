import { MOOD_CHARS } from '../../types'
import type { MoodLevel } from '../../types'

interface JournalMoodPickerProps {
  mood: MoodLevel
  disabled: boolean
  onChange: (mood: MoodLevel) => void
}

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5]

/**
 * 5-level ASCII mood selector.
 * Active: [▶N◀], inactive: [ N ].
 * Clicking active level → resets to 0 (unset).
 */
export function JournalMoodPicker({ mood, disabled, onChange }: JournalMoodPickerProps) {
  function handleClick(level: MoodLevel) {
    if (disabled) return
    onChange(mood === level ? 0 : level)
  }

  return (
    <div className="journal-mood-picker">
      <span className="journal-mood-picker__label">– mood</span>
      <div className="journal-mood-picker__levels">
        {LEVELS.map(level => {
          const isActive = mood === level
          return (
            <button
              key={level}
              className={[
                'journal-mood-btn',
                isActive ? 'journal-mood-btn--active' : '',
                disabled ? 'journal-mood-btn--disabled' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleClick(level)}
              aria-pressed={isActive}
              aria-label={`mood level ${level}: ${MOOD_CHARS[level]}`}
              disabled={disabled}
              tabIndex={disabled ? -1 : 0}
            >
              {isActive ? `[▶${level}◀]` : `[ ${level} ]`}
            </button>
          )
        })}
        {mood === 0 && !disabled && (
          <span className="journal-mood-picker__hint">not set</span>
        )}
      </div>
    </div>
  )
}
