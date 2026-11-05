import {
  type InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useState } from 'react';

import type { Collection, IsoDate, Transaction } from '@/api/types.ts';
import { Button } from '@/components/base/buttons/button';
import { StatusCard } from '@/components/common/status-card.tsx';
import { accountTransactionsQueryOptions } from '@/features/accounts/queries.ts';
import { formatDate } from '@/lib/dates.ts';

import { groupByDate, type TransactionListItem } from './group-by-date.ts';
import { TransactionRow } from './transaction-row.tsx';

// Fixed per item type (h-14 and h-18 below), so rows never jump after measuring.
const DATE_HEIGHT = 56;
const ROW_HEIGHT = 72;
const PREFETCH_ROWS = 25;

// Module-level so the grouping only re-runs when a page arrives, not on every scroll render.
function selectItems(data: InfiniteData<Collection<Transaction>>) {
  return {
    items: groupByDate(data.pages.flatMap((page) => page.data)),
    total: data.pages[0]?.meta.total ?? 0,
  };
}

type TransactionListProps = {
  accountId: string;
  asOf: IsoDate;
};

export function TransactionList({ accountId, asOf }: TransactionListProps) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isPlaceholderData,
    refetch,
  } = useInfiniteQuery({
    ...accountTransactionsQueryOptions(accountId, asOf),
    placeholderData: keepPreviousData,
    select: selectItems,
  });

  const headingId = 'transactions-heading';

  let content;
  if (error && !data) {
    content = (
      <StatusCard
        role="alert"
        message="We couldn't load the transactions."
        action={
          <Button
            size="sm"
            color="secondary"
            isLoading={isFetching}
            onPress={() => void refetch()}
          >
            Try again
          </Button>
        }
      />
    );
  } else if (!data) {
    content = <StatusCard role="status" message="Loading transactions…" />;
  } else if (data.total === 0) {
    content = (
      <StatusCard
        message={`No transactions up to ${formatDate(asOf, 'long')}.`}
      />
    );
  } else {
    content = (
      <>
        <VirtualTransactions
          items={data.items}
          headingId={headingId}
          isBusy={isPlaceholderData}
          canLoadMore={
            hasNextPage && !isFetchingNextPage && !isFetchNextPageError
          }
          onLoadMore={() => void fetchNextPage()}
        />
        {isFetchingNextPage && (
          <p role="status" className="py-4 text-center text-sm text-tertiary">
            Loading more transactions…
          </p>
        )}
        {isFetchNextPageError && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p role="alert" className="text-sm text-tertiary">
              We couldn't load more transactions.
            </p>
            <Button
              size="sm"
              color="secondary"
              onPress={() => void fetchNextPage()}
            >
              Try again
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-lg font-semibold text-primary">
          Transactions
        </h2>
        {data && data.total > 0 && (
          <p className="text-sm text-tertiary tabular-nums">
            {data.total.toLocaleString('en-CA')} transactions
          </p>
        )}
      </div>
      {content}
    </section>
  );
}

type VirtualTransactionsProps = {
  items: TransactionListItem[];
  headingId: string;
  isBusy: boolean;
  canLoadMore: boolean;
  onLoadMore: () => void;
};

function VirtualTransactions({
  items,
  headingId,
  isBusy,
  canLoadMore,
  onLoadMore,
}: VirtualTransactionsProps) {
  // State rather than a ref so offsetTop can be read during render.
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: (index) =>
      items[index]?.kind === 'date' ? DATE_HEIGHT : ROW_HEIGHT,
    getItemKey: (index) => items[index]?.key ?? index,
    overscan: 10,
    scrollMargin: listElement?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems.at(-1)?.index ?? 0;

  useEffect(() => {
    if (canLoadMore && lastIndex >= items.length - PREFETCH_ROWS) {
      onLoadMore();
    }
  }, [canLoadMore, lastIndex, items.length, onLoadMore]);

  return (
    <div
      ref={setListElement}
      role="list"
      aria-labelledby={headingId}
      aria-busy={isBusy}
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualItems.map((virtualItem) => {
        const item = items[virtualItem.index];
        if (!item) return null;
        return (
          <div
            key={virtualItem.key}
            role="listitem"
            className="absolute top-0 left-0 w-full"
            style={{
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            {item.kind === 'date' ? (
              <h3 className="flex h-14 items-end pb-2 text-sm font-semibold text-tertiary">
                {formatDate(item.date, 'long')}
              </h3>
            ) : (
              <TransactionRow
                transaction={item.transaction}
                isFirstOfDate={item.isFirstOfDate}
                isLastOfDate={item.isLastOfDate}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
