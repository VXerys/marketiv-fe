# Prompt 02 — Implement UI System Refinement

Use this after audit matrix is created.

```txt
Read .kiro/specs/dashboard-ui-system-refinement/requirements.md, design.md, and tasks.md.
Read the route audit matrix from Phase 1.
Use docs/design-system/marketiv-studio-system-v5-8.html as the visual source of truth.

Implement Phase 2 and Phase 3 only:
- Design Token and Global Visual Normalization
- Shared Primitive Normalization

Do not rewrite every page manually.
First normalize shared dashboard primitives:
- DashboardCard
- DashboardMetricCard
- DashboardBadge
- DashboardButton
- DashboardProgress
- DashboardActionMenu
- ResponsiveDataRow/Cell
- modal/skeleton primitives if available

Preserve current routes and user flows.
Do not implement backend, payment, AI, realtime chat, or new business features.

After implementation, report:
1. files changed
2. primitives normalized
3. visual tokens aligned
4. any risky changes
5. build/typecheck result
```
