import type { JournalHabitItem } from '../../types'

interface JournalHabitsBarProps {
  habits: JournalHabitItem[]
  completedCount: number
  totalCount: number
  completionRate: number
  isFuture: boolean
}

/**
 * Read-only summary of habit completions for the journal day.
 * Returns null when totalCount === 0.
 * Future dates: all habits shown as ·, no summary bar rendered.
 */
export function JournalHabitsBar({
  habits,
  completedCount,
  totalCount,
  completionRate,
  isFuture,
}: JournalHabitsBarProps) {
  if (totalCount === 0) return null

  const BAR_WIDTH = 24
  const filled = isFuture ? 0 : Math.round((completedCount / totalCount) * BAR_WIDTH)
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)

  return (
    <div className="journal-habits-bar">
      <div className="journal-habits-bar__section-label">– habits</div>
      <div className="journal-habits-bar__list">
        {habits.map(h => (
          <span
            key={h.id}
            className={[
              'journal-habits-bar__item',
              isFuture
                ? 'journal-habits-bar__item--future'
                : h.isCompleted
                  ? 'journal-habits-bar__item--done'
                  : 'journal-habits-bar__item--miss',
            ].join(' ')}
            title={h.name}
          >
            ▸ {isFuture ? '·' : h.isCompleted ? '▓' : '░'} {h.name}
          </span>
        ))}
      </div>
      {!isFuture && (
        <div className="journal-habits-bar__summary">
          {completedCount} / {totalCount} completed{'  '}
          [{bar}]{'  '}
          {completionRate.toFixed(1)}%
        </div>
      )}
    </div>
  )
}
