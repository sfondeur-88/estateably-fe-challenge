import { parseDate } from '@internationalized/date';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { apiFetch } from '@/api/client.ts';
import type {
  BudgetProjection,
  CurrencyCode,
  IsoDate,
  ScheduledItem,
  Single,
  UpcomingResponse,
} from '@/api/types.ts';

export type NewScheduledItem = Pick<
  ScheduledItem,
  'kind' | 'name' | 'amount' | 'frequency' | 'startDate' | 'accountId'
>;

function fetchProjection(asOf: IsoDate, currency: CurrencyCode) {
  // Starting tomorrow makes startingBalance today's closing balance, so no month mixes actuals and forecast.
  const from = parseDate(asOf).add({ days: 1 }).toString();
  const params = new URLSearchParams({ from, asOf, currency });
  return apiFetch<BudgetProjection>(`/projections/budget?${params}`);
}

function fetchOccurrences(from: IsoDate) {
  const params = new URLSearchParams({ from });
  return apiFetch<UpcomingResponse>(`/scheduled-items/occurrences?${params}`);
}

function createScheduledItem(item: NewScheduledItem) {
  return apiFetch<Single<ScheduledItem>>('/scheduled-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export const forecastKeys = {
  all: ['forecast'] as const,
  projection: (asOf: IsoDate, currency: CurrencyCode) =>
    [...forecastKeys.all, 'projection', { asOf, currency }] as const,
  occurrences: (from: IsoDate) =>
    [...forecastKeys.all, 'occurrences', { from }] as const,
};

export function projectionQueryOptions(asOf: IsoDate, currency: CurrencyCode) {
  return queryOptions({
    queryKey: forecastKeys.projection(asOf, currency),
    queryFn: () => fetchProjection(asOf, currency),
  });
}

export function occurrencesQueryOptions(from: IsoDate) {
  return queryOptions({
    queryKey: forecastKeys.occurrences(from),
    queryFn: () => fetchOccurrences(from),
  });
}

export function createScheduledItemMutationOptions() {
  return mutationOptions({
    mutationFn: createScheduledItem,
    // Returned so the mutation stays pending until the forecast has refetched.
    onSuccess: (_created, _item, _onMutateResult, { client }) =>
      client.invalidateQueries({ queryKey: forecastKeys.all }),
  });
}
