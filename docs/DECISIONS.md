# Decision log

Key decisions and the trade-offs made for the purpose of the take-home project.

## Scope

### Stories 1 and 2 first
- **Decision:** Build accounts and transactions (Story 1) and balances as of any date (Story 2) first.
- **Why:** The ledger is the core of the app, expense reports and budget projections are views over it. Building it first also builds the data layer and the money and date handling the later stories would reuse.
- **Trade-off:** Fewer screens, built properly.

### Story 4 over story 3
- **Decision:** Future bills and income with a budget projection (Story 4). Expenses by category (Story 3) is left out.
- **Why:** It adds a form, a mutation with cache invalidation and a chart, which Stories 1 and 2 don't cover. Story 3 would be another read-only view over the same ledger.
- **Trade-off:** No category reporting. The projection's actual-vs-forecast seam is the harder data question anyway.

## Tooling

### ESLint over oxlint
- **Decision:** ESLint 9 and Prettier, in the client only. The server stays untouched.
- **Why:** Easy set-up, and more support than oxlint & biome. The plugins: jsx-a11y flags accessibility issues, and typescript-eslint adds type-aware rules for development.
- **Trade-off:** oxlint, the current Vite default, is much faster, but speed doesn't matter at this size. Plugin support: ESLint 9 for jsx-a11y, and TypeScript 6.0 for typescript-eslint.

## Design System

### UntitledUI + Tailwind v4
- **Decision:** UntitledUI React (v8) on Tailwind v4, built on React Aria. Its CLI copies component source into the repo.
- **Why:** I wanted to align with Estateably's design system, so the patterns are recognizable when presenting. Tailwind v4 would've been my choice regardless if I adopted a framework vs a custom one. I really like the version 4 CSS approach they've taken, and the performance is top-notch. React Aria is adopted due to being the headless primitive that Untitled UI uses, and the baked in accessibility is important to build on top of from the start versus later on.
- **Trade-off:** It requires React 19. Editing copied components makes upstream updates harder, so `theme.css` stays identical to upstream.
- **Friction:**
  - The CLI ignored project formatting and lint config, and rewrites shared files on every `add`. I resolved it by excluding it from ESLint and Prettier as it's generated 'vendor code', but still kept type-checking.
  - `dark:` follows the OS setting unless remapped to UntitledUI's `.dark-mode` class, even with dark mode unused.
  - The smallest nav unit the CLI offers (`sidebar-navigation-base`) brought 23 files, of which only `NavItemBase` is used. Unused files never reach the bundle, and pruning them would be undone by the next `add`.
  - The sidebar templates hardcode the Untitled logo, search and account card, so the sidebar is composed from `NavItemBase` instead.
  - `DatePicker` commits every calendar click immediately, so its Cancel button only closes the popover and doesn't truly Cancel the filter by default. Its trigger button only exposes `size`, so `AsOfPicker` wraps React Aria's `DatePicker` with the vendor `Calendar` and `Button`, joined to a Today button. Selecting a date commits and closes, React Aria's default.
  - Adding `select`, `input` and `modal` pulled in whole component families (PIN input, payment input, tags) plus `input-otp` as a dependency. They stay, unused, for the same reason as the nav files.

### Estateably-inspired palette
- **Decision:** A sand to dark-green neutral scale and green branding, set as token overrides in `globals.css`. Dark-green sidebar, sand page, off-white surfaces.
- **Why:** Anchored on Estateably's dark green (`#23352f`) and sand (`#ede6dd`). UntitledUI's semantic tokens read these, so every component re-themes with the base `theme.css` untouched. Sand/Beige colours are also calming & easy on the eyes.
- **Trade-off:** Every text pairing is checked against WCAG AA. The selected nav item's background barely differs from UntitledUI's default, so its icon turns light-green.

## Routing

### React Router v8, data mode
- **Decision:** React Router v8 with `createBrowserRouter`. No loaders: TanStack Query handles the fetching.
- **Why:** React router is widely used, and v8 has been stable since June 2026. UntitledUI's starter kit uses RR as well. Data mode adds route error boundaries.
- **Trade-off:** Search params are untyped strings, so URL state (`asOf`, filters, paging) needs a small helper. TanStack Router types them, at the cost of more setup and less familiarity.

## Data

### TanStack Query for server state
- **Decision:** All API data goes through TanStack Query. Each feature's `queries.ts` exports key factories and `queryOptions`; components spread them and add `select` or `placeholderData`.
- **Why:** Caching, deduping, retries and stale-while-refetching come built in. Every piece of state in the app is either server data or URL state, so no client store is needed.
- **Invalidation:** Mutations invalidate by key prefix (`forecastKeys.all`) and return the promise, so the Save button stays busy until the forecast has refetched.
- **Trade-off:** No optimistic updates. A projection is computed by the server, so guessing it on the client would show wrong numbers for a moment.

### TypeScript types for API responses, zod for user input
- **Decision:** API responses are typed from the provided server types and asserted once in `apiFetch()`. Zod is reserved for form input and URL search params (essentially user input).
- **Why:** The API shapes provided are trusted. Forms and URLs are where potential typing/validation issues could show up. Parsing every response would duplicate `types.ts` as schemas and could cost time on larger transaction lists.
- **Trade-off:** A server change that breaks the contract surfaces as a render bug instead of a query error.

