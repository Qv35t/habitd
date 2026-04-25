import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { getCurrencySymbol } from '@/utils/finance';
import { upsertBudget, clearBudgetForCategory } from '@/hooks/useBudgets';
import { BudgetSchema } from '@/schemas/finance';
import type { FinCategory, Budget } from '@/types';

interface Props {
  category: FinCategory;
  budget: Budget | undefined;
  month: string;
}

export function BudgetEditorRow({ category, budget, month }: Props) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(budget ? String(budget.limitAmount) : '');
  const [error, setError] = useState<string | null>(null);
  const localeLayout = useUIStore((s) => s.localeLayout);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = async () => {
    const num = parseFloat(value);
    const result = BudgetSchema.safeParse({ categoryId: category.id, month, limitAmount: num });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'invalid');
      return;
    }
    setError(null);
    await upsertBudget(category.id, month, num);
    setIsEditing(false);
  };

  const handleClear = async () => {
    await clearBudgetForCategory(category.id, month);
    setValue('');
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setIsEditing(false); setError(null); }
  };

  return (
    <div className="budget-editor-row">
      <span className="budget-editor-symbol">{category.symbol}</span>
      <span className="budget-editor-name">{category.name}</span>

      {budget || isEditing ? (
        <div className="budget-editor-control">
          <span className="budget-editor-label">{t('finance.budgets.limit')}:</span>
          <input
            ref={inputRef}
            className={`budget-editor-input ${error ? 'budget-editor-input--error' : ''}`}
            type="number"
            min={1}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
          />
          <span className="budget-editor-currency">{getCurrencySymbol(localeLayout)}</span>
          {error && <span className="fin-danger budget-editor-error">⚠ {error}</span>}
          <button className="budget-btn" onClick={handleSave}>[save]</button>
          <button className="budget-btn budget-btn--muted" onClick={handleClear}>
            [{t('finance.budgets.clearLimit')}]
          </button>
        </div>
      ) : (
        <div className="budget-editor-control budget-editor-control--empty">
          <span className="budget-editor-unset">— {t('finance.budgets.noLimit')} —</span>
          <button className="budget-btn" onClick={() => setIsEditing(true)}>
            [{t('finance.budgets.setLimit')}]
          </button>
        </div>
      )}
    </div>
  );
}
