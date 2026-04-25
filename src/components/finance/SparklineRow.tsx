import { useMemo } from 'react';
import { format } from 'date-fns';
import { useUIStore } from '@/stores/useUIStore';
import { getDailyAmounts, calcSparkline } from '@/engine/finEngine';
import { formatCurrency } from '@/utils/finance';
import type { Transaction } from '@/types';

interface SparklineRowProps {
  transactions: Transaction[];
  today?: string;
  days?: number;
}

export function SparklineRow({
  transactions,
  today = format(new Date(), 'yyyy-MM-dd'),
  days = 30,
}: SparklineRowProps) {
  const localeLayout = useUIStore((s) => s.localeLayout);
  const dailyAmounts = useMemo(
    () => getDailyAmounts(transactions, days, today, 'expense'),
    [transactions, days, today],
  );

  const sparkline = calcSparkline(dailyAmounts).chars;

  const total = dailyAmounts.reduce((s, v) => s + v, 0);
  const nonZero = dailyAmounts.filter((v) => v > 0);
  const avg = nonZero.length > 0 ? total / nonZero.length : 0;
  const max = Math.max(...dailyAmounts, 0);

  return (
    <section className="sparkline-row">
      <div className="section-label">– daily spending ({days}d)</div>
      <div className="sparkline-chars">{sparkline}</div>
      <div className="sparkline-meta text-muted">
        avg: {formatCurrency(Math.round(avg), localeLayout)}/day
        {'  '}max: {formatCurrency(max, localeLayout)}
        {'  '}total: {formatCurrency(total, localeLayout)}
      </div>
    </section>
  );
}
