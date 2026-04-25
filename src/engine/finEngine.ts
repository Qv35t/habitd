/**
 * finEngine.ts — Pure computation functions for HABITD Finance Module.
 *
 * CONSTRAINTS (same as streakEngine.ts):
 * - Zero I/O: no db calls, no fetch, no console.log
 * - Zero state: all functions are stateless and deterministic
 * - All date inputs are 'YYYY-MM-DD' strings
 * - `today` is always passed as parameter (no new Date() inside)
 * - Input arrays are never mutated
 */

import {
  parseISO,
  differenceInDays,
  format,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  subDays,
} from 'date-fns'
import type {
  Transaction,
  FinCategory,
  Budget,
  FinancialGoal,
  BalanceResult,
  BudgetStatus,
  CategoryTotal,
  GoalProgress,
  TopCategory,
  MonthSummary,
  SparklineData,
} from '@/types'

// ─────────────────────────────────────────────────────────────────
// INTERNAL CONSTANTS
// ─────────────────────────────────────────────────────────────────

const SPARKLINE_BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const
const HEATMAP_CHARS = ['·', '░', '▒', '▓', '█'] as const

// ─────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────

/** Filter transactions by date range inclusive */
function filterByDateRange(
  txs: Transaction[],
  from: string,
  to: string,
): Transaction[] {
  return txs.filter((t) => t.date >= from && t.date <= to)
}

/** "YYYY-MM" → ["YYYY-MM-01", "YYYY-MM-DD"] */
function getMonthBounds(month: string): [string, string] {
  const d = parseISO(`${month}-01`)
  return [
    format(startOfMonth(d), 'yyyy-MM-dd'),
    format(endOfMonth(d), 'yyyy-MM-dd'),
  ]
}

// ─────────────────────────────────────────────────────────────────
// EXPORTED PURE FUNCTIONS — 11 TOTAL
// ─────────────────────────────────────────────────────────────────

/**
 * Compute balance (income/expense/savings) for a period [from, to].
 */
export function calcBalance(
  txs: Transaction[],
  from: string,
  to: string,
): BalanceResult {
  if (from > to) {
    return { income: 0, expense: 0, balance: 0, savingsRate: 0 }
  }

  const filtered = filterByDateRange(txs, from, to)
  const income = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expense

  // Guard: division by zero → 0, not -Infinity
  const savingsRate =
    income > 0
      ? Math.round(((income - expense) / income) * 100 * 100) / 100
      : 0

  return { income, expense, balance, savingsRate }
}

/**
 * Summarize transactions by category for a period.
 * txCount = total number of transactions (SUM), NOT distinct categories.
 */
