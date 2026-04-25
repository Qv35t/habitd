import { useEffect, useRef, useState, useCallback } from 'react'
import { countWords } from '../../utils/journal'
import { JournalMeta } from './JournalMeta'
import type { JournalEntry, SaveState } from '../../types'

interface JournalEditorProps {
  entry: JournalEntry | null
  date: string
  isFuture: boolean
  onSave: (content: string) => Promise<void>
}

const DEBOUNCE_MS = 500

/**
 * Native <textarea> with debounced auto-save.
 * Local state only — Dexie writes happen via onSave callback.
 * Uses useEffect for local UI state sync (allowed) and flush-on-unmount.
 */
export function JournalEditor({ entry, date: _date, isFuture, onSave }: JournalEditorProps) {
  const [localContent, setLocalContent] = useState(entry?.content ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track entry id to reset local state without useEffect
  const prevEntryIdRef = useRef<string | null>(null)
  if (entry?.id !== prevEntryIdRef.current) {
    prevEntryIdRef.current = entry?.id ?? null
    setLocalContent(entry?.content ?? '')
    setSaveState('idle')
  }

  // Flush pending saves on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [])

  const handleChange = useCallback(
    (value: string) => {
      setLocalContent(value)
      setSaveState('dirty')

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(async () => {
        setSaveState('saving')
        try {
          await onSave(value)
          setSaveState('saved')
        } catch {
          setSaveState('error')
        }
      }, DEBOUNCE_MS)
    },
    [onSave],
  )

  const wordCount = countWords(localContent)

  return (
    <div className="journal-editor">
      <div className="journal-editor__header">
        <span className="journal-editor__label">– note</span>
        <JournalMeta
          wordCount={wordCount}
          saveState={saveState}
          updatedAt={entry?.updatedAt ?? null}
        />
      </div>
      <textarea
        className={[
          'journal-editor__textarea',
          isFuture ? 'journal-editor__textarea--disabled' : '',
        ].join(' ')}
        value={localContent}
        onChange={e => handleChange(e.target.value)}
        placeholder="write your thoughts..."
        disabled={isFuture}
        aria-label="journal entry content"
        rows={8}
      />
    </div>
  )
}
