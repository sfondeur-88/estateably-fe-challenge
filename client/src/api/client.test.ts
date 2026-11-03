import { afterEach, describe, expect, test, vi } from 'vitest';

import { apiFetch } from './client.ts';
import { ApiError } from './errors.ts';

function mockFetch(response: Response | Error) {
  const fn = vi.fn<typeof fetch>(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  // Bodies and paths are placeholders: apiFetch passes JSON through untouched,
  // so these tests cover transport and errors, not API types/shapes.
  test('returns the parsed body from /api', async () => {
    const fetchMock = mockFetch(jsonResponse({ anyBody: true }));

    await expect(apiFetch('/any-path')).resolves.toEqual({ anyBody: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/any-path', expect.anything());
  });

  test('throws the server error envelope as an ApiError', async () => {
    mockFetch(
      jsonResponse(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: [{ path: 'amount', message: 'must be an integer' }],
          },
        },
        422,
      ),
    );

    const error = await apiFetch('/any-path').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      details: [{ path: 'amount', message: 'must be an integer' }],
    });
  });

  test('throws UNEXPECTED_RESPONSE when the body is not JSON', async () => {
    mockFetch(new Response('Bad Gateway', { status: 502 }));

    await expect(apiFetch('/any-path')).rejects.toMatchObject({
      status: 502,
      code: 'UNEXPECTED_RESPONSE',
    });
  });

  test('throws NETWORK_ERROR when the request never completes', async () => {
    mockFetch(new TypeError('Failed to fetch'));

    await expect(apiFetch('/any-path')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });
});
