import { useState } from 'react';
import { useTransactionsByYear } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useFinCategories';
import { SpendingHeatmap } from './SpendingHeatmap';
import { MonthlyTrendTable } from './MonthlyTrendTable';
import { CategoryTrendChart } from './CategoryTrendChart';
import { YearSummaryCards } from './YearSummaryCards';

const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR];

export function AnalyticsTab() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const transactions = useTransactionsByYear(year) ?? [];
  const categories = useCategories() ?? [];

  return (
    <div className="analytics-tab">
      <div className="year-selector">
        {AVAILABLE_YEARS.map((y) => (
          <button
            key={y}
            className={`year-btn ${y === year ? 'year-btn--active' : ''}`}
            onClick={() => setYear(y)}
          >
            [{y}]
          </button>
        ))}
      </div>

      <YearSummaryCards transactions={transactions} year={year} />
      <MonthlyTrendTable transactions={transactions} year={year} />
      <SpendingHeatmap transactions={transactions} year={year} />
      <CategoryTrendChart transactions={transactions} categories={categories} year={year} />
    </div>
  );
}
