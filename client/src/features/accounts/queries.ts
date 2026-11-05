import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { apiFetch } from '@/api/client.ts';
import type {
  Account,
  AccountListMeta,
  Collection,
  IsoDate,
  Single,
  Transaction,
} from '@/api/types.ts';

function fetchAccounts(asOf: IsoDate) {
  const params = new URLSearchParams({ asOf });
  return apiFetch<Collection<Account, AccountListMeta>>(`/accounts?${params}`);
}

function fetchAccount(accountId: string, asOf: IsoDate) {
  const params = new URLSearchParams({ asOf });
  return apiFetch<Single<Account>>(
    `/accounts/${encodeURIComponent(accountId)}?${params}`,
  );
}

const TRANSACTIONS_PAGE_SIZE = 100;

function fetchAccountTransactions(
  accountId: string,
  to: IsoDate,
  offset: number,
) {
  const params = new URLSearchParams({
    accountId,
    to,
    // The server computes running balances in date then id order, so ties sort the same way.
    sort: '-date,-id',
    withRunningBalance: 'true',
    include: 'category',
    offset: String(offset),
    limit: String(TRANSACTIONS_PAGE_SIZE),
  });
  return apiFetch<Collection<Transaction>>(`/transactions?${params}`);
}

const accountKeys = {
  all: ['accounts'] as const,
  list: (asOf: IsoDate) => [...accountKeys.all, 'list', { asOf }] as const,
  detail: (accountId: string, asOf: IsoDate) =>
    [...accountKeys.all, 'detail', accountId, { asOf }] as const,
};

const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: { accountId: string; to: IsoDate }) =>
    [...transactionKeys.all, 'list', filters] as const,
};

export function accountsQueryOptions(asOf: IsoDate) {
  return queryOptions({
    queryKey: accountKeys.list(asOf),
    queryFn: () => fetchAccounts(asOf),
  });
}

export function accountQueryOptions(accountId: string, asOf: IsoDate) {
  return queryOptions({
    queryKey: accountKeys.detail(accountId, asOf),
    queryFn: () => fetchAccount(accountId, asOf),
  });
}

export function accountTransactionsQueryOptions(
  accountId: string,
  to: IsoDate,
) {
  return infiniteQueryOptions({
    queryKey: transactionKeys.list({ accountId, to }),
    queryFn: ({ pageParam }) =>
      fetchAccountTransactions(accountId, to, pageParam),
    initialPageParam: 0,
    getNextPageParam: ({ meta }) =>
      meta.hasMore ? meta.offset + meta.count : undefined,
  });
}
