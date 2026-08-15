# P8 — Final Handoff to Admin/Campaign Bugfix Work

## Objective

Close structural migration without pretending known Admin bugs were fixed.

## Required final report

### Topology

Confirm:

```text
user app → repository root
admin app → admin/
backend → shared 00_BACKEND / same Appwrite project per environment
```

### Routes

Confirm:

```text
Admin / → /dashboard
Admin /dashboard
Admin /submissions
User app no /admin operational route
```

### Build results

Record separately:

```text
USER APP
lint:
typecheck:
build:

ADMIN APP
lint:
typecheck:
build:
```

### Deployment handoff

Record:

```text
admin-staging.marketiv.id:
branch staging
root admin
Appwrite Staging

admin.marketiv.id:
branch production
root admin
Appwrite Production
```

### Known unresolved bugs

Carry forward, not close:

- Admin role/auth hardening;
- unsafe Admin auth fallback if still present;
- Admin submission false-success/direct-write;
- Admin metric truthfulness;
- Campaign UI/wiring blocker set from the bugfix spec.

### Bugfix-spec path changes

Before running the previous Campaign bugfix spec, update its file references:

Old paths such as:

```text
src/app/admin/...
src/components/admin/...
src/features/admin/...
src/lib/admin/...
```

now live under:

```text
admin/src/app/...
admin/src/components/admin/...
admin/src/features/admin/...
admin/src/lib/admin/...
```

The bugfix concepts remain valid; source paths must follow the new application boundary.

## Final status label

Use:

```text
ADMIN_APP_EXTRACTION_COMPLETE
```

only if both apps build and the old route implementation is removed.
