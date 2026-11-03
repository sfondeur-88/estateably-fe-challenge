import { Plus } from '@untitledui/icons';

import { Button } from '@/components/base/buttons/button';

// TODO:Shane - Temporary. Used as a design system smoke check until the app shell lands.
export default function App() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-display-xs font-semibold text-primary">
        Personal Finance Manager
      </h1>
      <p className="mb-6 text-md text-tertiary">
        UntitledUI + Tailwind v4 test.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button iconLeading={Plus}>Add transaction</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="tertiary">Tertiary</Button>
        <Button isLoading>Saving</Button>
        <Button isDisabled>Disabled</Button>
      </div>
    </main>
  );
}
