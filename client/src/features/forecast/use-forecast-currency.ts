import { useSearchParams } from 'react-router';
import { z } from 'zod';

import type { CurrencyCode } from '@/api/types.ts';

export const DEFAULT_CURRENCY: CurrencyCode = 'CAD';

const currencySchema = z.enum(['CAD', 'USD', 'EUR']).catch(DEFAULT_CURRENCY);

/** The forecast's currency, kept in the URL. There are no exchange rates, so the page shows one currency at a time. */
export function useForecastCurrency() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currency = currencySchema.parse(searchParams.get('currency'));

  function setCurrency(next: CurrencyCode) {
    setSearchParams(
      (params) => {
        if (next === DEFAULT_CURRENCY) {
          params.delete('currency');
        } else {
          params.set('currency', next);
        }
        return params;
      },
      { replace: true },
    );
  }

  return [currency, setCurrency] as const;
}
