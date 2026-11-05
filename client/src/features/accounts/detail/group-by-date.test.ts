import { expect, test } from 'vitest';

import type { IsoDate, Transaction } from '@/api/types.ts';

import { groupByDate } from './group-by-date.ts';

function transaction(id: string, date: IsoDate) {
  return { id, date } as Transaction;
}

test('gives a date split across two pages a single heading', () => {
  const firstPage = [
    transaction('a', '2026-11-02'),
    transaction('b', '2026-10-31'),
  ];
  const secondPage = [
    transaction('c', '2026-10-31'),
    transaction('d', '2026-10-30'),
  ];

  const items = groupByDate([...firstPage, ...secondPage]);

  expect(items.map((item) => item.key)).toEqual([
    'date-2026-11-02',
    'a',
    'date-2026-10-31',
    'b',
    'c',
    'date-2026-10-30',
    'd',
  ]);
});
