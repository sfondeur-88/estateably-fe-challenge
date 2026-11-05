import { describe, expect, test } from 'vitest';

import { scheduledItemFormSchema } from './schema.ts';

const valid = {
  kind: 'bill',
  name: 'Gym',
  amount: '60',
  frequency: 'monthly',
  startDate: '2999-12-01',
  accountId: 'acc_chequing',
};

describe('scheduledItemFormSchema', () => {
  test('sends bills as negative amounts and income as positive', () => {
    expect(scheduledItemFormSchema.parse(valid).amount).toBe(-6000);
    expect(
      scheduledItemFormSchema.parse({ ...valid, kind: 'income' }).amount,
    ).toBe(6000);
  });

  test('rejects a due date before today', () => {
    const result = scheduledItemFormSchema.safeParse({
      ...valid,
      startDate: '2020-01-01',
    });
    expect(result.success).toBe(false);
  });

  test('rejects a zero amount', () => {
    const result = scheduledItemFormSchema.safeParse({ ...valid, amount: '0' });
    expect(result.success).toBe(false);
  });
});
