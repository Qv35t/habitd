import { getPrevJournalDate, getNextJournalDate } from '../../utils/journal'

interface JournalNavProps {
  date: string
  dateLabel: string
  isToday: boolean
  onDateChange: (date: string) => void
  onToday: () => void
}

/** Navigation header: ← Mon, 13 Apr 2026 → [today] */
export function JournalNav({ date, dateLabel, isToday, onDateChange, onToday }: JournalNavProps) {
  return (
    <div className="journal-nav">
      <span className="journal-nav__label">journal</span>
      <div className="journal-nav__controls">
        <button
          className="journal-nav__btn"
          onClick={() => onDateChange(getPrevJournalDate(date))}
          aria-label="previous day"
        >
          ←
        </button>
        <span className="journal-nav__date">{dateLabel}</span>
        <button
          className="journal-nav__btn"
          onClick={() => onDateChange(getNextJournalDate(date))}
          aria-label="next day"
        >
          →
        </button>
        {!isToday && (
          <button className="journal-nav__today" onClick={onToday} aria-label="go to today">
            [today]
          </button>
        )}
      </div>
    </div>
  )
}
