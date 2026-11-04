import { describe, expect, test } from 'vitest';

import { formatMoney } from './money.ts';

describe('formatMoney', () => {
  test('converts minor units to a signed amount', () => {
    expect(formatMoney(-1234567, 'CAD')).toBe('-$12,345.67');
  });

  test("uses the account's currency symbol", () => {
    expect(formatMoney(4599, 'EUR')).toBe('€45.99');
  });
});
