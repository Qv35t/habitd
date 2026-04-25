import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { calcBalance } from '@/engine/finEngine';
import { getMonthRange } from '@/utils/dateUtils';
import { renderAsciiBar, formatCurrency, formatMonthLabel } from '@/utils/finance';
import type { Transaction } from '@/types';

const BAR_WIDTH = 20;

interface BalanceSummaryProps {
  transactions: Transaction[];
  month: string; // "YYYY-MM"
}

export function BalanceSummary({ transactions, month }: BalanceSummaryProps) {
  const { t } = useTranslation();
  const localeLayout = useUIStore((s) => s.localeLayout);
  const [from, to] = getMonthRange(month);

  const summary = useMemo(() => {
    return calcBalance(transactions, from, to);
  }, [transactions, from, to]);

  const txCount = useMemo(() => {
    return transactions.filter((t) => t.date >= from && t.date <= to).length;
  }, [transactions, from, to]);

  const maxVal = Math.max(summary.income, summary.expense, 1);
  const incomeBar = renderAsciiBar(summary.income, maxVal, BAR_WIDTH);
  const expenseBar = renderAsciiBar(summary.expense, maxVal, BAR_WIDTH);

  const balanceSign = summary.balance >= 0 ? '+' : '';
  const balanceClass = summary.balance >= 0 ? 'fin-ok' : 'fin-danger';

  return (
    <section className="balance-summary">
      <div className="section-label">– {formatMonthLabel(month)} {t('stats.summary')}</div>

      <div className="balance-row">
        <span className="bal-label">{t('finance.overview.income')}</span>
        <span className="bal-amount fin-income">{formatCurrency(summary.income, localeLayout)}</span>
        <span className="bal-bar">[{incomeBar}]</span>
      </div>

      <div className="balance-row">
        <span className="bal-label">{t('finance.overview.expense')}</span>
        <span className="bal-amount fin-expense">{formatCurrency(summary.expense, localeLayout)}</span>
        <span className="bal-bar">[{expenseBar}]</span>
      </div>

      <div className="balance-divider">{'─'.repeat(42)}</div>

      <div className="balance-row balance-total">
        <span className="bal-label">{t('finance.overview.balance')}</span>
        <span className={`bal-amount ${balanceClass}`}>
          {balanceSign}{formatCurrency(summary.balance, localeLayout)}
        </span>
        <span className="bal-savings fin-expense">{t('finance.overview.savings')}: {Math.round(summary.savingsRate)}%</span>
      </div>

      <div className="balance-meta">
        <span className="text-muted">{t('finance.transactions.title')}: {txCount}</span>
      </div>
    </section>
  );
}
