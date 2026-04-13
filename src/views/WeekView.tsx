import { useUIStore } from '@/stores/useUIStore'
import { useWeekData } from '@/hooks/useWeekData'
import { WeekNav } from '@/components/week/WeekNav'
import { WeekGrid } from '@/components/week/WeekGrid'
import { WeekSummaryBar } from '@/components/week/WeekSummaryBar'

/**
 * WeekView — 7-day rolling week dashboard.
 * Active habits as rows × Mon–Sun grid with inline completion toggles.
 */
export function WeekView() {
  const { weekOffset, setWeekOffset, resetWeekToToday } = useUIStore()
  const data = useWeekData(weekOffset)

  const handlePrev = () => setWeekOffset(weekOffset - 1)
  const handleNext = () => setWeekOffset(weekOffset + 1)
  const handleToday = () => resetWeekToToday()

  return (
    <div className="week-view">
      <WeekNav
        weekLabel={data.weekLabel}
        weekOffset={weekOffset}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      <WeekGrid data={data} />
      <WeekSummaryBar
        totalCompleted={data.totalCompleted}
        totalPossible={data.totalPossible}
        completionRate={data.completionRate}
        isCurrentWeek={weekOffset === 0}
      />
    </div>
  )
}
