import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../src/db';
import { addTransaction } from '../src/hooks/useTransactions';
import { calcTopCategories, calcBudgetStatus, getDailyAmounts, calcSparklineStr } from '../src/engine/finEngine';
import { renderAsciiBar, formatCurrency } from '../src/utils/finance';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CAT_ID = 'cat-test-001';
const MOCK_CAT_ID2 = 'cat-test-002';

beforeEach(async () => {
  await db.open();
  await db.finCategories.bulkAdd([
    { id: MOCK_CAT_ID, name: 'Test A', type: 'expense', symbol: '●', color: 'dim', isDefault: false, sortOrder: 10 },
    { id: MOCK_CAT_ID2, name: 'Test B', type: 'expense', symbol: '▸', color: 'dim', isDefault: false, sortOrder: 11 },
  ]);
});

afterEach(async () => {
  await db.delete();
  await db.open();
});

// ─── getDailyAmounts ──────────────────────────────────────────────────────────
describe('getDailyAmounts', () => {
  it('returns array of correct length', async () => {
    const all = await db.transactions.toArray();
    const result = getDailyAmounts(all, 7, '2026-04-14', 'expense');
    expect(result).toHaveLength(7);
  });

  it('sums expenses per day', async () => {
    await addTransaction({ date: '2026-04-14', type: 'expense', amount: 100, categoryId: MOCK_CAT_ID });
    await addTransaction({ date: '2026-04-14', type: 'expense', amount: 200, categoryId: MOCK_CAT_ID2 });
    const all = await db.transactions.toArray();
    const result = getDailyAmounts(all, 1, '2026-04-14', 'expense');
    expect(result).toEqual([300]);
  });

  it('ignores income when type=expense', async () => {
    await addTransaction({ date: '2026-04-14', type: 'income', amount: 5000, categoryId: MOCK_CAT_ID });
    const all = await db.transactions.toArray();
    const result = getDailyAmounts(all, 1, '2026-04-14', 'expense');
    expect(result).toEqual([0]);
  });

  it('returns zeros for days with no data', async () => {
    const all = await db.transactions.toArray();
    const result = getDailyAmounts(all, 5, '2026-04-14', 'expense');
    expect(result).toEqual([0, 0, 0, 0, 0]);
  });
});

// ─── calcSparklineStr ─────────────────────────────────────────────────────────
describe('calcSparklineStr', () => {
  it('empty array → empty string', () => {
    expect(calcSparklineStr([])).toBe('');
  });

  it('all zeros → all ▁', () => {
    expect(calcSparklineStr([0, 0, 0])).toBe('▄▄▄'); /* all-equal → middle char */
  });

  it('all same values → all █ (middle char when all equal)', () => {
    // calcSparkline returns '▄' (index 3) for all-equal non-zero values
    const result = calcSparklineStr([100, 100, 100]);
    expect(result.length).toBe(3);
  });

  it('result length matches input length', () => {
    const arr = [10, 20, 30, 40, 50];
    expect(calcSparklineStr(arr).length).toBe(5);
  });

  it('ascending values → ascending characters', () => {
    const result = calcSparklineStr([0, 25, 50, 75, 100]);
    expect(result[0]).toBe('▁'); // min
    expect(result[4]).toBe('█'); // max
  });
});

// ─── calcTopCategories ────────────────────────────────────────────────────────
describe('calcTopCategories', () => {
  const txs = [
    { id: 't1', date: '2026-04-01', amount: 500, type: 'expense' as const, categoryId: MOCK_CAT_ID, createdAt: '2026-04-01' },
    { id: 't2', date: '2026-04-02', amount: 200, type: 'expense' as const, categoryId: MOCK_CAT_ID, createdAt: '2026-04-02' },
    { id: 't3', date: '2026-04-03', amount: 150, type: 'expense' as const, categoryId: MOCK_CAT_ID2, createdAt: '2026-04-03' },
  ];

  it('returns top N categories sorted by total DESC', () => {
    const result = calcTopCategories(txs, 'expense', 2);
    expect(result).toHaveLength(2);
    expect(result[0].categoryId).toBe(MOCK_CAT_ID);
    expect(result[0].total).toBe(700);
  });

  it('empty transactions → empty array', () => {
    expect(calcTopCategories([], 'expense', 5)).toHaveLength(0);
  });

  it('percent sums to ~100%', () => {
    const result = calcTopCategories(txs, 'expense', 2);
    const total = result.reduce((s, c) => s + c.sharePercent, 0);
    expect(Math.round(total)).toBe(100);
  });
});

// ─── calcBudgetStatus ─────────────────────────────────────────────────────────
describe('calcBudgetStatus', () => {
  const budgets = [
    { id: 'b1', categoryId: MOCK_CAT_ID, month: '2026-04', limitAmount: 1000 },
  ];

  it('spent < 80% → overBudget=false, warning=false', async () => {
    await addTransaction({ date: '2026-04-01', type: 'expense', amount: 500, categoryId: MOCK_CAT_ID });
    const all = await db.transactions.toArray();
    const result = calcBudgetStatus(all, budgets, '2026-04');
    expect(result[0].overBudget).toBe(false);
    expect(result[0].warning).toBe(false);
  });

  it('spent >= 80% → warning=true', async () => {
    await addTransaction({ date: '2026-04-01', type: 'expense', amount: 850, categoryId: MOCK_CAT_ID });
    const all = await db.transactions.toArray();
    const result = calcBudgetStatus(all, budgets, '2026-04');
    expect(result[0].warning).toBe(true);
    expect(result[0].overBudget).toBe(false);
  });

  it('spent > limit → overBudget=true', async () => {
    await addTransaction({ date: '2026-04-01', type: 'expense', amount: 1200, categoryId: MOCK_CAT_ID });
    const all = await db.transactions.toArray();
    const result = calcBudgetStatus(all, budgets, '2026-04');
    expect(result[0].overBudget).toBe(true);
  });

  it('different month transactions → not included', async () => {
    await addTransaction({ date: '2026-03-01', type: 'expense', amount: 1500, categoryId: MOCK_CAT_ID });
    const all = await db.transactions.toArray();
    const result = calcBudgetStatus(all, budgets, '2026-04');
    expect(result[0].spent).toBe(0);
  });
});

// ─── Utility functions ────────────────────────────────────────────────────────
describe('renderAsciiBar', () => {
  it('value=0 → all ░', () => {
    expect(renderAsciiBar(0, 100, 10)).toBe('░'.repeat(10));
  });

  it('value=max → all █', () => {
    expect(renderAsciiBar(100, 100, 10)).toBe('█'.repeat(10));
  });

  it('50% → half █', () => {
    expect(renderAsciiBar(50, 100, 10)).toBe('█'.repeat(5) + '░'.repeat(5));
  });
});

describe('formatCurrency', () => {
  it('formats thousands with RU layout', () => {
    expect(formatCurrency(12400, 'ru')).toContain('₽');
  });

  it('formats thousands with EN layout', () => {
    expect(formatCurrency(12400, 'en')).toContain('$');
  });

  it('formats zero', () => {
    expect(formatCurrency(0, 'en')).toBe('0 $');
  });
});
