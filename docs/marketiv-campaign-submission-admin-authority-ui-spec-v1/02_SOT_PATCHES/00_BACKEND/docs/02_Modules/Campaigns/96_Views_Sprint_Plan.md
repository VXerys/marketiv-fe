# Campaign Views Sprint Plan — Superseded

**Status:** Superseded on 2026-08-14.

The previous plan in this file was based on the old product concept that UMKM manually verifies Creator views and approves/rejects Campaign submissions.

That authority model is superseded by:

- `04_Decisions/ADR-010.md`
- `.kiro/specs/campaign-submission-admin-authority-ui/requirements.md`
- `.kiro/specs/campaign-submission-admin-authority-ui/design.md`
- `.kiro/specs/campaign-submission-admin-authority-ui/tasks.md`

Current rule:

```text
Creator submits → Admin Marketiv validates/locks views → UMKM observes → backend calculates reward
```

Do not execute old UMKM review-modal tasks from Git history. Git preserves the historical implementation plan; this file preserves only the latest active direction.
