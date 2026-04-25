import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { formatCurrency } from '@/utils/finance';
import { calcYearSummary } from '@/engine/finEngine';
import type { Transaction } from '@/types';

interface YearSummaryCardsProps {
  transactions: Transaction[];
  year: number;
}

function SummaryRow({ label, value, cls = '' }: { label: string; value: string; cls?: string }) {
  return (
    <div className="year-summary-row">
      <span className="year-summary-label">{label}</span>
      <span className={`year-summary-value ${cls}`}>{value}</span>
    </div>
  );
}

export function YearSummaryCards({ transactions, year }: YearSummaryCardsProps) {
  const { t } = useTranslation();
  const localeLayout = useUIStore((s) => s.localeLayout);
  const summary = useMemo(() => calcYearSummary(transactions, year), [transactions, year]);
  const hasData = summary.monthsWithData > 0;

  function fmtSigned(n: number): string {
    const formatted = formatCurrency(Math.abs(n), localeLayout);
    return n >= 0 ? `+${formatted}` : `−${formatted}`;
  }

  return (
    <section className="year-summary">
      <h3 className="fin-section-title">– {t('finance.overview.ytd')} {year}</h3>
      {!hasData ? (
        <p className="fin-empty">{t('finance.common.noData', { year })}</p>
      ) : (
        <div className="year-summary-grid">
          <SummaryRow label={`${t('finance.overview.income')} (total)`} value={formatCurrency(summary.totalIncome, localeLayout)} cls="fin-income" />
          <SummaryRow label={`${t('finance.overview.expense')} (total)`} value={formatCurrency(summary.totalExpense, localeLayout)} cls="fin-expense" />
          <div className="year-summary-divider">{'─'.repeat(32)}</div>
          <SummaryRow
            label={t('finance.overview.balance')}
            value={fmtSigned(summary.netBalance)}
            cls={summary.netBalance >= 0 ? 'fin-ok' : 'fin-danger'}
          />
          <SummaryRow label={t('finance.overview.savingsRate')} value={`${summary.avgSavingsRate.toFixed(0)}%`} />
          {summary.bestMonth && (
            <SummaryRow
              label={t('finance.overview.bestMonth')}
              value={`${summary.bestMonth.label}  (+${formatCurrency(summary.bestMonth.balance, localeLayout)})  ★`}
              cls="fin-ok"
            />
          )}
          {summary.worstMonth && summary.worstMonth.month !== summary.bestMonth?.month && (
            <SummaryRow
              label={t('finance.overview.worstMonth')}
              value={`${summary.worstMonth.label}  (${fmtSigned(summary.worstMonth.balance)})`}
              cls={summary.worstMonth.balance < 0 ? 'fin-danger' : ''}
            />
          )}
          <SummaryRow label="months tracked" value={`${summary.monthsWithData} / 12`} />
        </div>
      )}
    </section>
  );
}
