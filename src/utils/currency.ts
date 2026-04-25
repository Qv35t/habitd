import { useUIStore, type LocaleLayout } from '@/stores/useUIStore';

export interface CurrencyConfig {
  symbol: string;
  name: string;
  subunit: string;
  subunitFactor: number;
  locale: string;
  decimalSep: string;
  amountPlaceholder: string;
}

export const CURRENCY_CONFIG: Record<LocaleLayout, CurrencyConfig> = {
  ru: {
    symbol: '₽',
    name: 'рубль',
    subunit: 'копейка',
    subunitFactor: 100,
    locale: 'ru-RU',
    decimalSep: ',',
    amountPlaceholder: '0,00',
  },
  en: {
    symbol: '$',
    name: 'dollar',
    subunit: 'cent',
    subunitFactor: 100,
    locale: 'en-US',
    decimalSep: '.',
    amountPlaceholder: '0.00',
  },
};

/**
 * Format an amount with the current locale's currency.
 */
export function formatAmount(amount: number, layout: LocaleLayout): string {
  const cfg = CURRENCY_CONFIG[layout];
  const formatted = new Intl.NumberFormat(cfg.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${cfg.symbol}`;
}

/**
 * Format an amount with +/- sign for transactions.
 */
export function formatAmountSigned(
  amount: number,
  type: 'income' | 'expense',
  layout: LocaleLayout,
): string {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formatAmount(amount, layout)}`;
}

/**
 * React hook for the current currency config.
 */
export function useCurrency(): CurrencyConfig {
  const layout = useUIStore((s) => s.localeLayout);
  return CURRENCY_CONFIG[layout];
}

/**
 * React hook returning a bound formatAmount function.
 */
export function useFormatAmount(): (amount: number) => string {
  const layout = useUIStore((s) => s.localeLayout);
  return (amount: number) => formatAmount(amount, layout);
}
