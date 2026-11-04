import { Button } from '@/components/base/buttons/button';
import { DocumentTitle } from '@/components/common/document-title.tsx';

import { paths } from './paths.ts';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-12 text-center">
      <DocumentTitle title="Page not found" />
      <h1 className="text-display-xs font-semibold text-primary">
        Page not found
      </h1>
      <p className="mt-2 text-md text-tertiary">
        The page you are looking for does not exist.
      </p>
      <Button className="mt-6" href={paths.accounts}>
        Back to accounts
      </Button>
    </section>
  );
}
