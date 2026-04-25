import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { formatCurrency, formatNumber } from '@/utils/finance';
import { calcMonthlyTrend, calcYearSummary } from '@/engine/finEngine';
import type { Transaction } from '@/types';

interface MonthlyTrendTableProps {
  transactions: Transaction[];
  year: number;
}

export function MonthlyTrendTable({ transactions, year }: MonthlyTrendTableProps) {
  const { t } = useTranslation();
  const localeLayout = useUIStore((s) => s.localeLayout);
  const rows = useMemo(() => calcMonthlyTrend(transactions, year), [transactions, year]);
  const summary = useMemo(() => calcYearSummary(transactions, year), [transactions, year]);

  function fmtSigned(n: number): string {
    const formatted = formatNumber(Math.abs(n), localeLayout);
    return n >= 0 ? `+${formatted}` : `−${formatted}`;
  }

  return (
    <section className="monthly-trend">
      <h3 className="fin-section-title">– monthly trend {year}</h3>
      <div className="trend-table" role="table" aria-label="Monthly financial trend">
        <div className="trend-row trend-header" role="row">
          <span className="col-month">{t('finance.transactions.date')}</span>
          <span className="col-income">{t('finance.overview.income')}</span>
          <span className="col-expense">{t('finance.overview.expense')}</span>
          <span className="col-balance">{t('finance.overview.balance')}</span>
          <span className="col-savings">{t('finance.overview.savingsRate')}</span>
          <span className="col-tx">{t('finance.common.txCount')}</span>
        </div>
        <div className="trend-divider">{'─'.repeat(54)}</div>

        {rows.map((row) => {
          const isCurrentMonthMark = row.isCurrent ? ' ←' : '';
          const isBestMonthMark = summary.bestMonth?.month === row.month && row.txCount > 0 ? ' ★' : '';
          const isEmpty = row.txCount === 0;

          return (
            <div
              key={row.month}
              className={`trend-row ${row.isCurrent ? 'trend-row--current' : ''} ${isEmpty ? 'trend-row--empty' : ''}`}
              role="row"
            >
              <span className="col-month">{row.label}{isCurrentMonthMark}</span>
              <span className="col-income fin-income">{isEmpty ? '—' : formatNumber(row.income, localeLayout)}</span>
              <span className="col-expense fin-expense">{isEmpty ? '—' : formatNumber(row.expense, localeLayout)}</span>
              <span className={`col-balance ${row.balance >= 0 ? 'fin-ok' : 'fin-danger'}`}>
                {isEmpty ? '—' : fmtSigned(row.balance)}
              </span>
              <span className="col-savings">{isEmpty ? '—' : `${row.savingsRate.toFixed(0)}%${isBestMonthMark}`}</span>
              <span className="col-tx">{isEmpty ? '·' : row.txCount}</span>
            </div>
          );
        })}

        {summary.monthsWithData > 0 && (
          <>
            <div className="trend-divider">{'─'.repeat(54)}</div>
            <div className="trend-row trend-row--ytd" role="row">
              <span className="col-month">YTD</span>
              <span className="col-income fin-income">{formatNumber(summary.totalIncome, localeLayout)}</span>
              <span className="col-expense fin-expense">{formatNumber(summary.totalExpense, localeLayout)}</span>
              <span className={`col-balance ${summary.netBalance >= 0 ? 'fin-ok' : 'fin-danger'}`}>
                {fmtSigned(summary.netBalance)}
              </span>
              <span className="col-savings">{summary.avgSavingsRate.toFixed(0)}% avg</span>
              <span className="col-tx">—</span>
            </div>
          </>
        )}
      </div>

      {summary.bestMonth && summary.worstMonth && summary.bestMonth.month !== summary.worstMonth.month && (
        <div className="trend-callout">
          <span className="fin-ok">{t('finance.overview.bestMonth')}: {summary.bestMonth.label} (+{formatCurrency(summary.bestMonth.balance, localeLayout)})</span>
          {'  '}
          <span className="fin-danger">{t('finance.overview.worstMonth')}: {summary.worstMonth.label} ({fmtSigned(summary.worstMonth.balance)})</span>
        </div>
      )}
    </section>
  );
}
