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

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE F8 — Finance Export / Import
// ═══════════════════════════════════════════════════════════════════════════

import { FinanceBackupSchema } from '@/schemas/finance'
import { calcBalance, calcByCategory, calcBudgetStatus, calcGoalProgress } from '@/engine/finEngine'
import type {
  CsvExportOptions,
  FinanceBackupData,
  FinanceImportResult,
  Transaction,
  FinCategory,
  Budget,
  FinancialGoal,
} from '@/types'

// ── CSV helpers ─────────────────────────────────────────────────────────────

/**
 * Escape a CSV field value per RFC 4180.
 */
function escapeCsvField(value: string): string {
  if (/[,\n\r"]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Serialize a single Transaction row to CSV string (without header).
 */
function txToCsvRow(tx: Transaction, categories: FinCategory[]): string {
  const categoryName = categories.find((c) => c.id === tx.categoryId)?.name ?? tx.categoryId
  const fields = [
    tx.date,
    tx.type,
    String(tx.amount),
    escapeCsvField(categoryName),
    escapeCsvField(tx.note ?? ''),
    escapeCsvField((tx.tags ?? []).join(' ')),
    tx.id,
    tx.createdAt,
  ]
  return fields.join(',')
}

// ═══════════════════════════════════════════════════════════════════════════
//  CSV EXPORT — TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Export transactions to CSV and trigger browser download.
 * CSV includes UTF-8 BOM for Excel compatibility.
 */
export async function exportTransactionsCSV(options: CsvExportOptions): Promise<void> {
  const { scope, month } = options

  const [allTx, categories] = await Promise.all([
    db.transactions.orderBy('date').toArray(),
    db.finCategories.orderBy('sortOrder').toArray(),
  ])

  let transactions: Transaction[]
  let filename: string

  if (scope === 'month' && month) {
    transactions = allTx.filter((tx) => tx.date.startsWith(month))
    filename = `habitd-finance-${month}.csv`
  } else {
    transactions = allTx
    const today = format(new Date(), 'yyyy-MM-dd')
    filename = `habitd-finance-all-${today}.csv`
  }

  const CSV_HEADER = 'date,type,amount,category,note,tags,id,created_at'
  const rows = transactions.map((tx) => txToCsvRow(tx, categories))

  // UTF-8 BOM prefix
  const csvContent = '\uFEFF' + [CSV_HEADER, ...rows].join('\n')

  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;')
}

// ═══════════════════════════════════════════════════════════════════════════
//  JSON EXPORT — FULL FINANCE BACKUP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Export all four finance tables as a single JSON backup.
 */
export async function exportFinanceJSON(): Promise<void> {
  const [transactions, finCategories, budgets, financialGoals] = await Promise.all([
    db.transactions.toArray(),
    db.finCategories.toArray(),
    db.budgets.toArray(),
    db.financialGoals.toArray(),
  ])

  const backup: FinanceBackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    finCategories,
    budgets,
    financialGoals,
  }

  const dateStr = format(new Date(), 'yyyy-MM-dd')
  triggerDownload(
    JSON.stringify(backup, null, 2),
    `habitd-finance-backup-${dateStr}.json`,
    'application/json',
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  JSON IMPORT — FINANCE BACKUP RESTORE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Import a finance backup JSON file and write to IndexedDB atomically.
 */
export async function importFinanceJSON(file: File): Promise<FinanceImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const raw = e.target?.result
        if (typeof raw !== 'string') {
          resolve({
            status: 'error',
            transactionsImported: 0,
            categoriesImported: 0,
            budgetsImported: 0,
            goalsImported: 0,
            errorMessage: 'Could not read file content.',
          })
          return
        }

        let parsed: unknown
        try {
          parsed = JSON.parse(raw)
        } catch {
          resolve({
            status: 'error',
            transactionsImported: 0,
            categoriesImported: 0,
            budgetsImported: 0,
            goalsImported: 0,
            errorMessage: 'Invalid JSON — file is not a valid finance backup.',
          })
          return
        }

        const result = FinanceBackupSchema.safeParse(parsed)
        if (!result.success) {
          const msg = result.error.issues
            .slice(0, 3)
            .map((i) => `${i.path.join('.')} — ${i.message}`)
            .join('; ')
          resolve({
            status: 'error',
            transactionsImported: 0,
            categoriesImported: 0,
            budgetsImported: 0,
            goalsImported: 0,
            errorMessage: `Validation failed: ${msg}`,
          })
          return
        }

        const { transactions, finCategories, budgets, financialGoals } = result.data

        await db.transaction(
          'rw',
          [db.transactions, db.finCategories, db.budgets, db.financialGoals],
          async () => {
            await db.transactions.bulkPut(transactions as Transaction[])
            await db.finCategories.bulkPut(finCategories as FinCategory[])
            await db.budgets.bulkPut(budgets as Budget[])
            await db.financialGoals.bulkPut(financialGoals as FinancialGoal[])
          },
        )

        resolve({
          status: 'success',
          transactionsImported: transactions.length,
          categoriesImported: finCategories.length,
          budgetsImported: budgets.length,
          goalsImported: financialGoals.length,
        })
      } catch (err) {
        resolve({
          status: 'error',
          transactionsImported: 0,
          categoriesImported: 0,
          budgetsImported: 0,
          goalsImported: 0,
          errorMessage: err instanceof Error ? err.message : 'Unknown error during import.',
        })
      }
    }

    reader.onerror = () => {
      resolve({
        status: 'error',
        transactionsImported: 0,
        categoriesImported: 0,
        budgetsImported: 0,
        goalsImported: 0,
        errorMessage: 'FileReader error — could not open file.',
      })
    }

    reader.readAsText(file)
  })
}

