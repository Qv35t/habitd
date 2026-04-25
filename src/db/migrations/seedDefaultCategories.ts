import { nanoid } from 'nanoid';
import type { Transaction } from 'dexie';
import type { FinCategory } from '@/types';

// Default categories — seeded on first upgrade to version 4.
// isDefault: true → user cannot delete.
// Sort order: income first (0–9), expenses (10–99).

const DEFAULT_CATEGORIES: Omit<FinCategory, 'id'>[] = [
  // ── Income ─────────────────────────────────────────────
  { name: 'Зарплата',    type: 'income',  symbol: '▸', color: 'bright', isDefault: true, sortOrder: 0  },
  { name: 'Фриланс',     type: 'income',  symbol: '◆', color: 'bright', isDefault: true, sortOrder: 1  },
  { name: 'Инвестиции',  type: 'income',  symbol: '◇', color: 'bright', isDefault: true, sortOrder: 2  },
  // ── Expense ────────────────────────────────────────────
  { name: 'Еда',         type: 'expense', symbol: '●', color: 'dim',    isDefault: true, sortOrder: 10 },
  { name: 'Транспорт',   type: 'expense', symbol: '◌', color: 'dim',    isDefault: true, sortOrder: 11 },
  { name: 'Жильё',       type: 'expense', symbol: '▪', color: 'dim',    isDefault: true, sortOrder: 12 },
  { name: 'Здоровье',    type: 'expense', symbol: '◇', color: 'dim',    isDefault: true, sortOrder: 13 },
  { name: 'Развлечения', type: 'expense', symbol: '⬡', color: 'dim',    isDefault: true, sortOrder: 14 },
  { name: 'Подписки',    type: 'expense', symbol: '▸', color: 'dim',    isDefault: true, sortOrder: 15 },
  { name: 'Образование', type: 'expense', symbol: '◆', color: 'dim',    isDefault: true, sortOrder: 16 },
  // ── Universal ──────────────────────────────────────────
  { name: 'Прочее',      type: 'both',    symbol: '·', color: 'dim',    isDefault: true, sortOrder: 99 },
];

export async function seedDefaultCategories(tx: Transaction): Promise<void> {
  const categories: FinCategory[] = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    id: nanoid(),
  }));
  await tx.table('finCategories').bulkAdd(categories);
}
