/**
 * Pure export/import utilities for HABITD backup and restore.
 * Zero-React, side-effect-containing utilities triggered by user interaction.
 */
import { format } from 'date-fns'
import { db } from '@/db'
import { BackupDataSchema } from '@/schemas'
import { computeHabitStats } from '@/engine/streakEngine'
import type { BackupData, ImportResult, Habit, Completion } from '@/types'

// ═══════════════════════════════════════════════════════
//  INTERNAL HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Create a downloadable Blob and trigger a browser download.
 *
 * @param content - String content of the file
 * @param filename - Suggested filename for the browser save dialog
 * @param mimeType - MIME type string
 */
function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

// ═══════════════════════════════════════════════════════
//  JSON EXPORT
// ═══════════════════════════════════════════════════════

/**
 * Export all habits and completions from IndexedDB as a JSON backup file.
 *
 * @returns Promise<void> — resolves after download is triggered
 */
export async function exportToJSON(): Promise<void> {
  const [habits, completions] = await Promise.all([
    db.habits.toArray(),
    db.completions.toArray(),
  ])

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    completions,
  }

  const dateStr = format(new Date(), 'yyyy-MM-dd')
  triggerDownload(
    JSON.stringify(backup, null, 2),
    `habitd-backup-${dateStr}.json`,
    'application/json'
  )
}

// ═══════════════════════════════════════════════════════
//  JSON IMPORT
// ═══════════════════════════════════════════════════════

/**
 * Import habits and completions from a JSON backup file.
 * Validates with Zod before writing. Atomic via Dexie transaction.
 *
 * @param file - The File object selected via <input type="file">
 * @returns Promise<ImportResult> with counts or error message
 */
export async function importFromJSON(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const raw = e.target?.result
        if (typeof raw !== 'string') {
          resolve({ status: 'error', habitsImported: 0, completionsImported: 0, errorMessage: 'Could not read file content.' })
          return
        }

        let parsed: unknown
        try {
          parsed = JSON.parse(raw)
        } catch {
          resolve({ status: 'error', habitsImported: 0, completionsImported: 0, errorMessage: 'Invalid JSON — file is not a valid backup.' })
          return
        }

        const result = BackupDataSchema.safeParse(parsed)
        if (!result.success) {
          const msg = result.error.issues.map((i) => `${i.path.join('.')} — ${i.message}`).join('; ')
          resolve({ status: 'error', habitsImported: 0, completionsImported: 0, errorMessage: `Validation failed: ${msg}` })
          return
        }

        const { habits, completions } = result.data

        await db.transaction('rw', db.habits, db.completions, async () => {
          await db.habits.bulkPut(habits as Habit[])
          await db.completions.bulkPut(completions as Completion[])
        })

        resolve({
          status: 'success',
          habitsImported: habits.length,
          completionsImported: completions.length,
        })
      } catch (err) {
        resolve({
          status: 'error',
          habitsImported: 0,
          completionsImported: 0,
          errorMessage: err instanceof Error ? err.message : 'Unknown error during import.',
        })
      }
    }

    reader.onerror = () => {
      resolve({ status: 'error', habitsImported: 0, completionsImported: 0, errorMessage: 'FileReader error — could not open file.' })
    }

    reader.readAsText(file)
  })
}

// ═══════════════════════════════════════════════════════
//  RESET ALL DATA
// ═══════════════════════════════════════════════════════

/**
 * Delete ALL habits and completions from IndexedDB.
 * IRREVERSIBLE. Must only be called AFTER user confirms via ConfirmModal.
 *
 * @returns Promise<void>
 */
export async function resetAllData(): Promise<void> {
  await db.transaction('rw', db.habits, db.completions, async () => {
    await db.habits.clear()
    await db.completions.clear()
  })
}

// ═══════════════════════════════════════════════════════
//  PURGE ARCHIVED HABITS
// ═══════════════════════════════════════════════════════

/**
 * Permanently delete all archived habits and their completions.
 *
 * @returns Promise<number> — count of habits deleted
 */
export async function purgeArchivedHabits(): Promise<number> {
  const archived = await db.habits
    .filter((h) => Boolean(h.archivedAt) && h.archivedAt !== '')
    .toArray()

  if (archived.length === 0) return 0

  const ids = archived.map((h) => h.id)

  await db.transaction('rw', db.habits, db.completions, async () => {
    await db.habits.bulkDelete(ids)
    for (const id of ids) {
      await db.completions.where('habitId').equals(id).delete()
    }
  })

  return ids.length
}

// ═══════════════════════════════════════════════════════
//  MARKDOWN EXPORT
// ═══════════════════════════════════════════════════════

/**
 * Generate a plain-text Markdown habit report and trigger browser download.
 *
 * @returns Promise<void> — resolves after download is triggered
 */
export async function exportToMarkdown(): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd')
  const habits = await db.habits.orderBy('sortOrder').toArray()
  const allCompletions = await db.completions.toArray()

  const lines: string[] = [
    '# habitd — Habit Report',
    '',
    `exported: ${today}`,
    `habits tracked: ${habits.length}`,
    '',
    '---',
    '',
  ]

  let grandTotal = 0

  for (const habit of habits) {
    const completedDates = allCompletions
      .filter((c) => c.habitId === habit.id)
      .map((c) => c.date)
      .sort()

    const stats = computeHabitStats(habit, completedDates, today)
    grandTotal += stats.totalCompletions

    const statusLabel = habit.archivedAt ? '[archived]' : '[active]'

    lines.push(`## ${habit.symbol}  ${habit.name}  ${statusLabel}`)
    lines.push('')
    lines.push(`- current streak:   ${stats.currentStreak}d`)
    lines.push(`- longest streak:   ${stats.longestStreak}d`)
    lines.push(`- 30-day rate:      ${stats.completionRate}%`)
    lines.push(`- total completions: ${stats.totalCompletions}`)

    if (completedDates.length > 0) {
      lines.push(`- first logged:     ${completedDates[0]}`)
      lines.push(`- last logged:      ${completedDates[completedDates.length - 1]}`)
    }

    lines.push('')
    lines.push('---')
    lines.push('')
  }

  lines.push('## summary')
  lines.push('')
  lines.push(`total completions (all time): ${grandTotal}`)
  lines.push('')
  lines.push('*generated by habitd — local-first habit tracker*')

  const dateStr = format(new Date(), 'yyyy-MM-dd')
  triggerDownload(
    lines.join('\n'),
    `habitd-report-${dateStr}.md`,
    'text/markdown'
  )
}
