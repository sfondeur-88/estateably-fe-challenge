# Project notes

Personal finance manager take-home: a React client on a provided Express API.

## Layout

- `client/`: React 19, TypeScript, Vite, UntitledUI + Tailwind v4.
- `server/`: provided - leave it unchanged.
- `docs/`: [API.md](docs/API.md) and [api-types.d.ts](docs/api-types.d.ts) are the API contract. [CONVENTIONS.md](docs/CONVENTIONS.md) holds the coding rules; [DECISIONS.md](docs/DECISIONS.md) the reasoning.

## Commands

From `client/`: `npm run lint`, `npm run format`, `npm test`, `npm run build`.
From the root: `npm run dev` starts the API and client together.

## Rules

- **Tailwind v4 only.** Configure in CSS (`@theme`, `@plugin`, `@custom-variant`, `@utility`). No `tailwind.config.js`, no v3 syntax or class names.
- Follow [CONVENTIONS.md](docs/CONVENTIONS.md).

## Reference docs

Check these before writing code against a library API, rather than relying on memory:

- React Aria Components: https://react-aria.adobe.com/llms.txt
