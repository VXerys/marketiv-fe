# 15 — Deployment, Environment, and Secrets

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define environment, deployment, and secret-management standards for Marketiv.
- Keep local, development, staging, and production separated.
- Prevent accidental key exposure and production data corruption.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Environment Types

- Local is for individual developer machines.
- Development is for shared integration and feature testing.
- Staging mirrors production behavior using non-production credentials.
- Production is for real users and real business operations.
- Do not use production credentials in local development.
- Do not test destructive or experimental flows against production.
- Use clear environment naming in Appwrite projects and deployment settings.

## 4. Environment Variables

- Use `.env.example` for documented placeholders.
- Never commit `.env.local` or real secrets.
- Separate public variables from private variables.
- `NEXT_PUBLIC_*` variables are visible to browser and must not contain secrets.
- Appwrite endpoint and project ID may be public where appropriate.
- Appwrite API keys must be private.
- Midtrans server key must be private.
- AI provider API key must be private.
- Webhook secrets must be private.

## 5. Appwrite Environment Strategy

- Prefer separate Appwrite projects for development, staging, and production.
- Use separate database IDs or project IDs per environment.
- Use separate storage buckets per environment.
- Use separate function deployments per environment.
- Use separate permission configuration review before production.
- Document all collection IDs, bucket IDs, and function IDs in environment-specific config.
- Never let development users access production data by mistake.

## 6. Deployment Checklist

- Run type checks.
- Run linting.
- Run critical tests.
- Verify environment variables.
- Verify Appwrite endpoint and project ID.
- Verify payment provider mode.
- Verify webhook URL.
- Verify CORS/origin settings.
- Verify protected routes.
- Verify public pages.
- Verify mobile layout.
- Verify error boundaries.

## 7. Production Safety

- Production deployment must not use sandbox payment keys.
- Production webhook must verify signature.
- Production Appwrite permissions must not expose private collections publicly.
- Production admin routes must be protected.
- Production function logs must avoid sensitive payloads.
- Production error pages must not leak stack traces.
- Production rollback plan must exist for risky releases.

## 8. Branch and Release Rules

- Use feature branches for non-trivial changes.
- Use pull requests for review.
- Keep deployment branch protected where possible.
- Do not merge generated code without review.
- Tag releases when milestone is important.
- Document migration steps when collection/schema changes are required.
- Coordinate frontend and backend releases when DTO contracts change.

## 9. Rollback and Recovery

- Know how to rollback frontend deployment.
- Know how to disable a broken Appwrite Function.
- Do not rollback database schema casually without migration plan.
- Keep export/backup strategy for critical data.
- Payment incidents require manual reconciliation.
- Admin should be able to identify affected transactions through logs.

## 10. Hard Rules

- Campaign Mode is ZERO CHAT: no chat button, no message route, no WhatsApp/email link, no contact shortcut.
- Frontend must not mutate wallet balance, payment status, escrow status, quota counters, validation status, or transaction records.
- Sensitive mutations must go through trusted backend execution: Appwrite Functions, secure Route Handlers, or server-side service layer.
- Appwrite API keys, payment provider secrets, AI provider keys, and webhook secrets must never be exposed to browser code.
- All user-facing UI copy must use clear Bahasa Indonesia and avoid technical jargon for UMKM-facing flows.
- Every page must implement loading, empty, error, unauthorized, and success states before being considered complete.
- All financial and admin-sensitive operations must create audit logs with actor, target entity, action, result, and timestamp.
- Database documents must use documented collection names, field names, enum values, and status lifecycles only.
- Large raw video files must be stored outside Marketiv using public Google Drive/Dropbox URLs; proof of work uses TikTok/Instagram URLs.
- Mobile-first behavior must be tested from 375px viewport before desktop refinements.

## 11. AI Coding Assistant Notes

- Load this file before generating code in the related area.
- Do not invent missing architecture, collection names, permissions, or enum values.
- Prefer minimal, scoped changes over broad rewrites unless migration is explicitly requested.
- Before suggesting a new package, justify why existing Next.js, React, Tailwind, or Appwrite capabilities are insufficient.
- Always mention affected files and expected behavior when producing implementation prompts.
- Do not move business rules into presentational components.
- Do not remove security checks to make implementation simpler.
- When unsure about a sensitive operation, route it through trusted backend execution.

## 12. Review Checklist

- [ ] Does the change respect role-based access control?
- [ ] Does it avoid direct frontend mutation of sensitive fields?
- [ ] Does it validate input on the server-side path?
- [ ] Does it use existing design tokens and layout standards?
- [ ] Does it include loading, empty, error, unauthorized, and success states?
- [ ] Does it avoid adding chat to Campaign Mode?
- [ ] Does it preserve auditability for financial/admin actions?
- [ ] Does it remain mobile-first and accessible?
- [ ] Does it keep Appwrite permissions and backend functions aligned?
- [ ] Does it avoid hardcoded secrets, IDs, and environment-specific values?
