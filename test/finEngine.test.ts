import { describe, it, expect } from 'vitest';
import {
  calcBalance,
  calcByCategory,
  calcBudgetStatus,
  calcGoalProgress,
  calcSpendingHeatmap,
  calcTopCategories,
  calcMovingAverage,
  calcMonthSummary,
  calcSparkline,
  calcHeatmapChar,
  calcProgressBar,
} from '../src/engine/finEngine';
import type { Transaction, Budget, FinancialGoal } from '../src/types/finance';

// ── Test fixtures ──────────────────────────────────────────────────

const makeIncome = (
  date: string,
  amount: number,
  catId = 'cat-salary',
): Transaction => ({
  id: `tx-${date}-${amount}`,
  date,
  amount,
  type: 'income',
  categoryId: catId,
  createdAt: date,
});

const makeExpense = (
  date: string,
  amount: number,
  catId = 'cat-food',
): Transaction => ({
  id: `tx-${date}-${amount}`,
  date,
  amount,
  type: 'expense',
  categoryId: catId,
  createdAt: date,
});

const makeBudget = (
  catId: string,
  month: string,
  limit: number,
): Budget => ({
  id: `budget-${catId}-${month}`,
  categoryId: catId,
  month,
  limitAmount: limit,
});

const makeGoal = (
  current: number,
  target: number,
  deadline?: string,
  created = '2026-01-01',
): FinancialGoal => ({
  id: 'goal-1',
  name: 'Test Goal',
  targetAmount: target,
  currentAmount: current,
  deadline,
  status: 'active',
  createdAt: created,
});

// ═══════════════════════════════════════════════════════════════════
//  calcBalance — 5 tests
// ═══════════════════════════════════════════════════════════════════

