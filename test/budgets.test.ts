import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../src/db';
import { BudgetSchema } from '../src/schemas/finance';
import { calcBudgetStatus } from '../src/engine/finEngine';
import { addTransaction } from '../src/hooks/useTransactions';
import type { Transaction, Budget } from '../src/types';

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

// ─── BudgetSchema validation ──────────────────────────────────────────────────
describe('BudgetSchema', () => {
  it('rejects limitAmount = 0', () => {
    expect(() =>
      BudgetSchema.parse({ categoryId: 'cat1', month: '2026-04', limitAmount: 0 }),
    ).toThrow();
  });

  it('rejects limitAmount < 0', () => {
    expect(() =>
      BudgetSchema.parse({ categoryId: 'cat1', month: '2026-04', limitAmount: -100 }),
    ).toThrow();
  });

  it('rejects invalid month format', () => {
    expect(() =>
      BudgetSchema.parse({ categoryId: 'cat1', month: '04-2026', limitAmount: 500 }),
    ).toThrow();
  });

  it('accepts valid budget', () => {
    expect(() =>
      BudgetSchema.parse({ categoryId: 'cat1', month: '2026-04', limitAmount: 1200 }),
    ).not.toThrow();
  });

  it('accepts minimum limitAmount = 1', () => {
    expect(() =>
      BudgetSchema.parse({ categoryId: 'cat1', month: '2026-04', limitAmount: 1 }),
    ).not.toThrow();
  });
});

// ─── calcBudgetStatus ─────────────────────────────────────────────────────────
describe('calcBudgetStatus', () => {
  const makeTx = (categoryId: string, amount: number, date = '2026-04-10'): Transaction => ({
    id: `tx-${categoryId}-${amount}`, date, amount, type: 'expense', categoryId, createdAt: date,
  });

  it('returns overBudget=false when under limit', async () => {
    await addTransaction({ date: '2026-04-01', type: 'expense', amount: 500, categoryId: MOCK_CAT_ID });
    await addTransaction({ date: '2026-04-02', type: 'expense', amount: 200, categoryId: MOCK_CAT_ID });
    const txs = await db.transactions.toArray();
    const budgets: Budget[] = [{ id: 'b1', categoryId: MOCK_CAT_ID, month: '2026-04', limitAmount: 1200 }];
    const result = calcBudgetStatus(txs, budgets, '2026-04');
    expect(result[0].spent).toBe(700);
    expect(result[0].overBudget).toBe(false);
  });

  it('returns overBudget=true when over limit', async () => {
    await addTransaction({ date: '2026-04-01', type: 'expense', amount: 800, categoryId: MOCK_CAT_ID });
    await addTransaction({ date: '2026-04-02', type: 'expense', amount: 500, categoryId: MOCK_CAT_ID });
    const txs = await db.transactions.toArray();
    const budgets: Budget[] = [{ id: 'b1', categoryId: MOCK_CAT_ID, month: '2026-04', limitAmount: 1200 }];
    const result = calcBudgetStatus(txs, budgets, '2026-04');
    expect(result[0].spent).toBe(1300);
    expect(result[0].overBudget).toBe(true);
  });

  it('ignores income transactions', async () => {
    await addTransaction({ date: '2026-04-01', type: 'income', amount: 5000, categoryId: MOCK_CAT_ID });
    const txs = await db.transactions.toArray();
    const budgets: Budget[] = [{ id: 'b1', categoryId: MOCK_CAT_ID, month: '2026-04', limitAmount: 1000 }];
    const result = calcBudgetStatus(txs, budgets, '2026-04');
    expect(result[0].spent).toBe(0);
    expect(result[0].overBudget).toBe(false);
  });

  it('returns empty array when no budgets', async () => {
    const txs = await db.transactions.toArray();
    expect(calcBudgetStatus(txs, [], '2026-04')).toEqual([]);
  });

  it('transactions in different month → not counted', async () => {
    await addTransaction({ date: '2026-03-01', type: 'expense', amount: 1500, categoryId: MOCK_CAT_ID });
    const txs = await db.transactions.toArray();
    const budgets: Budget[] = [{ id: 'b1', categoryId: MOCK_CAT_ID, month: '2026-04', limitAmount: 1000 }];
    const result = calcBudgetStatus(txs, budgets, '2026-04');
    expect(result[0].spent).toBe(0);
  });
});
