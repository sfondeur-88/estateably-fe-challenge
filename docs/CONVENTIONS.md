# Conventions

The standards this client follows. Rationale lives in [DECISIONS.md](./DECISIONS.md).

## Commands

Run from `client/`:

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server, proxies `/api` to the backend |
| `npm run build` | Type-checks, then builds |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |
| `npm run lint` | ESLint |
| `npm run format` | Prettier, writes changes |
| `npm run format:check` | Prettier, reports only |

## TypeScript

- **Strict mode**, plus `noUncheckedIndexedAccess`: indexing returns `T | undefined`.
- **No `enum` or `namespace`** (`erasableSyntaxOnly`). Use string literal unions.
- **No `any`.** Use `unknown` and narrow.

## Code style

- **Prettier owns formatting.** ESLint covers correctness only.
- **Imports:** `@/` for anything outside the current folder, `./` for siblings. Order is enforced by ESLint.

## Styling

- **Tailwind v4, CSS-first.** Theme and plugins live in CSS; there is no `tailwind.config.js`.
- **Utility classes in JSX.** Reuse comes from components, not custom CSS classes or `@apply`.
- **Design tokens come from UntitledUI's `theme.css`.** No arbitrary values (`text-[13px]`) when a token exists.
- **Container queries for layout inside the page.** The sidebar makes viewport breakpoints unreliable there.

## UntitledUI components

- **Vendor code stays as the CLI writes it.** That covers `src/components/{base,application,foundations,marketing,shared-assets}/`, `src/utils/cx.ts`, `src/utils/is-react-component.ts`, `src/hooks/use-breakpoint.ts`, `src/hooks/use-resize-observer.ts` and `src/styles/theme.css`. Excluded from ESLint and Prettier; still type-checked.
- **Wrap, don't edit.** Customise by composing vendor components inside our own, outside the vendor folders.
- **Patch only for bugs or type errors**, and record why in [DECISIONS.md](./DECISIONS.md).
- **Adding one**, from `client/`: `npx untitledui@0.1.69 add <name> --lib-version 8 -y`, then `npm run format`. The CLI re-saves `tsconfig.json` in its own style.

## Project structure

- **`src/app/`**: shell, router, providers. Wiring only, no domain logic.
- **`src/features/<area>/`**: a feature's pages, components and queries. Features don't import from each other; shared code moves out.
- **`src/api/`**: fetch client and query setup.
- **`src/lib/`**: our pure helpers (money, dates). **`src/utils/`** is UntitledUI's (vendor).
- **`src/components/`**: UntitledUI vendor folders. Our cross-feature components live in `src/components/common/`.

## State

- **Server state:** TanStack Query.
- **Queries live in `features/<area>/queries.ts`:** fetch functions, query keys and `queryOptions` factories. Components spread the options and add their own (`select`, `enabled`). Consider creating sub-directories if queries.ts grows.
- **Queries shared across features live in `src/api/<resource>.ts`.**
- **Types are inferred from the `queryFn`.** No generics on `useQuery`.
- **Mutations invalidate by key prefix** and return the promise, so the pending state lasts until the refetch is done.
- **Client state:** no global store. Shareable state lives in the URL, parsed with zod; the rest is component state.

## Forms

- **React Aria `Form` with a zod schema**, parsed from `FormData` on submit.
- **Errors show in the field's `hint`**, including server `422` details. Focus moves to the first invalid field.

## Money

- **Integer minor units everywhere.** `-4599` is `-$45.99`.
- **Convert at the edge:** user input becomes minor units in the form, before it reaches the API.
- **Never sum across currencies.** There are no exchange rates.

## Dates

- **Calendar dates are `YYYY-MM-DD` strings.** Compare them as strings.
- **Never `new Date('YYYY-MM-DD')`.** It parses as UTC midnight and shows the previous day west of Greenwich.
- **`createdAt` / `updatedAt` are UTC instants**, a different type.

## Accessibility

- **Target WCAG 2.1 AA.**
- **`eslint-plugin-jsx-a11y`** catches static issues at lint time.
- **Control borders meet 3:1 contrast.**
- **Loading is `role="status"`, errors are `role="alert"`.** Stale data dims with `aria-busy` rather than swapping to a spinner.
- **Charts are `role="img"` with a summary**, and a table carries the same data.
- **Custom clickables get `cursor-pointer`.**

## Performance

- **Virtualize long lists.** Memoize rows, and keep `select` and virtualizer callbacks stable.

## Testing

- **Test where a bug would be silent and costly:** money, dates, grouping, URL parsing, form schemas, error recovery. Skip presentational components and vendor code.
- **Tests run in `America/Vancouver`** so day-shift bugs fail locally.
- **Stub `fetch` with `vi.stubGlobal`** and give each test a fresh `QueryClient` with retries off.
