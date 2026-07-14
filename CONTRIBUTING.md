# Contributing

Thank you for contributing to Marketiv!

Local setup

1. Install dependencies:

```bash
npm ci
```

2. Common scripts

- `npm run dev` — start Next.js dev server
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript typecheck
- `npm run build` — build the app
- `npm run animation-audit` — run lightweight animation audit
- `npm run validate-data-contracts` — run lightweight data-contract checks

PR guidelines

- Keep PRs small and focused.
- Update `docs/marketiv-md` when you change collections, permissions, or business rules.
- Fill the PR template checklist and add links to docs.

Code style

- Follow TypeScript strict rules and avoid `any`.
- Use Tailwind utilities and the `cn` helper for conditional classes.
