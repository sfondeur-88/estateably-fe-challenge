import type { Account, AccountType } from '@/api/types.ts';

export const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Chequing',
  savings: 'Savings',
  cash: 'Cash',
  credit_card: 'Credit card',
  investment: 'Investment',
};

const groupOrder = ['spend-and-save', 'credit', 'investing'] as const;
type AccountGroupId = (typeof groupOrder)[number];

const groupLabels: Record<AccountGroupId, string> = {
  'spend-and-save': 'Spend and save',
  credit: 'Credit',
  investing: 'Investing',
};

const groupByType: Record<AccountType, AccountGroupId> = {
  checking: 'spend-and-save',
  savings: 'spend-and-save',
  cash: 'spend-and-save',
  credit_card: 'credit',
  investment: 'investing',
};

export type AccountGroup = {
  id: AccountGroupId;
  label: string;
  accounts: Account[];
};

export function groupAccounts(accounts: Account[]): AccountGroup[] {
  return groupOrder
    .map((id) => ({
      id,
      label: groupLabels[id],
      accounts: accounts.filter((account) => groupByType[account.type] === id),
    }))
    .filter((group) => group.accounts.length > 0);
}
