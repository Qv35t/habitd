import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../src/db';
import { addTransaction, updateTransaction, deleteTransaction } from '../src/hooks/useTransactions';
import { calcBalance } from '../src/engine/finEngine';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CAT_ID = 'cat-test-001';

beforeEach(async () => {
  await db.open();
  // Seed test category
  await db.finCategories.add({
    id: MOCK_CAT_ID,
    name: 'Test',
    type: 'expense',
    symbol: '●',
    color: 'dim',
    isDefault: false,
    sortOrder: 99,
  });
});

afterEach(async () => {
  await db.delete();
  await db.open();
});

// ─── addTransaction ───────────────────────────────────────────────────────────
describe('addTransaction', () => {
  it('creates a transaction and persists to Dexie', async () => {
    const id = await addTransaction({
      date: '2026-04-13',
      type: 'expense',
      amount: 320,
      categoryId: MOCK_CAT_ID,
      note: 'кафе',
    });
    const tx = await db.transactions.get(id);
    expect(tx).toBeDefined();
    expect(tx!.amount).toBe(320);
    expect(tx!.type).toBe('expense');
    expect(tx!.note).toBe('кафе');
    expect(tx!.id).toBeTruthy();
    expect(tx!.createdAt).toBeTruthy();
  });

  it('rejects amount <= 0 (Zod validation)', async () => {
    await expect(
      addTransaction({ date: '2026-04-13', type: 'expense', amount: -100, categoryId: MOCK_CAT_ID }),
    ).rejects.toThrow();
  });

  it('rejects amount = 0', async () => {
    await expect(
      addTransaction({ date: '2026-04-13', type: 'expense', amount: 0, categoryId: MOCK_CAT_ID }),
    ).rejects.toThrow();
  });

  it('rejects invalid date format', async () => {
    await expect(
      addTransaction({ date: '13-04-2026', type: 'expense', amount: 100, categoryId: MOCK_CAT_ID }),
    ).rejects.toThrow();
  });

  it('accepts note as optional', async () => {
    const id = await addTransaction({
      date: '2026-04-13', type: 'income', amount: 5000, categoryId: MOCK_CAT_ID,
    });
    const tx = await db.transactions.get(id);
    expect(tx!.note).toBeUndefined();
  });
});

// ─── updateTransaction ────────────────────────────────────────────────────────
describe('updateTransaction', () => {
  it('updates amount and note', async () => {
    const id = await addTransaction({
      date: '2026-04-12', type: 'expense', amount: 100, categoryId: MOCK_CAT_ID,
    });
    await updateTransaction(id, { amount: 200, note: 'updated' });
    const tx = await db.transactions.get(id);
    expect(tx!.amount).toBe(200);
    expect(tx!.note).toBe('updated');
  });

  it('rejects invalid patch (amount < 0)', async () => {
    const id = await addTransaction({
      date: '2026-04-12', type: 'expense', amount: 100, categoryId: MOCK_CAT_ID,
    });
    await expect(updateTransaction(id, { amount: -50 })).rejects.toThrow();
  });
});

// ─── deleteTransaction ────────────────────────────────────────────────────────
describe('deleteTransaction', () => {
  it('removes transaction from DB', async () => {
    const id = await addTransaction({
      date: '2026-04-11', type: 'expense', amount: 42, categoryId: MOCK_CAT_ID,
    });
    await deleteTransaction(id);
    const tx = await db.transactions.get(id);
    expect(tx).toBeUndefined();
  });
});

// ─── calcBalance integration ──────────────────────────────────────────────────
describe('calcBalance with real data', () => {
  it('calculates correct balance for month', async () => {
    await addTransaction({ date: '2026-04-13', type: 'income',  amount: 5000, categoryId: MOCK_CAT_ID });
    await addTransaction({ date: '2026-04-12', type: 'expense', amount: 320,  categoryId: MOCK_CAT_ID });
    await addTransaction({ date: '2026-04-11', type: 'expense', amount: 180,  categoryId: MOCK_CAT_ID });

    const all = await db.transactions.toArray();
    const result = calcBalance(all, '2026-04-01', '2026-04-30');

    expect(result.income).toBe(5000);
    expect(result.expense).toBe(500);
    expect(result.balance).toBe(4500);
    expect(result.savingsRate).toBeCloseTo(90);
  });

  it('returns zeros for empty month', async () => {
    const result = calcBalance([], '2026-04-01', '2026-04-30');
    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.savingsRate).toBe(0);
  });

  it('excludes transactions outside date range', async () => {
    await addTransaction({ date: '2026-03-31', type: 'income',  amount: 9999, categoryId: MOCK_CAT_ID });
    await addTransaction({ date: '2026-04-01', type: 'expense', amount: 100,  categoryId: MOCK_CAT_ID });
    await addTransaction({ date: '2026-05-01', type: 'income',  amount: 8888, categoryId: MOCK_CAT_ID });

    const all = await db.transactions.toArray();
    const result = calcBalance(all, '2026-04-01', '2026-04-30');

    expect(result.income).toBe(0);
    expect(result.expense).toBe(100);
  });
});
