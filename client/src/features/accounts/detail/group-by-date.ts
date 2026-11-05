import type { IsoDate, Transaction } from '@/api/types.ts';

export type TransactionListItem =
  | { kind: 'date'; key: string; date: IsoDate }
  | {
      kind: 'transaction';
      key: string;
      transaction: Transaction;
      isFirstOfDate: boolean;
      isLastOfDate: boolean;
    };

/** Interleaves one date heading before each run of same-day transactions. Expects date-sorted input. */
export function groupByDate(
  transactions: Transaction[],
): TransactionListItem[] {
  const items: TransactionListItem[] = [];

  transactions.forEach((transaction, index) => {
    const isFirstOfDate = transactions[index - 1]?.date !== transaction.date;
    if (isFirstOfDate) {
      items.push({
        kind: 'date',
        key: `date-${transaction.date}`,
        date: transaction.date,
      });
    }
    items.push({
      kind: 'transaction',
      key: transaction.id,
      transaction,
      isFirstOfDate,
      isLastOfDate: transactions[index + 1]?.date !== transaction.date,
    });
  });

  return items;
}
