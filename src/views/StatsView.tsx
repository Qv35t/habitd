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
 *
 * Sections:
 *  1. GlobalSummary (3 cards: tracked, rate, best streak)
 *  2. HeatmapGrid (52-week ASCII heatmap)
 *  3. Top-3 streaks (conditional)
 *  4. StatsTable with filter controls (HabitFilterBar + PeriodSelector)
 *
 * All data flows reactively from Dexie via useStatsData (useLiveQuery).
 */
export function StatsView() {
  const statsPeriod = useUIStore((s) => s.statsPeriod)
  const statsHabitFilter = useUIStore((s) => s.statsHabitFilter)
  const setStatsPeriod = useUIStore((s) => s.setStatsPeriod)
  const setStatsHabitFilter = useUIStore((s) => s.setStatsHabitFilter)

  const data = useStatsData(statsPeriod, statsHabitFilter)

  if (data.isLoading) {
    return (
      <div className="stats-loading">
        loading stats...
      </div>
    )
  }

  return (
    <main className="app-content" role="main">
      <div className="stats-view">

        {/* ── Summary Cards ── */}
        <section className="stats-section">
          <div className="stats-section-header">– summary</div>
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
            <div className="stats-section-header">– top streaks</div>
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
            <div className="stats-section-header stats-filter-row__title">– habits</div>
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
    </main>
  )
}
