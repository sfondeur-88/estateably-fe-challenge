import { useQuery } from '@tanstack/react-query';

import { accountsQueryOptions } from '@/api/accounts.ts';
import type {
  Account,
  AccountListMeta,
  Collection,
  Occurrence,
  OccurrenceStatus,
} from '@/api/types.ts';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Card } from '@/components/common/card.tsx';
import { StatusCard } from '@/components/common/status-card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/common/table.tsx';
import { formatDate, todayIso } from '@/lib/dates.ts';
import { formatMoney } from '@/lib/money.ts';

import { occurrencesQueryOptions } from './queries.ts';
import { useForecastCurrency } from './use-forecast-currency.ts';

const statusBadges: Record<
  OccurrenceStatus,
  { label: string; color: 'gray' | 'success' | 'error' }
> = {
  scheduled: { label: 'Scheduled', color: 'gray' },
  posted: { label: 'Posted', color: 'success' },
  overdue: { label: 'Overdue', color: 'error' },
  skipped: { label: 'Skipped', color: 'gray' },
};

function selectAccountNames(response: Collection<Account, AccountListMeta>) {
  return new Map(response.data.map((account) => [account.id, account.name]));
}

export function UpcomingTable() {
  const today = todayIso();
  const [currency] = useForecastCurrency();
  const {
    data: upcoming,
    error,
    isFetching,
    refetch,
  } = useQuery(occurrencesQueryOptions(today));
  const { data: accountNames } = useQuery({
    ...accountsQueryOptions(today),
    select: selectAccountNames,
  });

  if (error && !upcoming) {
    return (
      <StatusCard
        role="alert"
        message="We couldn't load your upcoming bills and income."
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
  }

  if (!upcoming) {
    return (
      <StatusCard role="status" message="Loading upcoming bills and income…" />
    );
  }

  const headingId = 'upcoming-heading';
  const occurrences = upcoming.occurrences.filter(
    (occurrence) => occurrence.currency === currency,
  );

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 md:px-6">
        <h2 id={headingId} className="text-lg font-semibold text-primary">
          Upcoming
        </h2>
        <p className="text-sm text-tertiary">
          {currency} bills and income through {formatDate(upcoming.range.to)}
        </p>
      </div>
      {occurrences.length === 0 ? (
        <p className="px-4 pb-6 text-md text-tertiary md:px-6">
          Nothing scheduled yet.
        </p>
      ) : (
        <Table aria-labelledby={headingId}>
          <TableHead>
            <tr>
              <TableHeader scope="col" className="hidden @2xl:table-cell">
                Date
              </TableHeader>
              <TableHeader scope="col">Name</TableHeader>
              <TableHeader scope="col" className="hidden @2xl:table-cell">
                Account
              </TableHeader>
              <TableHeader scope="col" className="hidden @2xl:table-cell">
                Status
              </TableHeader>
              <TableHeader scope="col" className="text-right">
                Amount
              </TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {occurrences.map((occurrence) => (
              <UpcomingRow
                key={`${occurrence.scheduledItemId}-${occurrence.date}`}
                occurrence={occurrence}
                accountName={accountNames?.get(occurrence.accountId)}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

type UpcomingRowProps = {
  occurrence: Occurrence;
  accountName: string | undefined;
};

function UpcomingRow({ occurrence, accountName }: UpcomingRowProps) {
  const status = statusBadges[occurrence.status];
  const badge = (
    <Badge size="sm" color={status.color}>
      {status.label}
    </Badge>
  );

  return (
    <tr>
      <TableCell className="hidden @2xl:table-cell">
        {formatDate(occurrence.date)}
      </TableCell>
      <TableHeader
        scope="row"
        className="text-sm font-medium whitespace-normal text-primary"
      >
        {occurrence.name}
        <span className="block font-normal text-tertiary @2xl:hidden">
          {[formatDate(occurrence.date), accountName]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </TableHeader>
      <TableCell className="hidden @2xl:table-cell">{accountName}</TableCell>
      <TableCell className="hidden @2xl:table-cell">{badge}</TableCell>
      <TableCell className="text-right font-medium text-primary tabular-nums">
        {occurrence.kind === 'income' ? '+' : ''}
        {formatMoney(occurrence.amount, occurrence.currency)}
        <span className="mt-1 flex justify-end @2xl:hidden">{badge}</span>
      </TableCell>
    </tr>
  );
}
