interface StreakCardProps {
  label: string
  currentStreak: number
  longestStreak: number
  habitSymbol?: string
}

/**
 * Displays current and longest streak for one habit or globally.
 * currentStreak === 0 renders as '–' not '0 days'.
 */
export function StreakCard({ label, currentStreak, longestStreak, habitSymbol }: StreakCardProps) {
  const fmt = (n: number) =>
    n === 0 ? '–' : `${n} ${n === 1 ? 'day' : 'days'}`

  return (
    <div className="streak-card">
      <div className="streak-card__header">
        – {habitSymbol ? `${habitSymbol} ` : ''}{label}
      </div>
      <div className="streak-card__current">
        <div className="streak-card__label">current streak</div>
        <div className="streak-card__value">{fmt(currentStreak)}</div>
      </div>
      <div className="streak-card__divider" aria-hidden="true" />
      <div className="streak-card__longest">
        <div className="streak-card__label">longest streak</div>
        <div className="streak-card__value">{fmt(longestStreak)}</div>
      </div>
    </div>
  )
}
