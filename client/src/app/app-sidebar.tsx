import { LineChartUp02, PiggyBank01, Wallet02 } from '@untitledui/icons';
import type { FC } from 'react';
import { Link } from 'react-aria-components';
import { useMatch } from 'react-router';

import { NavItemBase } from '@/components/application/app-navigation/base-components/nav-item';

import { paths } from './paths.ts';

interface NavItem {
  label: string;
  href: string;
  icon: FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Accounts', href: paths.accounts, icon: Wallet02 },
  { label: 'Forecast', href: paths.forecast, icon: LineChartUp02 },
];

/**
 * Sidebar on desktop, a top bar on small screens.
 * `dark-mode` scopes UntitledUI's dark tokens to the sidebar, which our neutral scale turns dark green.
 * The selected icon is brand green so the current page stands out beyond the faint background change.
 */
export function AppSidebar() {
  return (
    <aside className="dark-mode flex items-center gap-6 bg-primary px-4 py-3 shadow-topbar [--color-fg-quaternary_hover:var(--color-brand-300)] md:sticky md:top-0 md:h-dvh md:w-64 md:shrink-0 md:flex-col md:items-stretch md:px-4 md:py-6 md:shadow-sidebar">
      <BrandLink />
      <nav aria-label="Main" className="max-md:ml-auto">
        <ul className="flex gap-2 md:flex-col">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink {...item} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

/** Logo mark and two-tone wordmark, linking home. Both colours pass AA on the sidebar. */
function BrandLink() {
  return (
    <Link
      href={paths.accounts}
      className="flex items-center gap-2.5 rounded-md outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2 md:px-2"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500">
        <PiggyBank01 aria-hidden="true" className="size-5 text-white" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-primary max-sm:sr-only">
        Simple<span className="text-brand-300">wealth</span>
      </span>
    </Link>
  );
}

/** Active NavItem styling when the path matches. */
function SidebarLink({ label, href, icon }: NavItem) {
  const current = useMatch({ path: href, end: false }) !== null;

  return (
    <NavItemBase type="link" href={href} icon={icon} current={current}>
      {label}
    </NavItemBase>
  );
}
