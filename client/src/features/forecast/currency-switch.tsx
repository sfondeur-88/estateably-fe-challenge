import { useQuery } from '@tanstack/react-query';
import { useId } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';

import { accountsQueryOptions } from '@/api/accounts.ts';
import type {
  Account,
  AccountListMeta,
  Collection,
  CurrencyCode,
} from '@/api/types.ts';
import { todayIso } from '@/lib/dates.ts';

import {
  DEFAULT_CURRENCY,
  useForecastCurrency,
} from './use-forecast-currency.ts';

function selectCurrencies(response: Collection<Account, AccountListMeta>) {
  const currencies = new Set<CurrencyCode>(
    response.data
      .filter((account) => account.archivedAt === null)
      .map((account) => account.currency),
  );
  return [...currencies].sort((a, b) =>
    a === DEFAULT_CURRENCY
      ? -1
      : b === DEFAULT_CURRENCY
        ? 1
        : a.localeCompare(b),
  );
}

export function CurrencySwitch() {
  const labelId = useId();
  const [currency, setCurrency] = useForecastCurrency();
  const { data: currencies } = useQuery({
    ...accountsQueryOptions(todayIso()),
    select: selectCurrencies,
  });

  if (!currencies || currencies.length < 2) return null;

  return (
    <div className="flex items-center gap-3">
      <span id={labelId} className="text-sm text-tertiary">
        Currency
      </span>
      <ToggleButtonGroup
        aria-labelledby={labelId}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[currency]}
        onSelectionChange={(keys) => {
          const next = currencies.find((code) => keys.has(code));
          if (next) setCurrency(next);
        }}
        className="inline-flex gap-1 rounded-lg bg-primary p-1 shadow-xs ring-1 ring-primary ring-inset"
      >
        {currencies.map((code) => (
          <ToggleButton
            key={code}
            id={code}
            className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold text-tertiary outline-focus-ring transition-colors hover:bg-primary_hover hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 selected:cursor-default selected:bg-brand-50 selected:text-brand-700 selected:ring-1 selected:ring-brand-500 selected:ring-inset"
          >
            {code}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}
