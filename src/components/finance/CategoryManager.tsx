import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories, addCategory, deleteCategory } from '@/hooks/useFinCategories';
import { useCategoryTxCounts } from '@/hooks/useTransactions';
import { FinCategoryCreateSchema } from '@/schemas/finance';

const SYMBOL_OPTIONS = ['▸', '◆', '●', '◌', '▪', '◇', '⬡', '·', '◈', '▲', '◉', '◍'];
const TYPE_OPTIONS = ['income', 'expense', 'both'] as const;

export function CategoryManager() {
  const { t } = useTranslation();
  const categories = useCategories();
  const txCounts = useCategoryTxCounts();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense' | 'both'>('expense');
  const [newSymbol, setNewSymbol] = useState('◈');
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = async () => {
    const result = FinCategoryCreateSchema.safeParse({
      name: newName.trim(),
      type: newType,
      symbol: newSymbol,
      color: 'dim',
    });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'invalid');
      return;
    }
    await addCategory(result.data);
    setNewName('');
    setShowForm(false);
    setFormError(null);
  };

  const handleDelete = async (id: string) => {
    const count = txCounts?.get(id) ?? 0;
    if (count > 0) return;
    await deleteCategory(id);
  };

  if (!categories) return <div className="fin-loading">loading categories...</div>;

  return (
    <section className="category-manager">
      <h3 className="fin-section-title">– {t('finance.categories.title')}</h3>

      <div className="category-list">
        {categories.map((cat) => {
          const txCount = txCounts?.get(cat.id) ?? 0;
          const canDelete = !cat.isDefault && txCount === 0;

          return (
            <div key={cat.id} className="category-row">
              <span className="category-symbol">{cat.symbol}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-type fin-muted">{cat.type}</span>
              {cat.isDefault ? (
                <span className="category-badge">[{t('finance.categories.default')}]</span>
              ) : (
                <>
                  <span className="category-tx-count fin-muted">
                    tx: {txCount}
                  </span>
                  <button
                    className="budget-btn budget-btn--danger"
                    onClick={() => handleDelete(cat.id)}
                    disabled={!canDelete}
                    title={
                      txCount > 0
                        ? `Cannot delete: ${txCount} transaction(s) use this category`
                        : 'Delete category'
                    }
                  >
                    [{t('habits.delete')}]
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {showForm ? (
        <div className="category-form">
          <input
            className="fin-input"
            placeholder={t('finance.categories.add')}
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setFormError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
            autoFocus
            maxLength={40}
          />
          <div className="category-form-row">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                className={`budget-btn ${newType === type ? 'budget-btn--active' : ''}`}
                onClick={() => setNewType(type)}
              >
                [{type}]
              </button>
            ))}
          </div>
          <div className="category-form-row">
            {SYMBOL_OPTIONS.map((s) => (
              <button
                key={s}
                className={`budget-btn budget-btn--symbol ${newSymbol === s ? 'budget-btn--active' : ''}`}
                onClick={() => setNewSymbol(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {formError && <span className="fin-danger">⚠ {formError}</span>}
          <div className="category-form-actions">
            <button className="budget-btn" onClick={handleAdd}>[{t('finance.categories.add')}]</button>
            <button className="budget-btn budget-btn--muted" onClick={() => setShowForm(false)}>
              [{t('common.cancel')}]
            </button>
          </div>
        </div>
      ) : (
        <button className="budget-btn budget-btn--add" onClick={() => setShowForm(true)}>
          [+ {t('finance.categories.add')}]
        </button>
      )}
    </section>
  );
}