// ═══════════════════════════════════════════════════════════════════════════
//  MARKDOWN EXPORT — MONTHLY FINANCE REPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a Markdown summary report for the given month.
 */
export async function exportMonthReport(month: string): Promise<void> {
  const from = `${month}-01`
  const [year, mon] = month.split('-').map(Number)
  const lastDay = new Date(year, mon, 0).getDate()
  const to = `${month}-${String(lastDay).padStart(2, '0')}`

  const [allTx, categories, budgets, goals] = await Promise.all([
    db.transactions.toArray(),
    db.finCategories.orderBy('sortOrder').toArray(),
    db.budgets.toArray(),
    db.financialGoals.toArray(),
  ])

  const monthTx = allTx.filter((tx) => tx.date >= from && tx.date <= to)
  const today = format(new Date(), 'yyyy-MM-dd')

  const balance = calcBalance(monthTx, from, to)
  const byCat = calcByCategory(monthTx, 'expense')
  const budgetStatus = calcBudgetStatus(monthTx, budgets, month)

  function bar(pct: number): string {
    const filled = Math.round(Math.min(pct / 100, 1) * 20)
    return '[' + '█'.repeat(filled) + '░'.repeat(20 - filled) + ']'
  }

  const lines: string[] = [
    `# habitd — Finance Report: ${month}`,
    '',
    `exported: ${today}`,
    `period:   ${from} → ${to}`,
    '',
    '---',
    '',
    '## balance summary',
    '',
    `income    ${balance.income.toLocaleString().padStart(12)}`,
    `expense   ${balance.expense.toLocaleString().padStart(12)}`,
    `──────────────────────────`,
    `net       ${balance.balance >= 0 ? '+' : ''}${balance.balance.toLocaleString().padStart(11)}`,
    `savings   ${balance.savingsRate.toFixed(1).padStart(11)}%`,
    '',
    '---',
    '',
    '## top expense categories',
    '',
  ]

  const top5 = byCat
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  if (top5.length === 0) {
    lines.push('no expense transactions this month')
  } else {
    const maxTotal = top5[0].total
    for (const cat of top5) {
      const name = categories.find((c) => c.id === cat.categoryId)?.name ?? cat.categoryId
      const pct = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0
      lines.push(
        `${(name).padEnd(20)}  ${bar(pct)}  ${cat.total.toLocaleString().padStart(10)}`,
      )
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## budget status')
  lines.push('')

  if (budgetStatus.length === 0) {
    lines.push('no budgets set for this month')
  } else {
    lines.push('category              spent         limit   status')
    lines.push('────────────────────────────────────────────────────')
    for (const bs of budgetStatus) {
      const name = categories.find((c) => c.id === bs.categoryId)?.name ?? bs.categoryId
      const status = bs.overBudget
        ? '✗ over'
        : bs.spent / bs.limit > 0.8
        ? '⚠ warn'
        : '✓ ok'
      lines.push(
        `${name.padEnd(20)}  ${String(bs.spent).padStart(10)}  ${String(bs.limit).padStart(10)}  ${status}`,
      )
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## financial goals')
  lines.push('')

  const activeGoals = goals.filter((g) => g.status !== 'cancelled')
  if (activeGoals.length === 0) {
    lines.push('no active goals')
  } else {
    for (const goal of activeGoals) {
      const progress = calcGoalProgress(goal, today)
      const statusLabel =
        goal.status === 'completed'
          ? '★ completed'
          : progress.onTrack
          ? 'on track ✓'
          : '⚠ behind'
      lines.push(
        `${bar(progress.percent)}  ${progress.percent.toFixed(0).padStart(3)}%  ${goal.name}  ${statusLabel}`,
      )
      lines.push(
        `  ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}` +
          (goal.deadline ? `   deadline: ${goal.deadline}` : ''),
      )
      lines.push('')
    }
  }

  lines.push('---')
  lines.push('')
  lines.push('*generated by habitd — local-first finance tracker*')

  triggerDownload(
    lines.join('\n'),
    `habitd-report-${month}.md`,
    'text/markdown',
  )
}
