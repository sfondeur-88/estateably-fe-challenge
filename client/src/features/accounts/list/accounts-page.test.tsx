import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, expect, test, vi } from 'vitest';

import type {
  Account,
  AccountListMeta,
  Collection,
  Minor,
} from '@/api/types.ts';

import { AccountsPage } from './accounts-page.tsx';

const account: Account = {
  id: 'acc_chequing',
  name: 'Everyday Chequing',
  type: 'checking',
  institution: 'Banque Nationale',
  currency: 'CAD',
  openingBalance: 0,
  creditLimit: null,
  color: '#2563eb',
  openedAt: '2025-01-01',
  archivedAt: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  balance: null,
};

function accountsResponse(
  available: Minor,
): Collection<Account, AccountListMeta> {
  return {
    data: [
      {
        ...account,
        balance: {
          accountId: account.id,
          currency: 'CAD',
          asOf: '2026-11-04',
          openingBalance: 0,
          posted: available,
          pending: 0,
          available,
          transactionCount: 0,
          pendingCount: 0,
          creditLimit: null,
          availableCredit: null,
        },
      },
    ],
    meta: { total: 1, asOf: '2026-11-04', totalsByCurrency: null },
  };
}

function renderAccountsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter([{ path: '/', Component: AccountsPage }]);
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { queryClient, router };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('keeps showing accounts when a background refetch fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(accountsResponse(0))))
      .mockRejectedValueOnce(new TypeError('Failed to fetch')),
  );
  const { queryClient } = renderAccountsPage();
  await screen.findByText('Everyday Chequing');

  await act(async () => {
    await queryClient.refetchQueries();
    // Query results reach components on a setTimeout(0) tick, after the refetch resolves.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(screen.getByText('Everyday Chequing')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('shows the balances for a new as-of date', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const available = url.includes('asOf=2026-03-15') ? 10000 : 50000;
      return Promise.resolve(
        new Response(JSON.stringify(accountsResponse(available))),
      );
    }),
  );
  const { router } = renderAccountsPage();
  await screen.findByText('$500.00');

  await act(() => router.navigate('/?asOf=2026-03-15'));

  expect(await screen.findByText('$100.00')).toBeInTheDocument();
  expect(screen.queryByText('$500.00')).not.toBeInTheDocument();
});
