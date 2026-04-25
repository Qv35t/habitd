import { describe, it, expect } from 'vitest';
import {
  TransactionCreateSchema,
  TransactionUpdateSchema,
  BudgetSchema,
  FinancialGoalSchema,
} from '../src/schemas/finance';

// ── TransactionCreateSchema (7 tests) ─────────────────────────────────────────
describe('TransactionCreateSchema', () => {
  const valid = {
    date: '2026-04-13',
    amount: 500,
    type: 'expense' as const,
    categoryId: 'cat_123',
    note: 'обед',
  };

  it('accepts valid transaction', () => {
    expect(() => TransactionCreateSchema.parse(valid)).not.toThrow();
  });

  it('rejects negative amount', () => {
    expect(() =>
      TransactionCreateSchema.parse({ ...valid, amount: -100 })
    ).toThrow('Сумма должна быть > 0');
  });

  it('rejects zero amount', () => {
    expect(() =>
      TransactionCreateSchema.parse({ ...valid, amount: 0 })
    ).toThrow();
  });

  it('rejects invalid date format DD-MM-YYYY', () => {
    expect(() =>
      TransactionCreateSchema.parse({ ...valid, date: '13-04-2026' })
    ).toThrow('Формат даты: YYYY-MM-DD');
  });

  it('rejects invalid type "transfer"', () => {
    expect(() =>
      TransactionCreateSchema.parse({ ...valid, type: 'transfer' as never })
    ).toThrow();
  });

  it('rejects note longer than 200 chars', () => {
    expect(() =>
      TransactionCreateSchema.parse({ ...valid, note: 'a'.repeat(201) })
    ).toThrow('Заметка не более 200 символов');
  });

  it('accepts transaction without optional fields (minimal)', () => {
    const minimal = {
      date: '2026-04-13',
      amount: 100,
      type: 'income' as const,
      categoryId: 'c1',
    };
    expect(() => TransactionCreateSchema.parse(minimal)).not.toThrow();
  });
});

// ── BudgetSchema (4 tests) ────────────────────────────────────────────────────
describe('BudgetSchema', () => {
  const valid = { categoryId: 'cat_1', month: '2026-04', limitAmount: 1200 };

  it('accepts valid budget', () => {
    expect(() => BudgetSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid month format 04-2026', () => {
    expect(() =>
      BudgetSchema.parse({ ...valid, month: '04-2026' })
    ).toThrow('Формат месяца: YYYY-MM');
  });

  it('rejects zero limitAmount', () => {
    expect(() =>
      BudgetSchema.parse({ ...valid, limitAmount: 0 })
    ).toThrow('Лимит должен быть > 0');
  });

  it('rejects negative limitAmount', () => {
    expect(() =>
      BudgetSchema.parse({ ...valid, limitAmount: -500 })
    ).toThrow();
  });
});

// ── FinancialGoalSchema (8 tests) ─────────────────────────────────────────────
describe('FinancialGoalSchema', () => {
  const valid = {
    name: 'MacBook Pro',
    targetAmount: 15000,
    currentAmount: 8000,
    deadline: '2026-12-31',
  };

  it('accepts valid goal', () => {
    expect(() => FinancialGoalSchema.parse(valid)).not.toThrow();
  });

  it('rejects currentAmount > targetAmount', () => {
    expect(() =>
      FinancialGoalSchema.parse({ ...valid, currentAmount: 20000 })
    ).toThrow('Накоплено не может превышать целевую сумму');
  });

  it('accepts goal with currentAmount = 0 (new goal)', () => {
    expect(() =>
      FinancialGoalSchema.parse({ ...valid, currentAmount: 0 })
    ).not.toThrow();
  });

  it('accepts goal with currentAmount = targetAmount (completed)', () => {
    expect(() =>
      FinancialGoalSchema.parse({ ...valid, currentAmount: 15000 })
    ).not.toThrow();
  });

  it('rejects negative targetAmount', () => {
    expect(() =>
      FinancialGoalSchema.parse({ ...valid, targetAmount: -100 })
    ).toThrow('Целевая сумма должна быть > 0');
  });

  it('rejects negative currentAmount', () => {
    expect(() =>
      FinancialGoalSchema.parse({ ...valid, currentAmount: -1 })
    ).toThrow('Накоплено не может быть отрицательным');
  });

  it('rejects invalid deadline format 31.12.2026', () => {
    expect(() =>
      FinancialGoalSchema.parse({ ...valid, deadline: '31.12.2026' })
    ).toThrow('Формат даты: YYYY-MM-DD');
  });

  it('accepts goal without deadline (ongoing)', () => {
    const { deadline, ...withoutDeadline } = valid;
    expect(() =>
      FinancialGoalSchema.parse(withoutDeadline)
    ).not.toThrow();
  });
});
