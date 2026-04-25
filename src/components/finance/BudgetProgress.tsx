import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { calcBudgetStatus } from '@/engine/finEngine';
import { renderAsciiBar, formatCurrency } from '@/utils/finance';
import type { Transaction, Budget, FinCategory } from '@/types';

const BAR_WIDTH = 12;

interface BudgetProgressProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: FinCategory[];
  month: string;
}

export function BudgetProgress({ transactions, budgets, categories, month }: BudgetProgressProps) {
  const { t } = useTranslation();
  const localeLayout = useUIStore((s) => s.localeLayout);
  const statuses = useMemo(() => {
    return calcBudgetStatus(transactions, budgets, month);
  }, [transactions, budgets, month]);

  const catMap = useMemo(() => {
    const map = new Map<string, FinCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  if (budgets.length === 0) {
    return (
      <section className="budget-progress">
        <div className="section-label">
          – {t('finance.budgets.title')}{' '}
          <button className="budget-edit-link" onClick={() => useUIStore.getState().setFinanceTab("budgets")}>
            [{t('habits.edit')}]
          </button>
        </div>
        <div className="empty-state text-muted">
          {t('finance.budgets.noLimit')}
        </div>
      </section>
    );
  }

  return (
    <section className="budget-progress">
      <div className="section-label">
        – {t('finance.budgets.title')}{' '}
        <button className="budget-edit-link" onClick={() => useUIStore.getState().setFinanceTab("budgets")}>
          [{t('habits.edit')}]
        </button>
      </div>
      {statuses.map((s) => {
        const cat = catMap.get(s.categoryId);
        const symbol = cat?.symbol ?? '·';
        const name = cat?.name ?? 'Unknown';
        const bar = renderAsciiBar(s.spent, s.limit, BAR_WIDTH);

        const indicator = s.overBudget ? '✗' : s.warning ? '⚠' : '✓';
        const rowClass = s.overBudget
          ? 'budget-row overbudget'
          : s.warning
          ? 'budget-row warning'
          : 'budget-row ok';

        return (
          <div key={s.categoryId} className={rowClass}>
            <span className="cat-symbol">{symbol}</span>
            <span className="cat-name">{name.padEnd(14)}</span>
            <span className="budget-bar">[{bar}]</span>
            <span className="budget-amounts">
              {formatCurrency(s.spent, localeLayout).padStart(14)} / {formatCurrency(s.limit, localeLayout).padStart(14)}
            </span>
            <span className={`budget-indicator ${s.overBudget ? 'fin-danger' : s.warning ? 'fin-warn' : 'fin-ok'}`}>
              {indicator}
            </span>
          </div>
        );
      })}
    </section>
  );
}
