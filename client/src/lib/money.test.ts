import { describe, expect, test } from 'vitest';

import { formatMoney, parseMoneyInput } from './money.ts';

describe('formatMoney', () => {
  test('converts minor units to a signed amount', () => {
    expect(formatMoney(-1234567, 'CAD')).toBe('-$12,345.67');
  });

  test("uses the account's currency symbol", () => {
    expect(formatMoney(4599, 'EUR')).toBe('€45.99');
  });
});

describe('parseMoneyInput', () => {
  test.each([
    ['45', 4500],
    ['0.29', 29],
    ['1,234.5', 123450],
    ['$ 2,150.00', 215000],
  ])('reads %s as %d cents', (text, cents) => {
    expect(parseMoneyInput(text)).toBe(cents);
  });

  test.each(['', 'abc', '12.345', '-5', '1,23.00', '1.2.3'])(
    'rejects %j',
    (text) => {
      expect(parseMoneyInput(text)).toBeNull();
    },
  );
});
