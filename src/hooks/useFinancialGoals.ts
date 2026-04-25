import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { FinancialGoalSchema } from '@/schemas/finance';
import type { FinancialGoal } from '@/types';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useActiveGoals() {
  return useLiveQuery(
    () => db.financialGoals.where('status').equals('active').sortBy('createdAt'),
    [],
  );
}

export function useCompletedGoals() {
  return useLiveQuery(
    () => db.financialGoals.where('status').equals('completed').reverse().sortBy('createdAt'),
    [],
  );
}

export function useAllGoals() {
  return useLiveQuery(
    () => db.financialGoals.orderBy('createdAt').reverse().toArray(),
    [],
  );
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function addGoal(
  input: Omit<FinancialGoal, 'id' | 'status' | 'createdAt'>,
): Promise<string> {
  const parsed = FinancialGoalSchema.parse(input);
  const status = 'active';
  const createdAt = new Date().toISOString();
  const id = nanoid();
  await db.financialGoals.add({ ...parsed, id, status, createdAt });
  return id;
}


export async function updateGoal(
  id: string,
  patch: Partial<Omit<FinancialGoal, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.financialGoals.update(id, patch);
}

export async function deleteGoal(id: string): Promise<void> {
  await db.financialGoals.delete(id);
}

/**
 * Atomically add funds to a goal. Caps at targetAmount.
 * Auto-completes goal when target is reached.
 */
export async function addFundsToGoal(id: string, amount: number): Promise<void> {
  if (amount <= 0) throw new Error('amount must be positive');
  const goal = await db.financialGoals.get(id);
  if (!goal) throw new Error(`Goal ${id} not found`);
  const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
  const newStatus = newAmount >= goal.targetAmount ? 'completed' : 'active';
  await db.financialGoals.update(id, { currentAmount: newAmount, status: newStatus });
}

/** Force-complete a goal. */
export async function completeGoal(id: string): Promise<void> {
  const goal = await db.financialGoals.get(id);
  if (!goal) throw new Error(`Goal ${id} not found`);
  await db.financialGoals.update(id, { status: 'completed', currentAmount: goal.targetAmount });
}

/** Cancel a goal. */
export async function cancelGoal(id: string): Promise<void> {
  await db.financialGoals.update(id, { status: 'cancelled' });
}
