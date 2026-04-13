import { Button } from '../ui/Button'

interface WeekNavProps {
  weekLabel: string
  weekOffset: number
  onPrev:  () => void
  onNext:  () => void
  onToday: () => void
}

/** Week navigation: ← / label / → / [today] */
export function WeekNav({ weekLabel, weekOffset, onPrev, onNext, onToday }: WeekNavProps) {
  return (
    <div className="week-nav">
      <span className="week-nav__label">week</span>
      <div className="week-nav__center">
        <Button variant="border" onClick={onPrev}>←</Button>
        <span className="week-nav__week-label">{weekLabel}</span>
        <Button variant="border" onClick={onNext}>→</Button>
      </div>
      <Button
        variant="border"
        onClick={onToday}
        disabled={weekOffset === 0}
        className={weekOffset !== 0 ? 'week-nav__today--active' : ''}
      >
        [today]
      </Button>
    </div>
  )
}
