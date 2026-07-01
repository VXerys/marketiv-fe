# Marketiv Dashboard UI Quality Specs

This zip contains a Kiro-style spec for refining the Marketiv dashboard UI.

## Main Spec Folder

Copy this folder into your project:

```txt
.kiro/specs/dashboard-ui-system-refinement/
```

Files:

```txt
requirements.md
_design.md
tasks.md
```

> Note: The actual file is named `design.md`, not `_design.md`. The underscore above is only to make the list visually clear.

## Source of Truth

The spec is designed around this UI kit reference in your repo:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

Use that file as the main reference for:

- warm dashboard background,
- orange/navy visual identity,
- card shape,
- dashboard 2–3–4 grid,
- badges,
- buttons,
- marketplace card anatomy,
- screen states,
- mobile-first behavior,
- domain rules.

## Recommended Next Step

Use Kiro with the tasks in order:

```txt
Phase 1  - Audit and Baseline
Phase 2  - Design Token and Global Visual Normalization
Phase 3  - Shared Primitive Normalization
Phase 4  - Card System Refinement
Phase 5  - Responsive Layout Fixes
Phase 6  - Screen States and Modal QA
Phase 7  - Domain Rule Enforcement
Phase 8  - Route Flow Testing
Phase 9  - Accessibility and Copy Pass
Phase 10 - Final Build and Regression
```

Do not jump to backend integration until this UI refinement spec is complete.
