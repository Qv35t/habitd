import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'
import { useStatsData } from '@/hooks/useStatsData'
import { HeatmapGrid } from '@/components/stats/HeatmapGrid'
import { GlobalSummary } from '@/components/stats/GlobalSummary'
import { StatsTable } from '@/components/stats/StatsTable'
import { StreakCard } from '@/components/stats/StreakCard'
import { HabitFilterBar } from '@/components/stats/HabitFilterBar'
import { PeriodSelector } from '@/components/stats/PeriodSelector'
import { Divider } from '@/components/ui/Divider'

/**
 * StatsView — read-only stats dashboard.
 */
export function StatsView() {
  const { t } = useTranslation()
  const statsPeriod = useUIStore((s) => s.statsPeriod)
  const statsHabitFilter = useUIStore((s) => s.statsHabitFilter)
  const setStatsPeriod = useUIStore((s) => s.setStatsPeriod)
  const setStatsHabitFilter = useUIStore((s) => s.setStatsHabitFilter)

  const data = useStatsData(statsPeriod, statsHabitFilter)

  if (data.isLoading) {
    return (
      <div className="stats-loading">
        {t('stats.loading')}
      </div>
    )
  }

  return (
    <div className="stats-view">
      {/* ── Summary Cards ── */}
      <section className="stats-section">
        <div className="stats-section-header">{t('stats.summary')}</div>
        <GlobalSummary data={data.summary} period={statsPeriod} />
      </section>

      <Divider />

      {/* ── Heatmap ── */}
      <section className="stats-section">
        <HeatmapGrid weeks={data.heatmapWeeks} today={data.today} />
      </section>

      <Divider />

      {/* ── Top 3 Streaks ── */}
      {data.top3ByCurrentStreak.length > 0 && (
        <section className="stats-section">
          <div className="stats-section-header">{t('stats.topStreaks')}</div>
          <div className="top-streaks">
            {data.top3ByCurrentStreak.map((entry) => (
              <StreakCard
                key={entry.habit.id}
                label={entry.habit.name}
                currentStreak={entry.currentStreak}
                longestStreak={entry.longestStreak}
                habitSymbol={entry.habit.symbol}
              />
            ))}
          </div>
        </section>
      )}

      <Divider />

      {/* ── Habits Table with Filters ── */}
      <section className="stats-section">
        <div className="stats-filter-row">
          <div className="stats-section-header stats-filter-row__title">{t('stats.habits')}</div>
          <div className="stats-filter-row__controls">
            <HabitFilterBar
              value={statsHabitFilter}
              onChange={setStatsHabitFilter}
            />
            <PeriodSelector
              value={statsPeriod}
              onChange={setStatsPeriod}
            />
          </div>
        </div>
        <StatsTable rows={data.habitStats} period={statsPeriod} />
      </section>
    </div>
  )
}
