import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { expect, test } from 'vitest';

import { routes } from './router.tsx';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

test('redirects the root to the accounts page', async () => {
  const router = renderAt('/');

  expect(
    await screen.findByRole('heading', { name: 'Accounts' }),
  ).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/accounts');
});

test('marks Accounts as the current page on an account detail route', async () => {
  renderAt('/accounts/42');

  await screen.findByRole('heading', { name: 'Account' });
  const nav = screen.getByRole('navigation', { name: 'Main' });
  expect(within(nav).getByRole('link', { name: 'Accounts' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('renders the not found page inside the shell', async () => {
  renderAt('/nope');

  expect(
    await screen.findByRole('heading', { name: 'Page not found' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
});
