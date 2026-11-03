import { describe, expect, test } from 'vitest';

import { ApiError } from './errors.ts';
import { shouldRetry } from './query-client.ts';

describe('shouldRetry', () => {
  test.each([
    ['a network failure', new ApiError(0, 'NETWORK_ERROR', 'offline')],
    ['a 5xx', new ApiError(503, 'SIMULATED_ERROR', 'unavailable')],
  ])('retries %s', (_, error) => {
    expect(shouldRetry(0, error)).toBe(true);
  });

  test.each([
    ['a 4xx', new ApiError(404, 'NOT_FOUND', 'missing')],
    ['a simulated 4xx', new ApiError(422, 'SIMULATED_ERROR', 'invalid')],
    ['a non-API error', new TypeError('bug in a query function')],
  ])('does not retry %s', (_, error) => {
    expect(shouldRetry(0, error)).toBe(false);
  });

  test('stops after two retries', () => {
    const error = new ApiError(500, 'INTERNAL_ERROR', 'boom');

    expect(shouldRetry(1, error)).toBe(true);
    expect(shouldRetry(2, error)).toBe(false);
  });
});
