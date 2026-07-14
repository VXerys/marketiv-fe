# Prompt 01 — Start Dashboard UI Audit

Use this after copying the spec into `.kiro/specs/dashboard-ui-system-refinement/`.

```txt
Read .kiro/specs/dashboard-ui-system-refinement/requirements.md, design.md, and tasks.md.

Start with Phase 1 only.

Audit the current Marketiv UMKM and Konten Kreator dashboard UI against docs/design-system/marketiv-studio-system-v5-8.html.

Do not implement fixes yet.
Create a route audit matrix covering:
- route
- breakpoint
- issue
- severity
- affected component
- expected fix
- status

Check these breakpoints:
375px, 430px, 768px, 1024px, 1280px, 1440px.

Focus on:
- card inconsistency
- broken responsive layout
- overflow
- inconsistent badges/buttons
- modal overflow
- missing loading/empty/error/not-found states
- Campaign Mode domain violations
- Rate Card Mode missing Collab Post warning

Output only the audit matrix and recommended fix order.
```
