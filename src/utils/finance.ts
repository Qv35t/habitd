/**
 * Shared finance UI utilities.
 * Pure functions — no I/O, no React, no Dexie.
 */
import type { LocaleLayout } from '@/stores/useUIStore';

/**
 * Render an ASCII progress bar: '█' for filled, '░' for empty.
 */
export function renderAsciiBar(value: number, max: number, width: number): string {
  const filled = Math.round((Math.max(0, value) / Math.max(max, 1)) * width);
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
}

const CURRENCY_SYMBOLS: Record<LocaleLayout, string> = {
  en: '$',
  ru: '₽',
};

const CURRENCY_LOCALES: Record<LocaleLayout, string> = {
  en: 'en-US',
  ru: 'ru-RU',
};

/**
 * Format a number as currency: "12 400 ₽" (ru) or "12,400 $" (en).
 */
export function formatCurrency(amount: number, layout: LocaleLayout = 'en'): string {
  return amount.toLocaleString(CURRENCY_LOCALES[layout], { minimumFractionDigits: 0 }) + ' ' + CURRENCY_SYMBOLS[layout];
}

/**
 * Format a number without currency symbol (for tables where symbol is appended separately).
 */
export function formatNumber(amount: number, layout: LocaleLayout = 'en'): string {
  return amount.toLocaleString(CURRENCY_LOCALES[layout], { minimumFractionDigits: 0 });
}

/**
 * Get the currency symbol for a layout.
 */
export function getCurrencySymbol(layout: LocaleLayout): string {
  return CURRENCY_SYMBOLS[layout];
}

/**
 * Get the currency placeholder for input fields.
 */
export function getCurrencyPlaceholder(layout: LocaleLayout): string {
  return layout === 'ru' ? '0,00' : '0.00';
}

/**
 * "YYYY-MM" → "Apr 2026"
 */
export function formatMonthLabel(month: string): string {
  const [, m] = month.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${month.slice(0, 4)}`;
}
