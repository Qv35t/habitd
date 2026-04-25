import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import { db } from '@/db';
import { getMonthRange } from '@/utils/dateUtils';
import { TransactionCreateSchema, TransactionUpdateSchema } from '@/schemas/finance';
import type { z } from 'zod';

type TransactionInput = z.infer<typeof TransactionCreateSchema>;

// ─── Query Hooks ─────────────────────────────────────────────────────────────

/**
 * Reactive hook: all transactions for a given month "YYYY-MM", sorted by date DESC.
 */
export function useTransactionsByMonth(month: string) {
  const [from, to] = getMonthRange(month);

  return useLiveQuery(
    async () =>
      db.transactions
        .where('date')
        .between(from, to, true, true)
        .reverse()
        .toArray(),
    [month],
    [],
  );
}

/**
 * Reactive hook: transactions for an arbitrary date range.
 */
export function useTransactionsByDateRange(from: string, to: string) {
  return useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .between(from, to, true, true)
        .toArray(),
    [from, to],
    [],
  );
}

/**
 * Reactive hook: total transaction count.
 */
export function useTransactionCount() {
  return useLiveQuery(() => db.transactions.count(), [], 0);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Add a transaction. Input is validated via Zod.
 */
export async function addTransaction(
  input: Omit<TransactionInput, 'id' | 'createdAt'>,
): Promise<string> {
  const validated = TransactionCreateSchema.parse(input);
  const id = nanoid();

  await db.transactions.add({
    id,
    ...validated,
    createdAt: new Date().toISOString(),
  });

  return id;
}

/**
 * Update a transaction partially. Validates patch via Zod partial schema.
 */
export async function updateTransaction(
  id: string,
  patch: Partial<Omit<TransactionInput, 'id' | 'createdAt'>>,
): Promise<void> {
  const validated = TransactionUpdateSchema.parse(patch);
  await db.transactions.update(id, validated);
}

/**
 * Delete a transaction by id.
 */
export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Current month as "YYYY-MM" */
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Returns Map<categoryId, txCount> for all transactions.
 * Used by CategoryManager to show count and block delete.
 */
export function useCategoryTxCounts() {
  return useLiveQuery(async () => {
    const all = await db.transactions.toArray();
    const map = new Map<string, number>();
    for (const tx of all) {
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + 1);
    }
    return map;
  }, []);
}

/**
 * Reactive hook: all transactions for a given year.
 */
export function useTransactionsByYear(year: number) {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  return useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .between(from, to, true, true)
        .toArray(),
    [year],
    [],
  );
}
