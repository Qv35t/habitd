import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { BalanceSummary } from './BalanceSummary';
import { BudgetProgress } from './BudgetProgress';
import { TopCategoriesBar } from './TopCategoriesBar';
import { SparklineRow } from './SparklineRow';
import type { Transaction, FinCategory, Budget } from '@/types';

export function MonthOverview() {
  const { t } = useTranslation();
  const todayStr = format(new Date(), 'yyyy-MM');
  const [month, setMonth] = useState<string>(todayStr);

  // Reactive queries
  const transactions = useLiveQuery<Transaction[]>(
    () => db.transactions.toArray(),
    [],
  ) ?? [];

  const categories = useLiveQuery<FinCategory[]>(
    () => db.finCategories.orderBy('sortOrder').toArray(),
    [],
  ) ?? [];

  const budgets = useLiveQuery<Budget[]>(
    () => db.budgets.where('month').equals(month).toArray(),
    [month],
  ) ?? [];

  function prevMonth() {
    setMonth(format(subMonths(parseISO(`${month}-01`), 1), 'yyyy-MM'));
  }

  function nextMonth() {
    const next = format(addMonths(parseISO(`${month}-01`), 1), 'yyyy-MM');
    if (next <= todayStr) setMonth(next);
  }

  function goToday() {
    setMonth(todayStr);
  }

  const isCurrentMonth = month === todayStr;
  const [year, m] = month.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = `${months[m - 1]} ${year}`;

  return (
    <div className="month-overview">
      {/* Month navigation */}
      <div className="month-nav">
        <button className="btn-flat" onClick={prevMonth}>[←]</button>
        <span className="month-nav-label">{monthLabel}</span>
        <button
          className="btn-flat"
          onClick={nextMonth}
          disabled={isCurrentMonth}
          aria-disabled={isCurrentMonth}
        >
          [→]
        </button>
        {!isCurrentMonth && (
          <button className="btn-flat btn-today" onClick={goToday}>[{t('calendar.today')}]</button>
        )}
      </div>

      {/* Sections */}
      <BalanceSummary transactions={transactions} month={month} />
      <div className="section-divider" />
      <BudgetProgress
        transactions={transactions}
        budgets={budgets}
        categories={categories}
        month={month}
      />
      <div className="section-divider" />
      <TopCategoriesBar
        transactions={transactions}
        categories={categories}
        month={month}
        topN={5}
      />
      <div className="section-divider" />
      <SparklineRow transactions={transactions} days={30} />
    </div>
  );
}
