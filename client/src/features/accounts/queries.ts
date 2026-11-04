import { queryOptions } from '@tanstack/react-query';

import { apiFetch } from '@/api/client.ts';
import type { Account, AccountListMeta, Collection } from '@/api/types.ts';

function fetchAccounts() {
  return apiFetch<Collection<Account, AccountListMeta>>('/accounts');
}

const accountKeys = {
  all: ['accounts'] as const,
  list: () => [...accountKeys.all, 'list'] as const,
};

export function accountsQueryOptions() {
  return queryOptions({
    queryKey: accountKeys.list(),
    queryFn: fetchAccounts,
  });
}
