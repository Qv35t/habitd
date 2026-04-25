import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

/** "YYYY-MM" → ["YYYY-MM-01", "YYYY-MM-DD"] */
export function getMonthRange(month: string): [string, string] {
  const ref = parseISO(`${month}-01`);
  return [
    format(startOfMonth(ref), 'yyyy-MM-dd'),
    format(endOfMonth(ref), 'yyyy-MM-dd'),
  ];
}

/** "YYYY-MM" → "Apr 2026" */
export function formatMonth(month: string): string {
  return format(parseISO(`${month}-01`), 'MMM yyyy');
}

/** Current month as "YYYY-MM" */
export function getCurrentMonthStr(): string {
  return format(new Date(), 'yyyy-MM');
}
