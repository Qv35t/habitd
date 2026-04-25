import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { calcTopCategories } from '@/engine/finEngine';
import { getMonthRange } from '@/utils/dateUtils';
import { renderAsciiBar, formatCurrency, formatMonthLabel } from '@/utils/finance';
import type { Transaction, FinCategory } from '@/types';

const BAR_WIDTH = 20;

interface TopCategoriesBarProps {
  transactions: Transaction[];
  categories: FinCategory[];
  month: string;
  topN?: number;
}

export function TopCategoriesBar({ transactions, categories, month, topN = 5 }: TopCategoriesBarProps) {
  const { t } = useTranslation();
  const localeLayout = useUIStore((s) => s.localeLayout);
  const [from, to] = getMonthRange(month);

  const top = useMemo(() => {
    const monthTxs = transactions.filter(
      (t) => t.type === 'expense' && t.date >= from && t.date <= to,
    );
    return calcTopCategories(monthTxs, 'expense', topN, from, to);
  }, [transactions, from, to, topN]);

  const catMap = useMemo(() => {
    const map = new Map<string, FinCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  if (top.length === 0) {
    return (
      <section className="top-categories">
        <div className="section-label">– {t('finance.analytics.topCategories')}</div>
        <div className="empty-state text-muted">no expense data this month</div>
      </section>
    );
  }

  const maxAmount = top[0]?.total ?? 1;

  return (
    <section className="top-categories">
      <div className="section-label">– {t('finance.analytics.topCategories')} ({formatMonthLabel(month)})</div>
      {top.map((cat) => {
        const meta = catMap.get(cat.categoryId);
        const symbol = meta?.symbol ?? '·';
        const name = meta?.name ?? 'Unknown';

        return (
          <div key={cat.categoryId} className="top-cat-row">
            <span className="cat-symbol">{symbol}</span>
            <span className="cat-name">{name.padEnd(14)}</span>
            <span className="cat-bar">[{renderAsciiBar(cat.total, maxAmount, BAR_WIDTH)}]</span>
            <span className="cat-amount">{formatCurrency(cat.total, localeLayout).padStart(14)}</span>
            <span className="cat-percent text-muted">({Math.round(cat.sharePercent)}%)</span>
          </div>
        );
      })}
    </section>
  );
}
