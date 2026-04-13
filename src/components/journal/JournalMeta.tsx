import { format, parseISO } from 'date-fns'
import type { SaveState } from '../../types'

interface JournalMetaProps {
  wordCount: number
  saveState: SaveState
  updatedAt: string | null
}

/**
 * Save state indicators for JournalEditor.
 * Maps each SaveState to its ASCII display string.
 */
const SAVE_STATE_INDICATORS: Record<SaveState, string> = {
  idle: '○ idle',
  dirty: '○ unsaved',
  saving: '○ saving…',
  saved: '● saved',
  error: '✗ error',
}

/**
 * Word count + save state indicator.
 * Shows empty string when wordCount === 0.
 */
export function JournalMeta({ wordCount, saveState, updatedAt }: JournalMetaProps) {
  const indicator = SAVE_STATE_INDICATORS[saveState]

  let saveDisplay = indicator
  if (saveState === 'saved' && updatedAt !== null) {
    saveDisplay = `${indicator} ${format(parseISO(updatedAt), 'HH:mm')}`
  }

  if (wordCount === 0) {
    return (
      <div className="journal-meta">
        <span className={`journal-meta__save journal-meta__save--${saveState}`}>
          {saveDisplay}
        </span>
      </div>
    )
  }

  return (
    <div className="journal-meta">
      <span className="journal-meta__words">words: {wordCount}</span>
      <span className={`journal-meta__save journal-meta__save--${saveState}`}>
        {saveDisplay}
      </span>
    </div>
  )
}