describe('calcBalance', () => {
  it('empty array → zero result', () => {
    const r = calcBalance([], '2026-04-01', '2026-04-30');
    expect(r).toEqual({ income: 0, expense: 0, balance: 0, savingsRate: 0 });
  });

  it('only income → savingsRate: 100', () => {
    const txs = [
      makeIncome('2026-04-10', 5000),
      makeIncome('2026-04-20', 3000),
    ];
    const r = calcBalance(txs, '2026-04-01', '2026-04-30');
    expect(r.income).toBe(8000);
    expect(r.expense).toBe(0);
    expect(r.balance).toBe(8000);
    expect(r.savingsRate).toBe(100);
  });

  it('income=10000 expense=7500 → savingsRate=25', () => {
    const txs = [
      makeIncome('2026-04-01', 10000),
      makeExpense('2026-04-15', 7500),
    ];
    const r = calcBalance(txs, '2026-04-01', '2026-04-30');
    expect(r.balance).toBe(2500);
    expect(r.savingsRate).toBe(25);
  });

  it('income=0 with expenses → savingsRate=0, not Infinity', () => {
    const txs = [makeExpense('2026-04-01', 500)];
    const r = calcBalance(txs, '2026-04-01', '2026-04-30');
    expect(r.savingsRate).toBe(0);
    expect(Number.isFinite(r.savingsRate)).toBe(true);
  });

  it('from > to → zero result without error', () => {
    const txs = [makeIncome('2026-04-10', 1000)];
    expect(calcBalance(txs, '2026-04-30', '2026-04-01')).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
      savingsRate: 0,
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
//  calcBudgetStatus — 5 tests
// ═══════════════════════════════════════════════════════════════════

describe('calcBudgetStatus', () => {
  it('spend < 80% → both flags false', () => {
    const txs = [makeExpense('2026-04-10', 400, 'cat-food')];
    const budgets = [makeBudget('cat-food', '2026-04', 1000)];
    const [s] = calcBudgetStatus(txs, budgets, '2026-04');
    expect(s.overBudget).toBe(false);
    expect(s.warning).toBe(false);
    expect(s.usagePercent).toBe(40);
  });

  it('spend >= 80% and < 100% → warning: true', () => {
    const txs = [makeExpense('2026-04-10', 850, 'cat-food')];
    const budgets = [makeBudget('cat-food', '2026-04', 1000)];
    const [s] = calcBudgetStatus(txs, budgets, '2026-04');
    expect(s.warning).toBe(true);
    expect(s.overBudget).toBe(false);
  });

  it('spend > 100% → overBudget: true, warning: false', () => {
    const txs = [makeExpense('2026-04-10', 1200, 'cat-food')];
    const budgets = [makeBudget('cat-food', '2026-04', 1000)];
    const [s] = calcBudgetStatus(txs, budgets, '2026-04');
    expect(s.overBudget).toBe(true);
    expect(s.warning).toBe(false);
  });

  it('no transactions for category → spent: 0', () => {
    const budgets = [makeBudget('cat-food', '2026-04', 500)];
    const [s] = calcBudgetStatus([], budgets, '2026-04');
    expect(s.spent).toBe(0);
    expect(s.overBudget).toBe(false);
  });

  it('multiple categories → each gets correct status', () => {
    const txs = [
      makeExpense('2026-04-10', 300, 'cat-food'),
      makeExpense('2026-04-10', 600, 'cat-transport'),
    ];
    const budgets = [
      makeBudget('cat-food', '2026-04', 1000),
      makeBudget('cat-transport', '2026-04', 500),
    ];
    const statuses = calcBudgetStatus(txs, budgets, '2026-04');
    expect(statuses).toHaveLength(2);
    const food = statuses.find((s) => s.categoryId === 'cat-food')!;
    const trans = statuses.find((s) => s.categoryId === 'cat-transport')!;
    expect(food.overBudget).toBe(false);
    expect(trans.overBudget).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
//  calcGoalProgress — 6 tests
// ═══════════════════════════════════════════════════════════════════

describe('calcGoalProgress', () => {
  it('currentAmount=0 → percent: 0', () => {
    const g = makeGoal(0, 10000);
    expect(calcGoalProgress(g, '2026-04-14').percent).toBe(0);
  });

  it('currentAmount=targetAmount → percent: 100, remaining: 0', () => {
    const g = makeGoal(5000, 5000);
    const r = calcGoalProgress(g, '2026-04-14');
    expect(r.percent).toBe(100);
    expect(r.remaining).toBe(0);
    expect(r.onTrack).toBe(true);
  });

  it('currentAmount > targetAmount → percent capped at 100', () => {
    const g = makeGoal(12000, 10000);
    expect(calcGoalProgress(g, '2026-04-14').percent).toBe(100);
  });

  it('no deadline → onTrack: true always', () => {
    const g = makeGoal(100, 10000); // only 1% done
    expect(calcGoalProgress(g, '2026-04-14').onTrack).toBe(true);
  });

  it('deadline passed, not reached → onTrack: false', () => {
    const g = makeGoal(100, 10000, '2026-01-01', '2025-01-01');
    expect(calcGoalProgress(g, '2026-04-14').onTrack).toBe(false);
  });

  it('targetAmount=0 → returns zero without error', () => {
    const g = makeGoal(0, 0);
    expect(() => calcGoalProgress(g, '2026-04-14')).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
//  calcSpendingHeatmap — 3 tests
// ═══════════════════════════════════════════════════════════════════

describe('calcSpendingHeatmap', () => {
  it('multiple expenses on same day → summed', () => {
    const txs = [
      makeExpense('2026-04-10', 100),
      makeExpense('2026-04-10', 200),
    ];
    const hm = calcSpendingHeatmap(txs, 2026);
    expect(hm['2026-04-10']).toBe(300);
  });

  it('income transactions are ignored', () => {
    const txs = [
      makeIncome('2026-04-10', 5000),
      makeExpense('2026-04-10', 100),
    ];
    const hm = calcSpendingHeatmap(txs, 2026);
    expect(hm['2026-04-10']).toBe(100);
  });

  it('no data for year → empty object', () => {
    const txs = [makeExpense('2025-04-10', 100)];
    const hm = calcSpendingHeatmap(txs, 2026);
    expect(Object.keys(hm)).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
//  calcSparkline — 4 tests
// ═══════════════════════════════════════════════════════════════════

describe('calcSparkline', () => {
  it('empty array → empty chars', () => {
    const r = calcSparkline([]);
    expect(r.chars).toBe('');
    expect(r.values).toHaveLength(0);
  });

  it('chars length equals values length', () => {
    const r = calcSparkline([10, 20, 30, 40, 50]);
    expect(r.chars.length).toBe(5);
  });

  it('negative values do not break function', () => {
    expect(() => calcSparkline([-10, -20, 30])).not.toThrow();
  });

  it('max is correct', () => {
    const r = calcSparkline([5, 10, 20]);
    expect(r.max).toBe(20);
  });
});

// ═══════════════════════════════════════════════════════════════════
//  calcProgressBar — 3 tests
// ═══════════════════════════════════════════════════════════════════

describe('calcProgressBar', () => {
  it('0/100 → contains "0%"', () => {
    expect(calcProgressBar(0, 100)).toContain('0%');
  });

  it('50/100 width=20 → 10 filled blocks', () => {
    const bar = calcProgressBar(50, 100, 20);
    expect((bar.match(/█/g) || []).length).toBe(10);
  });

  it('overshoot > 100% → contains "100%+"', () => {
    expect(calcProgressBar(150, 100)).toContain('100%+');
  });
});

// ═══════════════════════════════════════════════════════════════════
//  calcHeatmapChar — 2 tests
// ═══════════════════════════════════════════════════════════════════

describe('calcHeatmapChar', () => {
  it('value=0 → "·"', () => {
    expect(calcHeatmapChar(0, 100)).toBe('·');
  });

  it('value=max → "█"', () => {
    expect(calcHeatmapChar(100, 100)).toBe('█');
  });
});
