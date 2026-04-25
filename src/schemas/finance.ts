import { z } from 'zod';

// ── Regex helpers ──────────────────────────────────────────────────────────────
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_MONTH = /^\d{4}-\d{2}$/;

// ── TransactionCreateSchema ────────────────────────────────────────────────────
// Used when adding a new transaction.
// id and createdAt are generated automatically — not part of user input.
export const TransactionCreateSchema = z.object({
  date:       z.string().regex(ISO_DATE,   'Формат даты: YYYY-MM-DD'),
  amount:     z.number().positive(         'Сумма должна быть > 0'),
  type:       z.enum(['income', 'expense']),
  categoryId: z.string().min(1,            'Категория обязательна'),
  note:       z.string().max(200,          'Заметка не более 200 символов').optional(),
  tags:       z.array(z.string().min(1)).max(10).optional(),
});

export const TransactionUpdateSchema = TransactionCreateSchema.partial();

export type TransactionCreateInput = z.infer<typeof TransactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>;

// ── FinCategoryCreateSchema ────────────────────────────────────────────────────
export const FinCategoryCreateSchema = z.object({
  name:      z.string().min(1, 'Название обязательно').max(50),
  type:      z.enum(['income', 'expense', 'both']),
  symbol:    z.string().length(1, 'Символ — ровно один символ'),
  color:     z.enum(['dim', 'bright', 'accent']),
  sortOrder: z.number().int().min(0).default(50),
});

export type FinCategoryCreateInput = z.infer<typeof FinCategoryCreateSchema>;

// ── BudgetSchema ───────────────────────────────────────────────────────────────
export const BudgetSchema = z.object({
  categoryId:  z.string().min(1,             'Категория обязательна'),
  month:       z.string().regex(YEAR_MONTH,  'Формат месяца: YYYY-MM'),
  limitAmount: z.number().positive(          'Лимит должен быть > 0'),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;

// ── FinancialGoalSchema ────────────────────────────────────────────────────────
export const FinancialGoalSchema = z.object({
  name:          z.string().min(1, 'Название цели обязательно').max(100),
  targetAmount:  z.number().positive(       'Целевая сумма должна быть > 0'),
  currentAmount: z.number().min(0,          'Накоплено не может быть отрицательным'),
  deadline:      z.string().regex(ISO_DATE, 'Формат даты: YYYY-MM-DD').optional(),
  categoryTag:   z.string().optional(),
}).refine(
  (data) => data.currentAmount <= data.targetAmount,
  {
    message: 'Накоплено не может превышать целевую сумму',
    path: ['currentAmount'],
  }
);

export const FinancialGoalUpdateSchema = z.object({
  name:          z.string().min(1, 'Название цели обязательно').max(100).optional(),
  targetAmount:  z.number().positive('Целевая сумма должна быть > 0').optional(),
  currentAmount: z.number().min(0, 'Накоплено не может быть отрицательным').optional(),
  deadline:      z.string().regex(ISO_DATE, 'Формат даты: YYYY-MM-DD').optional(),
  categoryTag:   z.string().optional(),
}).refine(
  (data) => {
    if (data.currentAmount !== undefined && data.targetAmount !== undefined) {
      return data.currentAmount <= data.targetAmount;
    }
    return true;
  },
  {
    message: 'Накоплено не может превышать целевую сумму',
    path: ['currentAmount'],
  }
);

export type FinancialGoalInput       = z.infer<typeof FinancialGoalSchema>;
export type FinancialGoalUpdateInput = z.infer<typeof FinancialGoalUpdateSchema>;

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE F8 — Finance Backup Schemas
// ═══════════════════════════════════════════════════════════════════════════

/** Validates a single FinCategory record inside a finance backup file. */
export const FinanceCategoryBackupSchema = z.object({
  id:        z.string().min(1),
  name:      z.string().min(1).max(80),
  type:      z.enum(['income', 'expense', 'both']),
  symbol:    z.string().min(1).max(2),
  color:     z.enum(['dim', 'bright', 'accent']),
  isDefault: z.boolean(),
  sortOrder: z.number().int(),
})

/** Validates a single Transaction record inside a finance backup file. */
export const FinanceTransactionBackupSchema = z.object({
  id:         z.string().min(1),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  amount:     z.number().positive('amount must be > 0'),
  type:       z.enum(['income', 'expense']),
  categoryId: z.string().min(1),
  note:       z.string().max(200).optional(),
  tags:       z.array(z.string()).optional(),
  createdAt:  z.string().min(1),
})

/** Validates a single Budget record inside a finance backup file. */
export const FinanceBudgetBackupSchema = z.object({
  id:          z.string().min(1),
  categoryId:  z.string().min(1),
  month:       z.string().regex(/^\d{4}-\d{2}$/, 'must be YYYY-MM'),
  limitAmount: z.number().positive('limitAmount must be > 0'),
})

/** Validates a single FinancialGoal record inside a finance backup file. */
export const FinanceGoalBackupSchema = z.object({
  id:            z.string().min(1),
  name:          z.string().min(1).max(120),
  targetAmount:  z.number().positive(),
  currentAmount: z.number().min(0),
  deadline:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  categoryTag:   z.string().optional(),
  status:        z.enum(['active', 'completed', 'cancelled']),
  createdAt:     z.string().min(1),
})

/** Validates the entire finance backup JSON file. */
export const FinanceBackupSchema = z.object({
  version:        z.literal(1),
  exportedAt:     z.string().min(1),
  transactions:   z.array(FinanceTransactionBackupSchema),
  finCategories:  z.array(FinanceCategoryBackupSchema),
  budgets:        z.array(FinanceBudgetBackupSchema),
  financialGoals: z.array(FinanceGoalBackupSchema),
})
