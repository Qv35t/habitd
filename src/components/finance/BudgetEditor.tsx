import { useTranslation } from 'react-i18next';
import { format, subMonths, parseISO } from 'date-fns';
import { BudgetEditorRow } from './BudgetEditorRow';
import { useBudgetsMap, copyBudgetsFromPrevMonth } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useFinCategories';

interface Props {
  month: string; // 'YYYY-MM'
}

export function BudgetEditor({ month }: Props) {
  const { t } = useTranslation();
  const budgetsMap = useBudgetsMap(month);
  // Only expense and both categories make sense for budget limits
  const categories = useCategories('expense');
  const prevMonthLabel = format(subMonths(parseISO(`${month}-01`), 1), 'MMM yyyy');

  const handleCopyPrev = async () => {
    const count = await copyBudgetsFromPrevMonth(month);
    // useLiveQuery reactively updates budgetsMap
    void count;
  };

  if (!budgetsMap || !categories) {
    return <div className="fin-loading">loading budgets...</div>;
  }

  return (
    <section className="budget-editor">
      <h3 className="fin-section-title">
        – {t('finance.budgets.title')}: {format(parseISO(`${month}-01`), 'MMM yyyy')}
      </h3>

      <div className="budget-editor-list">
        {categories.map((cat) => (
          <BudgetEditorRow
            key={cat.id}
            category={cat}
            budget={budgetsMap.get(cat.id)}
            month={month}
          />
        ))}
        {categories.length === 0 && (
          <p className="fin-empty">no expense categories found</p>
        )}
      </div>

      <div className="budget-editor-actions">
        <button
          className="budget-btn budget-btn--secondary"
          onClick={handleCopyPrev}
          title={`${t('finance.budgets.copyPrev')} (${prevMonthLabel})`}
        >
          [{t('finance.budgets.copyPrev')}]
        </button>
      </div>
    </section>
  );
}
