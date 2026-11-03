import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

import { AppSidebar } from './app-sidebar.tsx';
import { RouteProvider } from './route-provider.tsx';

export function AppLayout() {
  const mainRef = useMainFocusOnNavigate();

  return (
    <RouteProvider>
      <div className="flex min-h-dvh flex-col bg-tertiary md:flex-row">
        <AppSidebar />
        <main
          ref={mainRef}
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-8 outline-none md:px-8"
        >
          <Outlet />
        </main>
      </div>
    </RouteProvider>
  );
}

/**
 * Client-side navigation leaves focus on the clicked link, or on <body> if the link is gone.
 * Moving it to <main> puts keyboard and screen reader users at the start of the new page.
 * Keyed on pathname only, so search param changes (filters, dates) keep focus where it is.
 */
function useMainFocusOnNavigate() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    mainRef.current?.focus();
  }, [pathname]);

  return mainRef;
}
