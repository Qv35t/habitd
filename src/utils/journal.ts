/**
 * Pure journal utility functions — no side effects, no Dexie calls.
 * All dates are YYYY-MM-DD strings.
 */
import { format, parseISO, addDays, subDays, isAfter } from 'date-fns'
import type { JournalEntry, MoodLevel } from '../types'

/**
 * Returns a human-readable date label for the JournalNav header.
 * Format: "Mon, 13 Apr 2026"
 */
export function getJournalDateLabel(date: string): string {
  return format(parseISO(date), 'EEE, d MMM yyyy')
}

/**
 * Returns the YYYY-MM-DD of the previous day.
 */
export function getPrevJournalDate(date: string): string {
  return format(subDays(parseISO(date), 1), 'yyyy-MM-dd')
}

/**
 * Returns the YYYY-MM-DD of the next day.
 */
export function getNextJournalDate(date: string): string {
  return format(addDays(parseISO(date), 1), 'yyyy-MM-dd')
}

/**
 * Returns true if date is strictly after today.
 */
export function isJournalDateFuture(date: string, today: string): boolean {
  return isAfter(parseISO(date), parseISO(today))
}

/**
 * Counts words in a plain text string.
 * Words = non-empty tokens split by whitespace.
 * Returns 0 for empty or whitespace-only strings.
 */
export function countWords(text: string): number {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 0
  return trimmed.split(/\s+/).length
}

/**
 * Builds a new JournalEntry object for insertion into Dexie.
 * Does NOT write to DB — pure factory function.
 */
export function createJournalEntry(
  date: string,
  content: string,
  mood: MoodLevel,
): Omit<JournalEntry, 'id'> {
  const now = new Date().toISOString()
  return { date, content, mood, createdAt: now, updatedAt: now }
}

/**
 * Returns an updated JournalEntry with new content/mood and refreshed updatedAt.
 * Does NOT write to DB — pure updater.
 */
export function updateJournalEntry(
  existing: JournalEntry,
  patch: Partial<Pick<JournalEntry, 'content' | 'mood'>>,
): JournalEntry {
  return { ...existing, ...patch, updatedAt: new Date().toISOString() }
}
