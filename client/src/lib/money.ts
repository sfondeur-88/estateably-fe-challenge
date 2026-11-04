import type { CurrencyCode, Minor } from '@/api/types.ts';

const formatters = new Map<CurrencyCode, Intl.NumberFormat>();

function getCurrencyFormatter(currency: CurrencyCode) {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    });
    formatters.set(currency, formatter);
  }
  return formatter;
}

// Dividing by 100 holds because every CurrencyCode has 2 decimal places.
export function formatMoney(amount: Minor, currency: CurrencyCode): string {
  return getCurrencyFormatter(currency).format(amount / 100);
}
