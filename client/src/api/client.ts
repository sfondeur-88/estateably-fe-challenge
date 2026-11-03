import { ApiError, isApiErrorBody } from './errors.ts';

// Same origin: Vite proxies /api to the Express server.
const BASE_URL = '/api';

/**
 * Fetches JSON from the API and returns the body as-is. Records arrive wrapped
 * in `Single`/`Collection` and reports do not, so unwrapping is the caller's job.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch (cause) {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server', [], {
      cause,
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // The Vite proxy answers with plain text when the API is down.
    throw new ApiError(
      response.status,
      'UNEXPECTED_RESPONSE',
      `Expected JSON from ${path} (HTTP ${response.status})`,
    );
  }

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      const { code, message, details } = body.error;
      throw new ApiError(response.status, code, message, details);
    }
    throw new ApiError(
      response.status,
      'UNEXPECTED_RESPONSE',
      `Request to ${path} failed (HTTP ${response.status})`,
    );
  }

  return body as T;
}
