import { useMemo } from 'react';
import { calcCategoryMonthlySparklines } from '@/engine/finEngine';
import type { Transaction, FinCategory } from '@/types';

const MONTH_LABELS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

interface CategoryTrendChartProps {
  transactions: Transaction[];
  categories: FinCategory[];
  year: number;
  topN?: number;
}

function fmtShort(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function CategoryTrendChart({
  transactions,
  categories,
  year,
  topN = 3,
}: CategoryTrendChartProps) {
  const sparklines = useMemo(
    () => calcCategoryMonthlySparklines(transactions, categories, year, topN),
    [transactions, categories, year, topN],
  );

  if (sparklines.length === 0) {
    return (
      <section className="category-trends">
        <h3 className="fin-section-title">– category trends {year}</h3>
        <p className="fin-empty">no expense data for {year}</p>
      </section>
    );
  }

  return (
    <section className="category-trends">
      <h3 className="fin-section-title">– category trends {year} (top {sparklines.length} by expense)</h3>
      <div className="cat-trend-table">
        <div className="cat-trend-header">
          <span className="cat-col-name" />
          <span className="cat-col-total" />
          <span className="cat-col-spark">{MONTH_LABELS_SHORT.join(' ')}</span>
        </div>
        {sparklines.map((row) => (
          <div key={row.categoryId} className="cat-trend-row">
            <span className="cat-col-name">{row.symbol} {row.categoryName.slice(0, 10).padEnd(10)}</span>
            <span className="cat-col-total fin-expense">{fmtShort(row.totalForYear)}</span>
            <span className="cat-col-spark">{[...row.sparkline].join(' ')}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
