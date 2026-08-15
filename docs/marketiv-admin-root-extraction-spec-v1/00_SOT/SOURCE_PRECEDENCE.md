# Source Precedence

Resolve conflicts in this order.

## 1. Current `staging` repository

The checked-out repository is the implementation source of truth for:
- exact current files;
- imports;
- package dependencies;
- route usage;
- assets;
- scripts/config.

Inspect before moving anything.

## 2. Approved Admin architecture handoffs

### `Panduan_Implementasi_Dashboard_Admin_Marketiv.pdf`

Canonical decisions:

- one repository;
- two separate frontend applications;
- Admin is a Next.js app in root `admin/`;
- Admin is NOT `src/app/admin`;
- staging and production remain the only environment branches;
- Admin uses the same Appwrite environment as the user app;
- Appwrite Site root for Admin is `admin`.

### `Marketiv_Admin_Auth_Backend_Architecture.pdf`

Canonical decisions:

- frontend/deployment is separated, not the domain database;
- same Appwrite Auth per environment;
- role/authorization differentiates Admin;
- same business collections;
- same existing Functions when business logic is the same;
- do not create `admin_*` collection duplicates just because the frontend is separate;
- backend Function remains the real security boundary for sensitive actions.

## 3. This spec pack

This pack translates the above architecture into a safe extraction sequence.

## 4. Older docs/agent files

Older Marketiv docs may contain stale stack/routing assumptions.

Do not allow old docs to override current code or the two approved Admin handoff documents.

## Conflict handling

If current `staging` has already migrated part of Admin:

1. preserve the newer current implementation;
2. skip obsolete move tasks;
3. verify the current path against the target topology;
4. report drift instead of forcing duplicate files.
