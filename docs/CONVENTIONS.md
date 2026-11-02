# Conventions

The standards this client follows. Rationale lives in [DECISIONS.md](./DECISIONS.md).

## Commands

Run from `client/`:

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server, proxies `/api` to the backend |
| `npm run build` | Type-checks, then builds |
| `npm run lint` | ESLint |
| `npm run format` | Prettier, writes changes |
| `npm run format:check` | Prettier, reports only |

## TypeScript

- **Strict mode**, plus `noUncheckedIndexedAccess`: indexing returns `T | undefined`.
- **No `enum` or `namespace`** (`erasableSyntaxOnly`). Use string literal unions.
- **No `any`.** Use `unknown` and narrow.

## Code style

- **Prettier owns formatting.** ESLint covers correctness only.

## Project structure

<!-- -->

## State

- **Server state:** TanStack Query.
- **Client state:** <!-- -->

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

## Testing

<!-- What we test and why. -->
