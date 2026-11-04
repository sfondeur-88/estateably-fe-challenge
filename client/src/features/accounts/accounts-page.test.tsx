import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, expect, test, vi } from 'vitest';

import type { Account, AccountListMeta, Collection } from '@/api/types.ts';

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

const accountsResponse: Collection<Account, AccountListMeta> = {
  data: [account],
  meta: { total: 1, asOf: '2026-11-04', totalsByCurrency: null },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

test('keeps showing accounts when a background refetch fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(accountsResponse)))
      .mockRejectedValueOnce(new TypeError('Failed to fetch')),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter([{ path: '/', Component: AccountsPage }]);
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByText('Everyday Chequing');

  await act(async () => {
    await queryClient.refetchQueries();
    // Query results reach components on a setTimeout(0) tick, after the refetch resolves.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(screen.getByText('Everyday Chequing')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
