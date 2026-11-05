# Simplewealth

A personal finance manager built on the provided Express API: accounts and their transactions, balances as of any date, and a forecast of future bills and income.

- [Decision log](docs/DECISIONS.md): the reasoning and trade-offs behind each choice
- [Conventions](docs/CONVENTIONS.md): the rules the client follows
- [Starter README](docs/STARTER.md): the provided API, its contract and its deliberate edge cases

## Running it

Requires Node 22.22+.

```bash
npm install
npm run dev
```

- **Client:** <http://localhost:5173>
- **API:** <http://localhost:4000/api>
- **Larger dataset:** `curl -X POST localhost:4000/api/dev/reset -H 'Content-Type: application/json' -d '{"scale":10}'` (~6,600 transactions). `npm run reset` restores the default seed.

From `client/`: `npm test`, `npm run lint`, `npm run build`.

## What I built

| Story | Screen |
|---|---|
| **1. Accounts and transactions** | `/accounts` groups accounts by type. `/accounts/:id` shows the balance and a virtualized, date-grouped transaction list with running balances. |
| **2. Balance as of any date** | An `asOf` date picker on both account screens, kept in the URL. |
| **4. Future bills and projection** | `/forecast`: projected balance summary, chart, monthly breakdown, upcoming occurrences, and a form to add a bill or income. |

**Left out:**
- **Story 3** (expenses by category): another read-only view over the ledger. Story 4 adds a form, a mutation and a chart which felt more impactful. See [DECISIONS](docs/DECISIONS.md#story-4-over-story-3).
- **Editing the ledger:** the API supports account, transaction and transfer CRUD, but I put the form and mutation work into Story 4 instead. In a real finance manager, accounts and transactions mostly arrive from bank feeds, while future bills and income are entered by the user. The forecast form shows the pattern (zod schema, server `422` mapping, invalidation) a transaction form would reuse.

## Key decisions

- **Feature folders that don't import from each other**, each with its own `queries.ts`. A new story is a new folder and a route, lazy-loaded like the forecast.
- **Server state in TanStack Query, shareable state in the URL.** No global store: `asOf` and `currency` are URL params parsed with zod.
- **Virtualization with offset paging** for transactions. Profiled at `scale: 10`; scroll commits take 4 to 7 ms.
- **Derived values stay on the server.** Running balances need every earlier row, which the client doesn't have; the client matches the server's sort so ties line up.
- **Money is integer minor units end to end**, including form input. Currencies are never summed.
- **Calendar dates are timezone-free strings**, and the client sends its own "today". Tests run in `America/Vancouver` to catch day-shift bugs.
- **Tests guard silent, costly bugs:** money, dates, grouping, URL parsing, form schemas, error recovery. Since most of the components are pulled in through Untitled UI, component testing didn't feel valuable.

Full reasoning in the [decision log](docs/DECISIONS.md).

## Design system

**UntitledUI React on Tailwind v4**, with an Estateably-inspired palette set as token overrides.

- **Why:** it's the system Estateably uses, and it's built on React Aria, so keyboard and screen reader support comes built in. Also valuable to give myself some exposure to the framework.
- **Where it fought me:** the CLI ignores project lint and format config and pulls in whole component families. The date picker's Cancel didn't cancel. Fields show errors through `hint`, so forms keep their own error state. Details in [DECISIONS](docs/DECISIONS.md#untitledui--tailwind-v4).

## Where I used AI

I used Claude Code throughout, with a spec-first, test-driven flow.

**How I worked**
- **Lead and technical product role:** for each story I wrote the requirements, split them into small chunks, and worked through edge cases and technical considerations up front.
- **Decisions captured in markdown:** conventions, stack choices and preferences live in the docs, so Claude reused them and output needed few iterations.
- **Pair programmer:** in areas I knew less well, it proposed approaches with alternatives and we discussed the trade-offs before locking one in. I reviewed each piece with a What/Why/How explanation before keeping it.
- **Docs are mine.** AI drafted some entries, which I reworded and cleaned up.

**Where it did the heavy lifting**
- **Workspace setup:** ESLint, Prettier, Vitest and VS Code settings.
- **TanStack Query setup** and the conventions around each endpoint. I learned to transform data with a stable `select` so it only re-runs when the data changes. I also moved from custom hooks that spread an options argument (`useGetAccounts(id, options)`) to exporting `queryOptions` factories: call sites add their own options with full type inference, including `select`, and the same factory works for prefetching and cache reads.
- **Tests alongside each feature.** I chose which ones were worth keeping.

**Where I led**
- **Stack, scope and story choices.**
- **Design system:** researched the colours and designed the custom `globals.css` theme on UntitledUI's tokens.
- **Layout and visual direction,** researched from RBC and Wealthsimple for inspiration.
- **Component direction** and the conventions to follow.
- **Profiling** with the React DevTools Profiler, which found the `memo` and `getItemKey` fixes.

The backend is untouched, as provided.

**What I changed or rejected**
- **Over-scaffolding:** the first attempt did too much in one pass, so I restarted in a fresh repo, one small step at a time.
- **Lint overrides on UntitledUI code:** replaced by excluding vendor code from lint.
- **Tests of presentational components:** tests only guard silent, costly bugs.
- **Building the data layer ahead of the stories:** cut back to minimal scaffolding, filled in as each story needed it.
- **React Query Devtools:** I used the React DevTools Profiler instead.

## Next, with more time

- **Transaction filters and search** (category, amount, text), kept in the URL.
- **Add and edit transactions**, including transfers and the bulk endpoint's partial-success (`207`) UI.
- **Edit, pause and delete scheduled items** on the forecast.
- **Story 3**, the monthly expense report.
- **Accounts in the sidebar** as direct sub-links for quick access.
- **End-to-end tests** for the main flows, and an automated axe check.
