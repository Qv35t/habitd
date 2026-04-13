import { useUIStore } from '@/stores/useUIStore'
import { useJournalEntry } from '@/hooks/useJournalEntry'
import { JournalNav } from '@/components/journal/JournalNav'
import { JournalHabitsBar } from '@/components/journal/JournalHabitsBar'
import { JournalMoodPicker } from '@/components/journal/JournalMoodPicker'
import { JournalEditor } from '@/components/journal/JournalEditor'
import { Divider } from '@/components/ui/Divider'

/**
 * JournalView — daily reflection panel.
 * Notes + mood + habits summary for any given day.
 */
export function JournalView() {
  const { journalDate, setJournalDate, resetJournalToToday } = useUIStore()
  const data = useJournalEntry(journalDate)

  if (data.isLoading) {
    return (
      <div className="journal-view journal-view--loading">
        <span>loading…</span>
      </div>
    )
  }

  return (
    <div className="journal-view">
      <JournalNav
        date={journalDate}
        dateLabel={data.dateLabel}
        isToday={data.isToday}
        onDateChange={setJournalDate}
        onToday={resetJournalToToday}
      />

      <Divider />

      <JournalHabitsBar
        habits={data.habits}
        completedCount={data.completedCount}
        totalCount={data.totalCount}
        completionRate={data.completionRate}
        isFuture={data.isFuture}
      />

      <Divider />

      <JournalMoodPicker
        mood={data.entry?.mood ?? 0}
        disabled={data.isFuture}
        onChange={data.saveMood}
      />

      <Divider />

      <JournalEditor
        entry={data.entry}
        date={journalDate}
        isFuture={data.isFuture}
        onSave={data.saveContent}
      />
    </div>
  )
}
