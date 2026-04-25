import { describe, it, expect } from 'vitest';
import { calcMonthlyTrend, calcYearSummary, calcCategoryMonthlySparklines } from '../src/engine/finEngine';
import type { Transaction, FinCategory } from '../src/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeTx = (
  date: string,
  type: 'income' | 'expense',
  amount: number,
  categoryId = 'cat1',
): Transaction => ({
  id: `tx-${date}-${amount}`,
  date, type, amount, categoryId,
  createdAt: new Date().toISOString(),
});

const makeCategory = (id: string, name: string, symbol: string): FinCategory => ({
  id, name, type: 'expense', symbol,
  color: 'dim', isDefault: true, sortOrder: 0,
});

const TX_2026: Transaction[] = [
  // January
  makeTx('2026-01-15', 'income', 5000, 'salary'),
  makeTx('2026-01-20', 'expense', 1000, 'cat1'),
  makeTx('2026-01-25', 'expense', 500, 'cat2'),
  // February
  makeTx('2026-02-10', 'income', 5000, 'salary'),
  makeTx('2026-02-15', 'expense', 2000, 'cat1'),
  // March
  makeTx('2026-03-05', 'income', 8000, 'salary'),
  makeTx('2026-03-10', 'expense', 800, 'cat1'),
  makeTx('2026-03-20', 'expense', 200, 'cat2'),
];

const CATS: FinCategory[] = [
  makeCategory('cat1', 'Еда', '●'),
  makeCategory('cat2', 'Транспорт', '◌'),
  makeCategory('salary', 'Зарплата', '▸'),
];

// ─── calcMonthlyTrend ────────────────────────────────────────────────────────

describe('calcMonthlyTrend', () => {
  it('returns exactly 12 rows for a year', () => {
    expect(calcMonthlyTrend(TX_2026, 2026)).toHaveLength(12);
  });

  it('correctly counts January: income=5000 expense=1500 balance=3500', () => {
    const result = calcMonthlyTrend(TX_2026, 2026);
    const jan = result.find((r) => r.month === '2026-01')!;
    expect(jan.income).toBe(5000);
    expect(jan.expense).toBe(1500);
    expect(jan.balance).toBe(3500);
    expect(jan.txCount).toBe(3);
  });

  it('month without transactions: all zeros', () => {
    const result = calcMonthlyTrend(TX_2026, 2026);
    const apr = result.find((r) => r.month === '2026-04')!;
    expect(apr.income).toBe(0);
    expect(apr.expense).toBe(0);
    expect(apr.savingsRate).toBe(0);
  });

  it('savingsRate = 0 when income = 0', () => {
    const txs: Transaction[] = [makeTx('2026-05-01', 'expense', 500)];
    const result = calcMonthlyTrend(txs, 2026);
    const may = result.find((r) => r.month === '2026-05')!;
    expect(may.savingsRate).toBe(0);
  });

  it('isCurrent marks exactly one month', () => {
    const result = calcMonthlyTrend(TX_2026, 2026);
    expect(result.filter((r) => r.isCurrent)).toHaveLength(1);
  });

  it('label has format "Jan 26"', () => {
    const result = calcMonthlyTrend(TX_2026, 2026);
    expect(result[0].label).toBe('Jan 26');
    expect(result[11].label).toBe('Dec 26');
  });
});

// ─── calcYearSummary ─────────────────────────────────────────────────────────

describe('calcYearSummary', () => {
  it('totalIncome = sum of all income for the year', () => {
    expect(calcYearSummary(TX_2026, 2026).totalIncome).toBe(18000);
  });

  it('totalExpense = sum of all expense for the year', () => {
    expect(calcYearSummary(TX_2026, 2026).totalExpense).toBe(4500);
  });

  it('netBalance = totalIncome - totalExpense', () => {
    expect(calcYearSummary(TX_2026, 2026).netBalance).toBe(13500);
  });

  it('bestMonth — month with highest balance', () => {
    expect(calcYearSummary(TX_2026, 2026).bestMonth?.month).toBe('2026-03');
  });

  it('worstMonth — month with lowest balance', () => {
    expect(calcYearSummary(TX_2026, 2026).worstMonth?.month).toBe('2026-02');
  });

  it('monthsWithData = 3 (only jan/feb/mar have data)', () => {
    expect(calcYearSummary(TX_2026, 2026).monthsWithData).toBe(3);
  });

  it('empty year: zeros and null for best/worst', () => {
    const summary = calcYearSummary([], 2024);
    expect(summary.totalIncome).toBe(0);
    expect(summary.bestMonth).toBeNull();
    expect(summary.worstMonth).toBeNull();
  });
});

// ─── calcCategoryMonthlySparklines ───────────────────────────────────────────

describe('calcCategoryMonthlySparklines', () => {
  it('returns at most topN categories', () => {
    expect(calcCategoryMonthlySparklines(TX_2026, CATS, 2026, 2).length).toBeLessThanOrEqual(2);
  });

  it('sorts by totalForYear DESC', () => {
    const result = calcCategoryMonthlySparklines(TX_2026, CATS, 2026, 3);
    if (result.length >= 2) {
      expect(result[0].totalForYear).toBeGreaterThanOrEqual(result[1].totalForYear);
    }
  });

  it('sparkline contains exactly 12 characters', () => {
    const result = calcCategoryMonthlySparklines(TX_2026, CATS, 2026, 3);
    result.forEach((r) => {
      expect([...r.sparkline]).toHaveLength(12);
    });
  });

  it('monthlyAmounts has length 12', () => {
    const result = calcCategoryMonthlySparklines(TX_2026, CATS, 2026, 3);
    result.forEach((r) => {
      expect(r.monthlyAmounts).toHaveLength(12);
    });
  });

  it('categories without expenses are excluded', () => {
    expect(calcCategoryMonthlySparklines([], CATS, 2026, 3)).toHaveLength(0);
  });

  it('correctly counts cat1 total: 1000+2000+800=3800', () => {
    const result = calcCategoryMonthlySparklines(TX_2026, CATS, 2026, 3);
    const cat1 = result.find((r) => r.categoryId === 'cat1');
    expect(cat1?.totalForYear).toBe(3800);
  });
});
