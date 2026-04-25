import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { z } from 'zod';

const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['income', 'expense', 'both']),
  symbol: z.string().length(1),
  color: z.enum(['dim', 'bright', 'accent']).default('dim'),
  sortOrder: z.number().int().default(100),
});

type CategoryInput = z.infer<typeof CategoryCreateSchema>;

// ─── Queries ────────────────────────────────────────────────────────────────

/**
 * Reactive hook: all categories, optionally filtered by type, sorted by sortOrder ASC.
 */
export function useCategories(type?: 'income' | 'expense' | 'both') {
  return useLiveQuery(
    () => {
      const query = db.finCategories.orderBy('sortOrder');
      if (type) {
        return query.filter((c) => c.type === type || c.type === 'both').toArray();
      }
      return query.toArray();
    },
    [type],
  );
}

/**
 * Reactive hook: a single category by id.
 */
export function useCategoryById(id: string) {
  return useLiveQuery(() => db.finCategories.get(id), [id]);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Add a user-created category. isDefault is always false.
 */
export async function addCategory(input: CategoryInput): Promise<string> {
  const validated = CategoryCreateSchema.parse(input);
  const id = nanoid();

  await db.finCategories.add({
    id,
    ...validated,
    isDefault: false,
  });

  return id;
}

/**
 * Delete a category.
 * Guards: cannot delete default categories or categories with transactions.
 */
export async function deleteCategory(
  id: string,
): Promise<{ success: boolean; reason?: string }> {
  const category = await db.finCategories.get(id);

  if (!category) {
    return { success: false, reason: 'Category not found' };
  }

  if (category.isDefault) {
    return { success: false, reason: 'Cannot delete default category' };
  }

  const txCount = await db.transactions
    .where('categoryId')
    .equals(id)
    .count();

  if (txCount > 0) {
    return {
      success: false,
      reason: `Cannot delete: ${txCount} transaction(s) use this category`,
    };
  }

  await db.finCategories.delete(id);
  return { success: true };
}
