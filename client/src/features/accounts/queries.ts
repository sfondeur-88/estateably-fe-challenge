import { queryOptions } from '@tanstack/react-query';

import { apiFetch } from '@/api/client.ts';
import type {
  Account,
  AccountListMeta,
  Collection,
  IsoDate,
} from '@/api/types.ts';

function fetchAccounts(asOf: IsoDate) {
  const params = new URLSearchParams({ asOf });
  return apiFetch<Collection<Account, AccountListMeta>>(`/accounts?${params}`);
}

const accountKeys = {
  all: ['accounts'] as const,
  list: (asOf: IsoDate) => [...accountKeys.all, 'list', { asOf }] as const,
};

export function accountsQueryOptions(asOf: IsoDate) {
  return queryOptions({
    queryKey: accountKeys.list(asOf),
    queryFn: () => fetchAccounts(asOf),
  });
}
