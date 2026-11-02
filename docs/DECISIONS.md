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

