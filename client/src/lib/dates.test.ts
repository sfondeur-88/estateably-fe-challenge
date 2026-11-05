import { afterEach, describe, expect, test, vi } from 'vitest';

import { formatDate, todayIso } from './dates.ts';

afterEach(() => {
  vi.useRealTimers();
});

describe('todayIso', () => {
  test('returns the local date in the evening, when UTC is already tomorrow', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-05T03:00:00Z'));

    expect(todayIso()).toBe('2026-11-04');
  });
});

describe('formatDate', () => {
  test('shows the calendar date, not the day before', () => {
    expect(formatDate('2026-11-04')).toBe('Nov 4, 2026');
  });
});
