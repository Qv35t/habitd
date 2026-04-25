import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { getCurrencySymbol } from '@/utils/finance';
import { calcSpendingHeatmap } from '@/engine/finEngine';
import type { Transaction } from '@/types';

const HEAT_CHARS = ['·', '░', '▒', '▓', '█'] as const;

interface SpendingHeatmapProps {
  transactions: Transaction[];
  year: number;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function SpendingHeatmap({ transactions, year }: SpendingHeatmapProps) {
  const { t } = useTranslation();
  const localeLayout = useUIStore((s) => s.localeLayout);
  const heatmapData = useMemo(
    () => calcSpendingHeatmap(transactions, year),
    [transactions, year],
  );

  const { grid, maxVal } = useMemo(() => {
    const weeks = 53;
    const months = 12;
    const grid: number[][] = Array.from({ length: weeks }, () => new Array(months).fill(0));

    Object.entries(heatmapData).forEach(([dateStr, amount]) => {
      const date = new Date(dateStr);
      const month = date.getMonth();
      const week = getWeekNumber(date) - 1;
      if (week >= 0 && week < weeks) {
        grid[week][month] = (grid[week][month] || 0) + amount;
      }
    });

    const allVals = grid.flat().filter((v) => v > 0);
    const maxVal = allVals.length > 0 ? Math.max(...allVals) : 1;
    return { grid, maxVal };
  }, [heatmapData]);

  function toChar(val: number): string {
    if (val === 0) return HEAT_CHARS[0];
    const idx = Math.ceil((val / maxVal) * 4);
    return HEAT_CHARS[Math.min(idx, 4)];
  }

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DISPLAY_WEEKS = 5;

  return (
    <section className="spending-heatmap">
      <h3 className="fin-section-title">– spending heatmap {year}</h3>
      <div className="heatmap-grid" aria-label={`Spending heatmap for ${year}`}>
        <div className="heatmap-header">
          <span className="heatmap-week-label" />
          {MONTH_LABELS.map((m) => (
            <span key={m} className="heatmap-month-label">{m}</span>
          ))}
        </div>
        {Array.from({ length: DISPLAY_WEEKS }, (_, weekIdx) => (
          <div key={weekIdx} className="heatmap-row">
            <span className="heatmap-week-label">W{weekIdx + 1}</span>
            {Array.from({ length: 12 }, (_, monthIdx) => {
              const val = grid[weekIdx]?.[monthIdx] ?? 0;
              const ch = toChar(val);
              return (
                <span
                  key={monthIdx}
                  className={`heatmap-cell heat-${HEAT_CHARS.indexOf(ch as typeof HEAT_CHARS[number])}`}
                  title={val > 0 ? `${MONTH_LABELS[monthIdx]}: ${val.toFixed(0)} ${getCurrencySymbol(localeLayout)}` : ''}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
        <div className="heatmap-legend">
          <span>{t('stats.less')}</span>
          {HEAT_CHARS.map((c) => <span key={c} className="heatmap-legend-char">{c}</span>)}
          <span>{t('stats.more')}</span>
        </div>
      </div>
    </section>
  );
}
