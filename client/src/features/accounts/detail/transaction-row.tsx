import {
  ArrowDownLeft,
  CreditCard02,
  Repeat04,
  SwitchHorizontal01,
} from '@untitledui/icons';
import { type FC, memo } from 'react';

import type { Transaction } from '@/api/types.ts';
import { Badge } from '@/components/base/badges/badges';
import { formatMoney } from '@/lib/money.ts';
import { cx } from '@/utils/cx';

type TransactionKind = {
  label: string;
  icon: FC<{ className?: string }>;
};

function transactionKind(transaction: Transaction): TransactionKind {
  if (transaction.transferId) {
    return { label: 'Transfer', icon: SwitchHorizontal01 };
  }
  if (transaction.scheduledItemId) {
    return { label: 'Recurring', icon: Repeat04 };
  }
  if (transaction.amount > 0) {
    return { label: 'Deposit', icon: ArrowDownLeft };
  }
  return { label: 'Purchase', icon: CreditCard02 };
}

type TransactionRowProps = {
  transaction: Transaction;
  isFirstOfDate: boolean;
  isLastOfDate: boolean;
};

export const TransactionRow = memo(function TransactionRow({
  transaction,
  isFirstOfDate,
  isLastOfDate,
}: TransactionRowProps) {
  const { label, icon: Icon } = transactionKind(transaction);
  const isPending = transaction.status === 'pending';

  return (
    <div
      className={cx(
        'flex h-full items-center gap-3 border-x border-t border-secondary bg-primary px-4 md:gap-4 md:px-6',
        isFirstOfDate && 'rounded-t-xl',
        isLastOfDate && 'rounded-b-xl border-b',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Icon aria-hidden="true" className="size-5 text-fg-quaternary" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-md font-medium text-primary">
          {transaction.description}
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-medium text-secondary">{label}</span>
          {transaction.category && (
            <Badge size="sm" className="min-w-0 truncate">
              {transaction.category.name}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <div className="flex items-center gap-2">
          {isPending && (
            <Badge size="sm" color="warning">
              Pending
            </Badge>
          )}
          <p className="text-md font-medium text-primary tabular-nums">
            {formatMoney(transaction.amount, transaction.currency)}
          </p>
        </div>
        {transaction.runningBalance != null && (
          <p className="text-xs text-tertiary tabular-nums">
            Balance{' '}
            {formatMoney(transaction.runningBalance, transaction.currency)}
          </p>
        )}
      </div>
    </div>
  );
});
