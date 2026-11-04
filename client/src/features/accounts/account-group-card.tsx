import { Link } from 'react-router';

import type { Account } from '@/api/types.ts';
import { paths } from '@/app/paths.ts';
import { Card } from '@/components/common/card.tsx';
import { formatMoney } from '@/lib/money.ts';

import { type AccountGroup, accountTypeLabels } from './account-types.ts';

export function AccountGroupCard({ group }: { group: AccountGroup }) {
  const headingId = `account-group-${group.id}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-lg font-semibold text-primary">
        {group.label}
      </h2>
      <Card>
        <ul className="divide-y divide-secondary">
          {group.accounts.map((account) => (
            <li key={account.id} className="group">
              <AccountRow account={account} />
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function AccountRow({ account }: { account: Account }) {
  const details = [account.institution, accountTypeLabels[account.type]]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      to={paths.account(account.id)}
      className="flex items-center justify-between gap-4 px-4 py-3 outline-focus-ring transition duration-100 ease-linear group-first:rounded-t-xl group-last:rounded-b-xl hover:bg-primary_hover focus-visible:outline-2 focus-visible:-outline-offset-2 md:px-6 md:py-4"
    >
      <div className="min-w-0">
        <p className="truncate text-md font-medium text-primary">
          {account.name}
        </p>
        <p className="truncate text-sm text-tertiary">{details}</p>
      </div>
      {account.balance && (
        <p className="shrink-0 text-md font-medium text-primary tabular-nums">
          {formatMoney(account.balance.available, account.currency)}{' '}
          <span className="text-sm font-normal text-tertiary">
            {account.currency}
          </span>
        </p>
      )}
    </Link>
  );
}
