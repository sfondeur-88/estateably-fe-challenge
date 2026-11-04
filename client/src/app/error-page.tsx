import { isRouteErrorResponse, useRouteError } from 'react-router';

import { Button } from '@/components/base/buttons/button';
import { DocumentTitle } from '@/components/common/document-title.tsx';

import { paths } from './paths.ts';

/** Route error boundary. Renders inside the shell when a page fails, or on its own if the shell does. */
export function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'An unexpected error occurred.';

  return (
    <section className="mx-auto max-w-xl px-4 py-12 text-center">
      <DocumentTitle title="Something went wrong" />
      <h1 className="text-display-xs font-semibold text-primary">
        Something went wrong
      </h1>
      <p className="mt-2 text-md text-tertiary">{message}</p>
      <Button className="mt-6" href={paths.accounts}>
        Back to accounts
      </Button>
    </section>
  );
}
