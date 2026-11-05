import { createBrowserRouter, redirect, type RouteObject } from 'react-router';

import { AccountPage } from '@/features/accounts/detail/account-page.tsx';
import { AccountsPage } from '@/features/accounts/list/accounts-page.tsx';

import { AppLayout } from './app-layout.tsx';
import { ErrorPage } from './error-page.tsx';
import { NotFoundPage } from './not-found-page.tsx';
import { paths } from './paths.ts';

// Exported on its own so tests can mount the same tree in a memory router.
export const routes: RouteObject[] = [
  {
    Component: AppLayout,
    // Fallback for when the shell itself fails.
    ErrorBoundary: ErrorPage,
    children: [
      {
        // Pathless, so page errors render inside the shell and the nav stays usable.
        ErrorBoundary: ErrorPage,
        children: [
          { index: true, loader: () => redirect(paths.accounts) },
          { path: 'accounts', Component: AccountsPage },
          { path: 'accounts/:accountId', Component: AccountPage },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
