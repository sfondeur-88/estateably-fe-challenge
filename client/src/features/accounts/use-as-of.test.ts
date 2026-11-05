import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { parseAsOf } from './use-as-of.ts';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-04T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('parseAsOf', () => {
  test('keeps a valid past date', () => {
    expect(parseAsOf('2026-03-15')).toBe('2026-03-15');
  });

  test.each([
    ['missing', null],
    ['malformed', 'yesterday'],
    ['impossible', '2026-02-30'],
    ['future', '2026-11-05'],
  ])('falls back to today for a %s date', (_, value) => {
    expect(parseAsOf(value)).toBe('2026-11-04');
  });
});
