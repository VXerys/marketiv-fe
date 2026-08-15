# Codex Master Prompt — v2 Fresh Audit

```text
Implement exactly ONE phase of Marketiv Campaign/Admin Bugfix Fresh Audit v2.

Repository: marketiv-id/marketiv-web
Target branch: staging
Model: GPT-5.6 Terra Medium

Read only:
1) marketiv-campaign-bugfix-spec-v2-fresh-audit/README.md
2) marketiv-campaign-bugfix-spec-v2-fresh-audit/00_SOT/SOURCE_PRECEDENCE.md
3) the requested phase file in 02_PHASES/

Then inspect only the repository files named by that phase and direct dependencies needed to trace the current data/control flow.

Rules:
- current checked-out staging is implementation source of truth
- preserve unrelated changes; never reset/stash/discard automatically
- one phase only; STOP after report
- Admin remains standalone in admin/
- no Rate Card changes
- no broad refactor
- user/admin share the matching Appwrite environment
- no broad collection permission for Admin reads
- no client final submission/views/reward/ledger authority
- no server/API secrets in browser
- fixture is never a real-runtime error fallback
- add/update focused tests
- run phase verification
- distinguish CODE_VERIFIED from runtime E2E PASS

Final response:
Phase:
Status:
Baseline:
Diagnosis:
Root cause:
Files added:
Files changed:
Files removed:
Behavior changed:
Security/data-flow impact:
Verification:
Trello/source-of-truth impact:
Remaining risks/blockers:
Next phase:

STOP.
```
