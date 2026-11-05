import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from '@untitledui/icons';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/errors.ts';
import type { Account, Balance } from '@/api/types.ts';
import { paths } from '@/app/paths.ts';
import { Button } from '@/components/base/buttons/button';
import { Card } from '@/components/common/card.tsx';
import { DocumentTitle } from '@/components/common/document-title.tsx';
import { PageHeader } from '@/components/common/page-header.tsx';
import { StatusCard } from '@/components/common/status-card.tsx';
import { accountTypeLabels } from '@/features/accounts/account-types.ts';
import { AsOfPicker } from '@/features/accounts/as-of/as-of-picker.tsx';
import { asOfSearch, useAsOf } from '@/features/accounts/as-of/use-as-of.ts';
import { accountQueryOptions } from '@/features/accounts/queries.ts';
import { formatMoney } from '@/lib/money.ts';

import { TransactionList } from './transaction-list.tsx';

export function AccountPage() {
  const { accountId } = useParams();
  if (!accountId) throw new Error('AccountPage needs an :accountId route');

  // Keyed so switching accounts starts a fresh list and scroll position.
  return <AccountDetail key={accountId} accountId={accountId} />;
}

function AccountDetail({ accountId }: { accountId: string }) {
  const [asOf] = useAsOf();
  const {
    data: account,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useQuery({
    ...accountQueryOptions(accountId, asOf),
    placeholderData: keepPreviousData,
    select: (response) => response.data,
  });

  const title = account?.name ?? 'Account';
  const isNotFound = error instanceof ApiError && error.status === 404;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <DocumentTitle title={title} />
      <div className="flex flex-col gap-3">
        <Link
          to={{ pathname: paths.accounts, search: asOfSearch(asOf) }}
          className="inline-flex w-max items-center gap-1.5 rounded-md text-sm font-semibold text-tertiary outline-focus-ring hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Accounts
        </Link>
        <PageHeader title={title} actions={<AsOfPicker />} />
      </div>
      {isNotFound ? (
        <StatusCard role="alert" message="We couldn't find this account." />
      ) : error && !account ? (
        <StatusCard
          role="alert"
          message="We couldn't load this account."
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
      ) : (
        <>
          {account?.balance ? (
            <BalanceSummary
              account={account}
              balance={account.balance}
              isBusy={isPlaceholderData}
            />
          ) : (
            <StatusCard role="status" message="Loading account…" />
          )}
          <TransactionList accountId={accountId} asOf={asOf} />
        </>
      )}
    </div>
  );
}

type BalanceSummaryProps = {
  account: Account;
  balance: Balance;
  isBusy: boolean;
};

function BalanceSummary({ account, balance, isBusy }: BalanceSummaryProps) {
  const details = [account.institution, accountTypeLabels[account.type]]
    .filter(Boolean)
    .join(' · ');
  const money = (amount: number) => formatMoney(amount, account.currency);

  return (
    <Card
      aria-busy={isBusy}
      className="flex flex-col gap-4 px-4 py-5 transition-opacity aria-busy:opacity-60 aria-busy:delay-200 md:px-6"
    >
      <div>
        <p className="text-sm text-tertiary">{details}</p>
        <p className="text-display-sm font-semibold text-primary tabular-nums">
          {money(balance.available)}{' '}
          <span className="text-md font-normal text-tertiary">
            {account.currency}
          </span>
        </p>
      </div>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <SummaryItem label="Posted" value={money(balance.posted)} />
        {balance.pendingCount > 0 && (
          <SummaryItem
            label={`Pending (${balance.pendingCount})`}
            value={money(balance.pending)}
          />
        )}
        {balance.availableCredit !== null && (
          <SummaryItem
            label="Available credit"
            value={money(balance.availableCredit)}
          />
        )}
      </dl>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-tertiary">{label}</dt>
      <dd className="font-medium text-primary tabular-nums">{value}</dd>
    </div>
  );
}
