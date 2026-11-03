import type { PropsWithChildren } from 'react';
import { RouterProvider } from 'react-aria-components';
import { type NavigateOptions, useHref, useNavigate } from 'react-router';

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

/** Lets React Aria links (and UntitledUI components with `href`) navigate client-side. */
export function RouteProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  return (
    // Data routers return a promise from navigate; React Aria expects void, and the router handles its own errors.
    <RouterProvider
      navigate={(to, options) => void navigate(to, options)}
      useHref={useHref}
    >
      {children}
    </RouterProvider>
  );
}
