import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../src/db';
import { calcGoalProgress, renderProgressBar } from '../src/engine/finEngine';
import { addGoal, updateGoal, deleteGoal, addFundsToGoal, completeGoal, cancelGoal, useActiveGoals } from '../src/hooks/useFinancialGoals';
import type { FinancialGoal } from '../src/types';

const base: FinancialGoal = {
  id: 'g1',
  name: 'Test Goal',
  targetAmount: 10000,
  currentAmount: 0,
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// ─── calcGoalProgress ─────────────────────────────────────────────────────────
describe('calcGoalProgress', () => {
  it('returns 0% when currentAmount is 0', () => {
    expect(calcGoalProgress(base, '2026-04-14').percent).toBe(0);
  });

  it('returns 100% when currentAmount equals targetAmount', () => {
    expect(calcGoalProgress({ ...base, currentAmount: 10000 }, '2026-04-14').percent).toBe(100);
  });

  it('clamps percent to 100 when currentAmount exceeds targetAmount', () => {
    expect(calcGoalProgress({ ...base, currentAmount: 12000 }, '2026-04-14').percent).toBe(100);
  });

  it('calculates correct remaining amount', () => {
    expect(calcGoalProgress({ ...base, currentAmount: 3500 }, '2026-04-14').remaining).toBe(6500);
  });

  it('remaining is 0 when goal is completed', () => {
    expect(calcGoalProgress({ ...base, currentAmount: 10000 }, '2026-04-14').remaining).toBe(0);
  });

  it('onTrack is always true when no deadline', () => {
    expect(calcGoalProgress({ ...base, currentAmount: 100 }, '2026-04-14').onTrack).toBe(true);
    expect(calcGoalProgress(base, '2026-04-14').daysLeft).toBeUndefined();
  });

  it('onTrack true when ahead of schedule', () => {
    // createdAt: 2026-01-01, deadline: 2026-12-31 (365 days)
    // today: 2026-04-14 — ~28% of time passed
    // currentAmount=3000 = 30% → should be on track
    const goal = { ...base, currentAmount: 3000, deadline: '2026-12-31' };
    expect(calcGoalProgress(goal, '2026-04-14').onTrack).toBe(true);
  });

  it('onTrack false when behind schedule', () => {
    // createdAt: 2026-01-01, deadline: 2026-12-31
    // today: 2026-07-01 — ~50% of time passed
    // currentAmount=500 = 5% → NOT on track
    const goal = { ...base, currentAmount: 500, deadline: '2026-12-31' };
    expect(calcGoalProgress(goal, '2026-07-01').onTrack).toBe(false);
  });

  it('daysLeft is correct', () => {
    const goal = { ...base, deadline: '2026-04-20' };
    expect(calcGoalProgress(goal, '2026-04-14').daysLeft).toBe(6);
  });

  it('past deadline → onTrack false', () => {
    const goal = { ...base, currentAmount: 5000, deadline: '2026-01-01' };
    const p = calcGoalProgress(goal, '2026-04-14');
    expect(p.daysLeft).toBeLessThanOrEqual(0);
    expect(p.onTrack).toBe(false);
  });

  it('handles targetAmount = 0 without division by zero', () => {
    const goal = { ...base, targetAmount: 0 };
    const p = calcGoalProgress(goal, '2026-04-14');
    expect(p.percent).toBe(0);
    expect(p.remaining).toBe(0);
  });

  it('does not crash when created and deadline on same day', () => {
    const goal = { ...base, createdAt: '2026-04-14T00:00:00.000Z', deadline: '2026-04-14' };
    expect(() => calcGoalProgress(goal, '2026-04-14')).not.toThrow();
  });
});

// ─── renderProgressBar ────────────────────────────────────────────────────────
describe('renderProgressBar', () => {
  it('returns string of length width + 2 (brackets)', () => {
    expect(renderProgressBar(50, 20).length).toBe(22);
  });

  it('renders fully filled bar at 100%', () => {
    expect(renderProgressBar(100, 20)).toBe('[' + '█'.repeat(20) + ']');
  });

  it('renders empty bar at 0%', () => {
    expect(renderProgressBar(0, 20)).toBe('[' + '░'.repeat(20) + ']');
  });

  it('renders half bar at 50%', () => {
    expect(renderProgressBar(50, 20)).toBe('[██████████░░░░░░░░░░]');
  });

  it('clamps input above 100%', () => {
    expect(renderProgressBar(150, 20)).toBe('[' + '█'.repeat(20) + ']');
  });
});

// ─── Goal CRUD via Dexie ──────────────────────────────────────────────────────
describe('Goal CRUD operations', () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
    await db.open();
  });

  it('addGoal creates a goal in Dexie', async () => {
    const id = await addGoal({ name: 'Laptop', targetAmount: 5000, currentAmount: 1000 });
    const goal = await db.financialGoals.get(id);
    expect(goal).toBeDefined();
    expect(goal!.name).toBe('Laptop');
    expect(goal!.status).toBe('active');
  });

  it('updateGoal changes goal fields', async () => {
    const id = await addGoal({ name: 'Old Name', targetAmount: 1000, currentAmount: 0 });
    await updateGoal(id, { name: 'New Name', currentAmount: 500 });
    const goal = await db.financialGoals.get(id);
    expect(goal!.name).toBe('New Name');
    expect(goal!.currentAmount).toBe(500);
  });

  it('deleteGoal removes goal from DB', async () => {
    const id = await addGoal({ name: 'ToDelete', targetAmount: 100, currentAmount: 0 });
    await deleteGoal(id);
    const goal = await db.financialGoals.get(id);
    expect(goal).toBeUndefined();
  });

  it('addFundsToGoal increments currentAmount and auto-completes', async () => {
    const id = await addGoal({ name: 'Savings', targetAmount: 1000, currentAmount: 800 });
    await addFundsToGoal(id, 300);
    const goal = await db.financialGoals.get(id);
    expect(goal!.currentAmount).toBe(1000); // capped at target
    expect(goal!.status).toBe('completed');
  });

  it('addFundsToGoal rejects negative amount', async () => {
    const id = await addGoal({ name: 'Test', targetAmount: 100, currentAmount: 0 });
    await expect(addFundsToGoal(id, -50)).rejects.toThrow();
  });

  it('completeGoal sets status to completed', async () => {
    const id = await addGoal({ name: 'Goal', targetAmount: 100, currentAmount: 50 });
    await completeGoal(id);
    const goal = await db.financialGoals.get(id);
    expect(goal!.status).toBe('completed');
    expect(goal!.currentAmount).toBe(100);
  });

  it('cancelGoal sets status to cancelled', async () => {
    const id = await addGoal({ name: 'Goal', targetAmount: 100, currentAmount: 50 });
    await cancelGoal(id);
    const goal = await db.financialGoals.get(id);
    expect(goal!.status).toBe('cancelled');
  });
});
