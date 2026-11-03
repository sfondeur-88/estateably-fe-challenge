import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { expect, test } from 'vitest';

import { routes } from './router.tsx';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
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
  expect(screen.getByRole('link', { name: 'Accounts' })).toHaveAttribute(
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
