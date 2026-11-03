/** URLs for links and redirects, so a route change is one edit. */
export const paths = {
  accounts: '/accounts',
  account: (accountId: string) => `/accounts/${encodeURIComponent(accountId)}`,
};
