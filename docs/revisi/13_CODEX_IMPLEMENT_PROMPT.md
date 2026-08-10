# 13 — Codex Prompt — Hard Token

Use per finding:

```text
Implement finding: <ID>

HARD TOKEN MODE.

Read only:
1. 00_HARD_TOKEN_MODE.md
2. entry <ID> in 01_FINDINGS_REGISTRY.md
3. related tab MD
4. source files explicitly listed by the finding

Do not re-audit the repository.
Do not read unrelated docs.
Do not perform unrelated refactor.
Preserve current architecture/business flow.

Workflow:
1. Trace minimum dependency/data flow.
2. Confirm root cause in current code.
3. Implement smallest production-ready fix.
4. Add/update targeted tests.
5. Run targeted verification.

Security/payment:
- server is authority;
- enforce role + ownership + valid transition;
- preserve idempotency;
- never trust client success/state.

Output only:
Diagnosis:
- max 3 bullets

Changed:
- file: short change

Verify:
- command -> PASS/FAIL

Remaining:
- only real blocker/risk

Stop after <ID> is solved.
```
