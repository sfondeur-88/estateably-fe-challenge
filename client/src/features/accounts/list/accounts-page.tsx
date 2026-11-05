import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/base/buttons/button';
import { DocumentTitle } from '@/components/common/document-title.tsx';
import { PageHeader } from '@/components/common/page-header.tsx';
import { StatusCard } from '@/components/common/status-card.tsx';
import { groupAccounts } from '@/features/accounts/account-types.ts';
import { AsOfPicker } from '@/features/accounts/as-of/as-of-picker.tsx';
import { useAsOf } from '@/features/accounts/as-of/use-as-of.ts';
import { accountsQueryOptions } from '@/features/accounts/queries.ts';

import { AccountGroupCard } from './account-group-card.tsx';

export function AccountsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <DocumentTitle title="Accounts" />
      <PageHeader title="Accounts" actions={<AsOfPicker />} />
      <AccountGroups />
    </div>
  );
}

function AccountGroups() {
  const [asOf] = useAsOf();
  const {
    data: groups,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useQuery({
    ...accountsQueryOptions(asOf),
    placeholderData: keepPreviousData,
    select: (response) => groupAccounts(response.data),
  });

  if (error && !groups) {
    return (
      <StatusCard
        role="alert"
        message="We couldn't load your accounts."
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

  if (!groups) {
    return <StatusCard role="status" message="Loading accounts…" />;
  }

  if (groups.length === 0) {
    return <StatusCard message="You don't have any accounts yet." />;
  }

  return (
    <div
      aria-busy={isPlaceholderData}
      className="flex flex-col gap-8 transition-opacity aria-busy:opacity-60 aria-busy:delay-200"
    >
      {groups.map((group) => (
        <AccountGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
