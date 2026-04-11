import type { GlobalSummaryData, StatsPeriod } from '@/types'
import { useTranslation } from 'react-i18next'

interface GlobalSummaryProps {
  data: GlobalSummaryData
  period: StatsPeriod
}

/**
 * Three summary metric cards at the top of StatsView.
 */
export function GlobalSummary({ data, period }: GlobalSummaryProps) {
  const { t } = useTranslation()
  const noData = data.totalDaysTracked === 0

  const periodLabel =
    period === 'all'
      ? t('stats.allTime')
      : t('stats.lastPeriod', { period: t(`stats.period.${period}`) })

  return (
    <div className="global-summary">
      {/* Card 1: Tracked */}
      <div className="global-summary__card">
        <div className="global-summary__label">{t('stats.tracked')}</div>
        <div className="global-summary__value">
          {noData ? t('stats.noData') : `${data.totalDaysTracked} ${t('stats.days')}`}
        </div>
        <div className="global-summary__sub">
          {noData ? t('stats.noData') : `${t('stats.since')} tracking started`}
        </div>
      </div>

      {/* Card 2: Overall rate */}
      <div className="global-summary__card">
        <div className="global-summary__label">{t('stats.overallRate')}</div>
        <div className="global-summary__value">
          {noData ? t('stats.noData') : `${data.overallCompletionRate.toFixed(1)}%`}
        </div>
        <div className="global-summary__sub">{periodLabel}</div>
      </div>

      {/* Card 3: Best streak */}
      <div className="global-summary__card">
        <div className="global-summary__label">{t('stats.bestStreak')}</div>
        <div className="global-summary__value">
          {noData ? t('stats.noData') : `${data.bestCurrentStreak} ${t('stats.days')}`}
        </div>
        <div className="global-summary__sub">
          {noData ? t('stats.noData') : data.bestCurrentStreakHabitName ?? t('stats.noData')}
        </div>
      </div>
    </div>
  )
}
