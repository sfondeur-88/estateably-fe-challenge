import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { Button } from '@/components/base/buttons/button';
import { Card } from '@/components/common/card.tsx';
import { DocumentTitle } from '@/components/common/document-title.tsx';
import { PageHeader } from '@/components/common/page-header.tsx';

import { AccountGroupCard } from './account-group-card.tsx';
import { groupAccounts } from './account-types.ts';
import { accountsQueryOptions } from './queries.ts';

export function AccountsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <DocumentTitle title="Accounts" />
      <PageHeader title="Accounts" />
      <AccountGroups />
    </div>
  );
}

function AccountGroups() {
  const {
    data: groups,
    error,
    isFetching,
    refetch,
  } = useQuery({
    ...accountsQueryOptions(),
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

  return groups.map((group) => (
    <AccountGroupCard key={group.id} group={group} />
  ));
}

type StatusCardProps = {
  message: string;
  role?: 'status' | 'alert';
  action?: ReactNode;
};

function StatusCard({ message, role, action }: StatusCardProps) {
  return (
    <Card className="flex flex-col items-start gap-4 px-4 py-6 md:px-6">
      <p role={role} className="text-md text-tertiary">
        {message}
      </p>
      {action}
    </Card>
  );
}