### `@internationalized/date` for calendar dates
- **Decision:** Calendar dates stay `YYYY-MM-DD` strings. `@internationalized/date` handles local "today" and parsing, and the client always sends its own today as `asOf`.
- **Why:** Its `CalendarDate` is a date with no time or zone, matching the API's model, and it's the value type React Aria's `DatePicker` uses. It was already installed through React Aria. The server's default "today" uses the server's clock, which can be a different day from the user's. Lightweight for the use-case compared to Luxon as well.
- **Trade-off:** Luxon and date-fns are more familiar, but they're built around instants, so the picker would still need a conversion. Tests run in `America/Vancouver` so day-shift bugs fail locally, not only in a user's evening.

## Accounts

### Available balance as the headline
- **Decision:** Account rows and the account page lead with `available` (posted plus pending). The account page lists posted and pending beneath it.
- **Why:** It's what the user can actually spend, and a card hold has already reduced it. Showing posted alone would overstate the money on hand while a hold is in flight.
- **Trade-off:** A hold that never posts (the seeded hotel hold) lowers the headline until it drops off.

## Transactions

### Virtualized list with offset paging
- **Decision:** `useInfiniteQuery` loads 100 rows at a time with `offset`/`limit`, and `useWindowVirtualizer` renders only the rows on screen. The next page starts loading 25 rows before the end.
- **Why:** A ledger is read by scrolling, not by jumping to page 37. At `scale: 10` an account has ~4,450 rows; the DOM holds a few dozen at any time. Fixed row and date-heading heights mean nothing jumps after measuring.
- **Trade-off:** No "go to page" or deep link to a row, and offset paging can skip or repeat a row if data changes mid-scroll. Cursor paging would fix that; the API doesn't offer it.

### Running balance stays on the server
- **Decision:** Rows show the server's `runningBalance` (`withRunningBalance=true`). The client sorts by `-date,-id` to match the server's tie-break.
- **Why:** A running balance depends on every earlier row, and the client only holds the pages it has loaded. Matching the sort keeps two same-day rows from showing balances in the wrong order.
- **Trade-off:** Pending rows have no running balance, so they show none rather than a guessed one.

### Performance, measured with the React DevTools Profiler
- **Setup:** `POST /api/dev/reset {"scale": 10}`, Travel Rewards Visa, scroll to the end and change `asOf`.
- **`memo(TransactionRow)`:** the account query landing re-rendered every visible row. Commit time went from 20 ms to 7 ms.
- **Stable `getItemKey`:** an inline function made the virtualizer remeasure every loaded row on each scroll commit. With `useCallback`, scroll commits take 4 to 7 ms.
- **Module-level `select`:** grouping rows by date only re-runs when a page arrives, not on every scroll render.
- **Stale data dims** (`aria-busy`, after 200 ms) while a new `asOf` loads, instead of flashing a spinner.
- **Forecast route is lazy-loaded**, so Recharts only downloads when the forecast opens. Initial JS went from 1,342 kB to 808 kB (402 to 250 kB gzipped).

## Forecast

### Recharts for the projection chart
- **Decision:** A Recharts line chart of month-end balances, with the lowest point ringed. The chart is `role="img"` with a text summary, and the Monthly breakdown table carries the same numbers.
- **Why:** UntitledUI's chart examples are built on Recharts, so the styling matches. The table is the accessible version of the data.
- **Trade-off:** Recharts is a large dependency for one chart, so the forecast route is lazy-loaded and the accounts pages never download it.

### Uncontrolled form, validated with zod on submit
- **Decision:** React Aria's `Form` reads `FormData` on submit and parses it with a zod schema. Server `422` details map onto the same fields. Focus moves to the first invalid field.
- **Why:** One schema handles parsing and messages, including `parseMoneyInput` turning `84.95` into `8495` with integer maths. Six fields don't need a form library.
- **Trade-off:** UntitledUI fields show errors through `hint`, so the form keeps its own error state rather than using React Aria's built-in validation display.

### The forecast starts tomorrow
- **Decision:** The projection is requested with `asOf` today and `from` tomorrow. New bills and income must be due after today.
- **Why:** The server uses actual transactions up to `asOf` and scheduled items after it. Starting tomorrow makes the starting balance today's closing balance, matching the Accounts page, and no month mixes actuals with forecast. An unpaid item due today is already overdue on the server and never projected.
- **Trade-off:** Today's unpaid bills only appear in Upcoming, flagged overdue, not in the projected balance.

### One currency at a time
- **Decision:** A CAD/USD toggle (`?currency=`) scopes the whole forecast page. It only appears when there are 2 or more currencies.
- **Why:** There are no exchange rates, so the projection is per currency. Keeping it in the URL makes it shareable and survives a refresh.
- **Trade-off:** No combined view of total net worth.

### Native table with container queries
- **Decision:** A small `Table` in `components/common/` built on `<table>`, with column padding from `@container` queries.
- **Why:** The forecast tables are read-only, so UntitledUI's React Aria table (selection, sorting, keyboard grid) is more than they need. Container queries respond to the content width, which the sidebar makes different from the viewport.
- **Trade-off:** Sorting or row selection later would mean moving to the React Aria table.
