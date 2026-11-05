import type { CurrencyCode, Minor } from '@/api/types.ts';

type Notation = 'standard' | 'compact';

const formatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: CurrencyCode, notation: Notation) {
  const key = `${currency}:${notation}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      notation,
      ...(notation === 'compact' && { maximumFractionDigits: 1 }),
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

// Dividing by 100 holds because every CurrencyCode has 2 decimal places.
export function formatMoney(amount: Minor, currency: CurrencyCode): string {
  return getCurrencyFormatter(currency, 'standard').format(amount / 100);
}

/** `4215943` → `'$42.2K'`, for chart axes where space is tight. */
export function formatMoneyCompact(
  amount: Minor,
  currency: CurrencyCode,
): string {
  return getCurrencyFormatter(currency, 'compact').format(amount / 100);
}

const MONEY_INPUT = /^\$?(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?$/;

/**
 * Parses what a user typed into a dollar field. `'1,234.5'` → `123450`.
 * Integer maths on the digits, because `0.29 * 100` is `28.999…` in floating point.
 * Returns `null` for anything that isn't a plain non-negative amount.
 */
export function parseMoneyInput(text: string): Minor | null {
  const trimmed = text.trim().replace(/^\$\s*/, '$');
  if (!MONEY_INPUT.test(trimmed)) return null;
  const [whole = '0', fraction = ''] = trimmed.replace(/[$,]/g, '').split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
