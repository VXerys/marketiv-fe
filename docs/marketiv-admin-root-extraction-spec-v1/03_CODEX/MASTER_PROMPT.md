# Codex Master Prompt — Admin Root Extraction

```text
Implement exactly ONE phase of the Marketiv Admin root extraction.

Read only:
1. README.md
2. 00_SOT/SOURCE_PRECEDENCE.md
3. the requested file from 02_PHASES/

Then inspect only the repository files named by that phase and their direct dependency closure.

Primary objective:
Extract the current in-app Admin dashboard into a standalone Next.js application at repository root `admin/`.

Non-negotiable:
- Current checked-out staging code is implementation source of truth.
- Preserve unrelated user changes. Never reset/stash/discard automatically.
- This is structural migration, NOT the Admin/Campaign bugfix task.
- Do not redesign UI.
- Do not fix Rate Card.
- Do not change Campaign business logic.
- Do not create duplicate Appwrite collections.
- Do not duplicate existing business Functions just because Admin is a separate app.
- Admin app must not import `../src`.
- Admin app must have its own package/config and build independently.
- Use same Appwrite project as user app for matching environment.
- Do not expose server/API secrets.
- Copy/move first, verify, delete old Admin source last.
- If newer current code conflicts with the spec, preserve newer valid behavior and report the drift.
- Run the phase-specific verification.
- Do not claim known Admin bugs are fixed unless you actually fixed them as a strictly required migration dependency.

Final response format:
Phase:
Baseline:
Diagnosis:
Files added/moved:
Files changed:
Files deleted:
Route changes:
Dependency changes:
Verification:
Known behavior debt preserved:
Risks/blockers:
Next phase:
```
