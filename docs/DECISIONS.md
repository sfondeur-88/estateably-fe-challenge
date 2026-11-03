# Decision log

Key decisions and the trade-offs made for the purpose of the take-home project.

## Scope

### Stories 1 and 2 first
- **Decision:** Build accounts and transactions (Story 1) and balances as of any date (Story 2) first.
- **Why:** The ledger is the core of the app, expense reports and budget projections are views over it. Building it first also builds the data layer and the money and date handling the later stories would reuse.
- **Trade-off:** Fewer screens, built properly.

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

### Estateably-inspired palette
- **Decision:** A sand to dark-green neutral scale and green branding, set as token overrides in `globals.css`. Dark-green sidebar, sand page, off-white surfaces.
- **Why:** Anchored on Estateably's dark green (`#23352f`) and sand (`#ede6dd`). UntitledUI's semantic tokens read these, so every component re-themes with the base `theme.css` untouched. Sand/Beige colours are also calming & easy on the eyes.
- **Trade-off:** Every text pairing is checked against WCAG AA. The selected nav item's background barely differs from UntitledUI's default, so its icon turns light-green.

## Routing

### React Router v8, data mode
- **Decision:** React Router v8 with `createBrowserRouter`. No loaders: TanStack Query handles the fetching.
- **Why:** React router is widely used, and v8 has been stable since June 2026. UntitledUI's starter kit uses RR as well. Data mode adds route error boundaries.
- **Trade-off:** Search params are untyped strings, so URL state (`asOf`, filters, paging) needs a small helper. TanStack Router types them, at the cost of more setup and less familiarity.