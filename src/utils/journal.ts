/**
 * Pure journal utility functions — no side effects, no Dexie calls.
 * All dates are YYYY-MM-DD strings.
 */
import { format, parseISO, addDays, subDays, isAfter, isValid } from 'date-fns'
import type { JournalEntry, MoodLevel } from '../types'

/**
 * Returns a human-readable date label for the JournalNav header.
 * Format: "Mon, 13 Apr 2026"
 * Returns fallback for invalid dates to prevent RangeError crashes.
 */
export function getJournalDateLabel(date: string): string {
  const parsed = parseISO(date)
  if (!isValid(parsed)) return 'Invalid date'
  return format(parsed, 'EEE, d MMM yyyy')
}

/**
 * Returns the YYYY-MM-DD of the previous day.
 * Falls back to today if date is invalid.
 */
export function getPrevJournalDate(date: string): string {
  const parsed = parseISO(date)
  if (!isValid(parsed)) return format(new Date(), 'yyyy-MM-dd')
  return format(subDays(parsed, 1), 'yyyy-MM-dd')
}

/**
 * Returns the YYYY-MM-DD of the next day.
 * Falls back to today if date is invalid.
 */
export function getNextJournalDate(date: string): string {
  const parsed = parseISO(date)
  if (!isValid(parsed)) return format(new Date(), 'yyyy-MM-dd')
  return format(addDays(parsed, 1), 'yyyy-MM-dd')
}

/**
 * Returns true if date is strictly after today.
 * Returns false for invalid dates.
 */
export function isJournalDateFuture(date: string, today: string): boolean {
  const parsed = parseISO(date)
  const todayParsed = parseISO(today)
  if (!isValid(parsed) || !isValid(todayParsed)) return false
  return isAfter(parsed, todayParsed)
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
