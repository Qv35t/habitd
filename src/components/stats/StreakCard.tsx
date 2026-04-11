import { useTranslation } from 'react-i18next'

interface StreakCardProps {
  label: string
  currentStreak: number
  longestStreak: number
  habitSymbol?: string
}

/**
 * Displays current and longest streak for one habit or globally.
 */
export function StreakCard({ label, currentStreak, longestStreak, habitSymbol }: StreakCardProps) {
  const { t } = useTranslation()

  const fmt = (n: number) =>
    n === 0 ? t('stats.noData') : `${n} ${t('stats.days')}`

  return (
    <div className="streak-card">
      <div className="streak-card__header">
        – {habitSymbol ? `${habitSymbol} ` : ''}{label}
      </div>
      <div className="streak-card__current">
        <div className="streak-card__label">{t('stats.currentStreakFull')}</div>
        <div className="streak-card__value">{fmt(currentStreak)}</div>
      </div>
      <div className="streak-card__divider" aria-hidden="true" />
      <div className="streak-card__longest">
        <div className="streak-card__label">{t('stats.longestStreakFull')}</div>
        <div className="streak-card__value">{fmt(longestStreak)}</div>
      </div>
    </div>
  )
}
