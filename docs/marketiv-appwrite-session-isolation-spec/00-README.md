# Marketiv — Appwrite Cross-App Session Isolation Spec

**Target branch:** `staging`  
**Repository:** `marketiv-id/marketiv-web`  
**Prepared:** 2026-08-29  
**Scope:** `staging.marketiv.id` + `admin-staging.marketiv.id`

## Objective

Memperbaiki konflik autentikasi di browser yang sama:

- login pada `admin-staging.marketiv.id` tidak boleh merusak / menggantikan sesi pada `staging.marketiv.id`;
- login pada `staging.marketiv.id` tidak boleh merusak / menggantikan sesi pada `admin-staging.marketiv.id`;
- logout salah satu aplikasi tidak boleh logout aplikasi lain.

Solusi utama yang harus diimplementasikan adalah **isolasi hostname Appwrite API** sambil tetap memakai **Appwrite Staging Project dan database yang sama**.

### Endpoint target

| Application | Public origin | Appwrite API endpoint |
|---|---|---|
| User app | `https://staging.marketiv.id` | `https://api-staging.marketiv.id/v1` |
| Admin app | `https://admin-staging.marketiv.id` | `https://api-admin-staging.marketiv.id/v1` |

`NEXT_PUBLIC_APPWRITE_PROJECT_ID` dan `NEXT_PUBLIC_APPWRITE_DATABASE_ID` **tetap sama** untuk kedua aplikasi karena keduanya masih menggunakan project staging yang sama.

## Mandatory implementation principles

1. Inspect current code before editing.
2. Do not create a new Appwrite project.
3. Do not duplicate database, collections, buckets, functions, or users.
4. Do not migrate auth to another provider/BaaS.
5. Do not refactor unrelated Campaign, Rate Card, payment, wallet, or admin modules.
6. Preserve admin authorization as fail-closed.
7. Do not expose API keys or server secrets.
8. Do not change Google OAuth redirect configuration unless runtime verification proves the user application's Appwrite API hostname changed.
9. Production (`marketiv.id`, `admin.marketiv.id`) is out of scope.
10. Stop and report a blocker if Appwrite cannot attach the second API custom domain to the same staging project, instead of inventing a different architecture.

## Read order

1. `01-context/*`
2. `02-diagnosis/*`
3. `03-solution/*`
4. execute `04-tasks/*` in numeric order
5. validate against `05-acceptance/*`
6. complete `06-verification/*`
7. return results using `07-agent-handoff/completion-report-template.md`

## Source of truth

Repository/current staging code wins over old documentation.

Key current-code references from the `staging` branch:

- `src/lib/appwrite/client.ts`
- `src/lib/appwrite/config.ts`
- `src/lib/appwrite/account.ts`
- `src/services/auth/auth.service.ts`
- `src/services/auth/session.service.ts`
- `src/config/auth.config.ts`
- `.env.example`
- `admin/src/lib/admin/appwrite.ts`
- `admin/src/lib/admin/auth.ts`
- `admin/src/lib/admin/auth.test.ts`
- `admin/.env.example`
- root `package.json`
- `admin/package.json`

External behavior reference:
- Appwrite Custom Domains: https://appwrite.io/docs/products/network/custom-domains
- Appwrite OAuth2: https://appwrite.io/docs/products/auth/oauth2

## Definition of done

This work is done only when a single normal browser profile can simultaneously hold:

- a valid UMKM/Creator session on `staging.marketiv.id`; and
- a valid Admin session on `admin-staging.marketiv.id`;

and each can refresh, navigate, call Appwrite, and logout independently without invalidating the other.
