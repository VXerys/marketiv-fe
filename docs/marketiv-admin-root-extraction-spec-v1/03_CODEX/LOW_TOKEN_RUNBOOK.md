# Low-Token Codex Runbook

## One phase per context

Recommended prompts:

```text
Execute P0 only. Stop after the P0 report.
```

Then fresh context:

```text
Execute P1 only. Use the migration spec files. Stop after verification.
```

Continue through P8.

## Do not feed the whole repository

Let Codex discover only direct dependencies from import paths.

## Highest-cost phase

P3 dependency closure can grow context.

For P3:

1. inspect import list programmatically first;
2. group dependencies by directory;
3. open only unresolved local files;
4. avoid reading unrelated feature code.

## Avoid unnecessary token work

Do not ask Codex to:
- explain Next.js basics;
- regenerate long architecture prose;
- review Rate Card;
- reread old audit docs;
- redesign components;
- rewrite all CSS.

## Report, then continue

If one dependency requires a scope expansion, Codex should report the exact file/reason rather than recursively refactoring the application.
