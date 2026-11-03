import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './errors.ts';

const MAX_RETRIES = 2;

/** Retry only failures that might succeed on a second try: network and 5xx. */
export function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!(error instanceof ApiError)) return false;
  return error.code === 'NETWORK_ERROR' || error.status >= 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      // Revisiting a screen within this window reuses the cached data.
      staleTime: 30_000,
    },
  },
});
