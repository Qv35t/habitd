import { format, addMonths, subMonths, parseISO } from 'date-fns';

interface MonthNavProps {
  month: string;
  onChange: (month: string) => void;
}

export function MonthNav({ month, onChange }: MonthNavProps) {
  const ref = parseISO(`${month}-01`);
  const label = format(ref, 'MMM yyyy');
  const prev = format(subMonths(ref, 1), 'yyyy-MM');
  const next = format(addMonths(ref, 1), 'yyyy-MM');
  const isCurrentMonth = month === format(new Date(), 'yyyy-MM');

  return (
    <div className="month-nav">
      <button
        className="btn-ghost"
        onClick={() => onChange(prev)}
        aria-label="Previous month"
      >
        [←]
      </button>

      <span className="month-nav__label">
        {label}
        {isCurrentMonth && <span className="month-nav__current"> ·</span>}
      </span>

      <button
        className="btn-ghost"
        onClick={() => onChange(next)}
        aria-label="Next month"
        disabled={isCurrentMonth}
      >
        [→]
      </button>
    </div>
  );
}
