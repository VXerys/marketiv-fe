# Prompt 03 — Responsive and Card Fix Pass

Use this after shared primitives are normalized.

```txt
Read .kiro/specs/dashboard-ui-system-refinement/requirements.md, design.md, and tasks.md.
Use docs/design-system/marketiv-studio-system-v5-8.html as the visual target.
Use the existing route audit matrix.

Implement Phase 4 and Phase 5 only:
- Card System Refinement
- Responsive Layout Fixes

Prioritize high severity issues:
- horizontal overflow at 375px
- card/button/badge overflow
- broken mobile table/list layouts
- broken toolbar filters
- modal overflow
- inconsistent card shape and spacing

Rules:
- Use shared dashboard primitives.
- Do not add new dependencies.
- Do not implement backend.
- Do not change route architecture unless necessary.
- Campaign Mode must remain zero-chat.
- Rate Card Mode chat/custom offer only in negotiation pages.

After implementation, report:
1. routes fixed
2. components fixed
3. responsive breakpoints verified
4. remaining visual issues
5. build/typecheck result
```
