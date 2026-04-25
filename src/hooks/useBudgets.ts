import { useLiveQuery } from 'dexie-react-hooks';
import { format, subMonths, parseISO } from 'date-fns';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { BudgetSchema } from '@/schemas/finance';

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Reactive hook: all budgets for a given month "YYYY-MM".
 */
export function useBudgetsByMonth(month: string) {
  return useLiveQuery(
    () => db.budgets.where('month').equals(month).toArray(),
    [month],
    [],
  );
}

/**
 * Reactive hook: Map<categoryId, Budget> for quick lookups.
 */
export function useBudgetsMap(month: string) {
  const budgets = useBudgetsByMonth(month);
  return new Map(budgets.map((b) => [b.categoryId, b]));
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Create or update a budget for categoryId+month.
 */
export async function upsertBudget(
  categoryId: string,
  month: string,
  limitAmount: number,
): Promise<void> {
  BudgetSchema.parse({ categoryId, month, limitAmount });

  const existing = await db.budgets
    .where('[categoryId+month]')
    .equals([categoryId, month])
    .first();

  if (existing) {
    await db.budgets.update(existing.id, { limitAmount });
  } else {
    await db.budgets.add({ id: nanoid(), categoryId, month, limitAmount });
  }
}

/**
 * Delete a budget by id.
 */
export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.delete(id);
}

/**
 * Clear budget for a specific category+month (shortcut).
 */
export async function clearBudgetForCategory(
  categoryId: string,
  month: string,
): Promise<void> {
  const existing = await db.budgets
    .where('[categoryId+month]')
    .equals([categoryId, month])
    .first();
  if (existing) {
    await db.budgets.delete(existing.id);
  }
}

/**
 * Copy all budgets from previous month to current month.
 * Returns number of copied entries.
 */
export async function copyBudgetsFromPrevMonth(month: string): Promise<number> {
  const prevMonth = format(subMonths(parseISO(`${month}-01`), 1), 'yyyy-MM');
  const source = await db.budgets.where('month').equals(prevMonth).toArray();
  const existing = await db.budgets.where('month').equals(month).toArray();
  const existingCatIds = new Set(existing.map((b) => b.categoryId));

  const toInsert = source
    .filter((b) => !existingCatIds.has(b.categoryId))
    .map((b) => ({ id: nanoid(), categoryId: b.categoryId, month, limitAmount: b.limitAmount }));

  if (toInsert.length > 0) {
    await db.budgets.bulkAdd(toInsert);
  }

  return toInsert.length;
}