export function calcByCategory(
  txs: Transaction[],
  type: 'income' | 'expense',
  from?: string,
  to?: string,
): CategoryTotal[] {
  let filtered = txs.filter((t) => t.type === type)
  if (from && to) {
    filtered = filterByDateRange(filtered, from, to)
  }

  const map = new Map<string, { total: number; txCount: number }>()
  for (const t of filtered) {
    const cur = map.get(t.categoryId) ?? { total: 0, txCount: 0 }
    map.set(t.categoryId, { total: cur.total + t.amount, txCount: cur.txCount + 1 })
  }

  return Array.from(map.entries())
    .map(([categoryId, { total, txCount }]) => ({
      categoryId,
      total,
      txCount,
      avgPerTx: txCount > 0 ? Math.round((total / txCount) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Compare actual spending against budget limits for a month.
 */
export function calcBudgetStatus(
  txs: Transaction[],
  budgets: Budget[],
  month: string,
): BudgetStatus[] {
  const [from, to] = getMonthBounds(month)
  const expenses = filterByDateRange(
    txs.filter((t) => t.type === 'expense'),
    from,
    to,
  )

  const spentMap = new Map<string, number>()
  for (const t of expenses) {
    spentMap.set(t.categoryId, (spentMap.get(t.categoryId) ?? 0) + t.amount)
  }

  return budgets.map((b) => {
    const spent = spentMap.get(b.categoryId) ?? 0
    const limit = b.limitAmount > 0 ? b.limitAmount : 1 // guard against 0
    const usagePercent = Math.round((spent / limit) * 100 * 100) / 100
    return {
      categoryId: b.categoryId,
      spent,
      limit: b.limitAmount,
      usagePercent,
      overBudget: spent > b.limitAmount,
      warning: usagePercent >= 80 && spent <= b.limitAmount,
    }
  })
}

/**
 * Compute progress for a financial goal.
 */
export function calcGoalProgress(
  goal: FinancialGoal,
  today: string,
): GoalProgress {
  // Guard
  if (goal.targetAmount <= 0) {
    return { percent: 0, remaining: 0, onTrack: true, expectedPercent: 0 }
  }

  const percent = Math.min(
    Math.round((goal.currentAmount / goal.targetAmount) * 100 * 100) / 100,
    100,
  )
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)

  // No deadline → always on track
  if (!goal.deadline) {
    return { percent, remaining, onTrack: true, expectedPercent: 0 }
  }

  const daysLeft = differenceInDays(parseISO(goal.deadline), parseISO(today))
  const daysTotal = differenceInDays(
    parseISO(goal.deadline),
    parseISO(goal.createdAt),
  )

  // Deadline passed and goal not reached
  if (daysLeft < 0 && percent < 100) {
    return { percent, remaining, onTrack: false, daysLeft: 0, expectedPercent: 100 }
  }

  const expectedPercent =
    daysTotal > 0
      ? ((daysTotal - Math.max(daysLeft, 0)) / daysTotal) * 100
      : 100

  // 10% tolerance: onTrack if actual >= 90% of expected
  const onTrack = percent >= expectedPercent * 0.9 || percent >= 100

  return { percent, remaining, onTrack, daysLeft: Math.max(daysLeft, 0), expectedPercent }
}

/**
 * Build spending heatmap: date → total expenses for that day.
 * Only expenses for the given year are included.
 */
export function calcSpendingHeatmap(
  txs: Transaction[],
  year: number,
): Record<string, number> {
  const result: Record<string, number> = {}
  const yearPrefix = String(year)

  for (const t of txs) {
    if (t.type !== 'expense') continue
    if (!t.date.startsWith(yearPrefix)) continue
    result[t.date] = (result[t.date] ?? 0) + t.amount
  }

  return result
}

/**
 * Top-N categories by total spending/income for a period.
 */
export function calcTopCategories(
  txs: Transaction[],
  type: 'income' | 'expense',
  n = 5,
  from?: string,
  to?: string,
): TopCategory[] {
  const totals = calcByCategory(txs, type, from, to)
  const grandTotal = totals.reduce((s, c) => s + c.total, 0)

  return totals.slice(0, n).map((c, i) => ({
    ...c,
    rank: i + 1,
    sharePercent:
      grandTotal > 0
        ? Math.round((c.total / grandTotal) * 100 * 100) / 100
        : 0,
  }))
}

/**
 * Moving average of daily expenses over the last N days.
 */
export function calcMovingAverage(
  txs: Transaction[],
  days: number,
  today: string,
): number {
  if (days <= 0 || txs.length === 0) return 0

  const todayDate = parseISO(today)
  const fromDate = new Date(todayDate)
  fromDate.setDate(fromDate.getDate() - (days - 1))
  const from = format(fromDate, 'yyyy-MM-dd')

  const expenses = filterByDateRange(
    txs.filter((t) => t.type === 'expense'),
    from,
    today,
  )

  const total = expenses.reduce((s, t) => s + t.amount, 0)
  return Math.round((total / days) * 100) / 100
}

/**
 * Full month summary: balance + budget status combined.
 */
export function calcMonthSummary(
  txs: Transaction[],
  budgets: Budget[],
  month: string,
): MonthSummary {
  const [from, to] = getMonthBounds(month)
  const monthTxs = filterByDateRange(txs, from, to)

  const { income, expense, balance, savingsRate } = calcBalance(monthTxs, from, to)
  const budgetStatus = calcBudgetStatus(monthTxs, budgets, month)

  return {
    month,
    totalIncome: income,
    totalExpense: expense,
    balance,
    savingsRate,
    txCount: monthTxs.length, // TOTAL transactions, not distinct categories
    budgetStatus,
  }
}

/**
 * Convert an array of numbers into an ASCII sparkline string.
 */
export function calcSparkline(values: number[]): SparklineData {
  if (values.length === 0) {
    return { chars: '', values: [], max: 0, avg: 0 }
  }

  const normalized = values.map((v) => Math.max(v, 0))
  const max = Math.max(...normalized)
  const avg =
    normalized.reduce((s, v) => s + v, 0) / normalized.length

  // All values the same → middle character
  const allSame = normalized.every((v) => v === normalized[0])

  const chars = normalized
    .map((v) => {
      if (max === 0 || allSame) return SPARKLINE_BLOCKS[3]
      const idx = Math.min(Math.floor((v / max) * 7), 7)
      return SPARKLINE_BLOCKS[idx]
    })
    .join('')

  return { chars, values: normalized, max, avg }
}

/**
 * Determine heatmap ASCII character by value intensity.
 */
export function calcHeatmapChar(value: number, max: number): string {
  if (value <= 0 || max <= 0) return HEATMAP_CHARS[0] // '·'
  const ratio = value / max
  if (ratio <= 0.25) return HEATMAP_CHARS[1] // '░'
  if (ratio <= 0.5) return HEATMAP_CHARS[2] // '▒'
  if (ratio <= 0.75) return HEATMAP_CHARS[3] // '▓'
  return HEATMAP_CHARS[4] // '█'
}

/**
 * Generate an ASCII progress bar string.
 */
export function calcProgressBar(
  current: number,
  total: number,
  width = 20,
): string {
  const w = Math.max(width, 4)

  if (total <= 0) return `[${'░'.repeat(w)}] 0%`

  const ratio = current / total
  const filled = Math.min(Math.round(ratio * w), w)
  const empty = w - filled
  const percent = Math.round(ratio * 100)

  const bar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`
  return current > total ? `${bar} 100%+` : `${bar} ${percent}%`
}

/**
 * Prepare array of daily amounts for sparkline over last N days.
 */
export function getDailyAmounts(
  txs: Transaction[],
  days: number,
  today: string,
  type: 'expense' | 'income' | 'both' = 'expense',
): number[] {
  const result: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(parseISO(today), i), 'yyyy-MM-dd');
    const dayTxs = txs.filter(
      (t) => t.date === date && (type === 'both' || t.type === type),
    );
    result.push(dayTxs.reduce((sum, t) => sum + t.amount, 0));
  }
  return result;
}

/**
 * Return just the sparkline string (shorthand for calcSparkline(v).chars).
 */
export function calcSparklineStr(values: number[]): string {
  return calcSparkline(values).chars;
}

/**
 * ASCII progress bar: [████████░░░░░░░░░░░░]
 */
export function renderProgressBar(percent: number, width = 20): string {
  const filled = Math.round(Math.min(percent, 100) / 100 * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

// ─── F7: Annual Analytics Types ───────────────────────────────────────────

export interface MonthlyTrendRow {
  month: string;        // "YYYY-MM"
  label: string;        // "Jan 26"
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  txCount: number;
  isCurrent: boolean;
}

export interface YearSummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  avgSavingsRate: number;
  bestMonth: { month: string; label: string; balance: number } | null;
  worstMonth: { month: string; label: string; balance: number } | null;
  monthsWithData: number;
}

export interface CategorySparkline {
  categoryId: string;
  categoryName: string;
  symbol: string;
  totalForYear: number;
  sparkline: string;
  monthlyAmounts: number[];
}

// ─── F7: Annual Analytics Functions ───────────────────────────────────────

export function calcMonthlyTrend(
  txs: Transaction[],
  year: number,
): MonthlyTrendRow[] {
  const months = Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`,
  );
  const today = format(new Date(), 'yyyy-MM');

  return months.map((month) => {
    const daysInMonth = getDaysInMonth(parseISO(`${month}-01`));
    const from = `${month}-01`;
    const to = `${month}-${daysInMonth}`;
    const { income, expense, balance, savingsRate } = calcBalance(txs, from, to);
    const txCount = txs.filter((t) => t.date >= from && t.date <= to).length;
    const label = format(parseISO(`${month}-15`), 'MMM yy');
    return { month, label, income, expense, balance, savingsRate, txCount, isCurrent: month === today };
  });
}

export function calcYearSummary(
  txs: Transaction[],
  year: number,
): YearSummary {
  const trend = calcMonthlyTrend(txs, year);
  const active = trend.filter((r) => r.txCount > 0);

  const totalIncome = active.reduce((s, r) => s + r.income, 0);
  const totalExpense = active.reduce((s, r) => s + r.expense, 0);
  const netBalance = totalIncome - totalExpense;
  const avgSavingsRate =
    active.length > 0 ? active.reduce((s, r) => s + r.savingsRate, 0) / active.length : 0;

  const bestMonth = active.length > 0
    ? active.reduce((prev, cur) => (cur.balance > prev.balance ? cur : prev))
    : null;
  const worstMonth = active.length > 0
    ? active.reduce((prev, cur) => (cur.balance < prev.balance ? cur : prev))
    : null;

  return {
    year,
    totalIncome,
    totalExpense,
    netBalance,
    avgSavingsRate,
    monthsWithData: active.length,
    bestMonth: bestMonth ? { month: bestMonth.month, label: bestMonth.label, balance: bestMonth.balance } : null,
    worstMonth: worstMonth ? { month: worstMonth.month, label: worstMonth.label, balance: worstMonth.balance } : null,
  };
}

export function calcCategoryMonthlySparklines(
  txs: Transaction[],
  categories: FinCategory[],
  year: number,
  topN = 3,
): CategorySparkline[] {
  const months = Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`,
  );
  const expenseTxs = txs.filter((t) => t.type === 'expense');

  const totals = categories
    .filter((c) => c.type === 'expense' || c.type === 'both')
    .map((cat) => {
      const monthlyAmounts = months.map((month) => {
        const daysInMonth = getDaysInMonth(parseISO(`${month}-01`));
        const from = `${month}-01`;
        const to = `${month}-${daysInMonth}`;
        return expenseTxs
          .filter((t) => t.categoryId === cat.id && t.date >= from && t.date <= to)
          .reduce((s, t) => s + t.amount, 0);
      });
      const totalForYear = monthlyAmounts.reduce((s, v) => s + v, 0);
      return { cat, monthlyAmounts, totalForYear };
    })
    .filter((r) => r.totalForYear > 0)
    .sort((a, b) => b.totalForYear - a.totalForYear)
    .slice(0, topN);

  return totals.map(({ cat, monthlyAmounts, totalForYear }) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    symbol: cat.symbol,
    totalForYear,
    sparkline: calcSparkline(monthlyAmounts).chars,
    monthlyAmounts,
  }));
}
