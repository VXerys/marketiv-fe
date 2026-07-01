# 05 — Security and Permissions

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define Marketiv security baseline for authentication, authorization, Appwrite permissions, secrets, uploads, payments, and user-generated content.
- Align implementation with least privilege and OWASP-oriented secure development.
- Prevent high-risk mistakes in a marketplace with escrow and user-generated content.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Authentication Requirements

- Every protected route must verify an active session.
- Every trusted mutation must verify the caller identity server-side.
- Session expiration must be handled gracefully.
- User role must be fetched from trusted profile data, not from localStorage alone.
- Admin routes must require Admin role or team membership.
- Account recovery must use Appwrite Auth mechanisms.
- Email verification status must be respected where required by feature flow.

## 4. Authorization Requirements

- Authorization is role plus resource ownership plus current status.
- UMKM can manage only their own campaigns, orders, transactions, and profile data.
- Kreator can manage only their own claims, submissions, rate cards, wallet view, and profile data.
- Admin can access operational views, but sensitive changes must still create audit logs.
- Public users must not read private dashboard data.
- Do not expose internal IDs beyond what the UI needs.
- Resource ownership must be checked in backend mutations.

## 5. Appwrite Permission Rules

- Use restrictive collection and document permissions by default.
- Avoid `Role.any()` for private resources.
- Use public read only for intentionally public data such as verified creator profile previews.
- Use user-specific permissions for owner-owned private records.
- Use team/label permissions for Admin or backend operations.
- Do not rely on hidden frontend buttons as permission controls.
- Do not allow direct client writes to transactions, audit logs, wallet balances, payment states, validation states, or quota counters.

## 6. Secret Handling

- Never commit `.env` files.
- Commit `.env.example` with placeholder values only.
- Use separate secrets per environment.
- Rotate leaked keys immediately.
- Do not log provider secrets.
- Do not send secrets into AI prompts.
- Do not include secrets in screenshots or documentation examples.
- Use deployment provider secret storage for production.

## 7. Input and Content Security

- Sanitize user-generated content before rendering.
- Escape or safely render rich text.
- Validate all external URLs server-side.
- Allow only trusted URL protocols such as `https`.
- Reject suspicious script-like input in fields that should be plain text.
- Do not render untrusted HTML directly.
- Validate file MIME type and extension where upload is allowed.
- Do not store executable files in public buckets.

## 8. Payment and Webhook Security

- Verify payment webhook signatures.
- Make webhook handlers idempotent.
- Reject duplicate webhook events safely.
- Never trust frontend payment success callbacks as final confirmation.
- Store provider transaction IDs for reconciliation.
- Log webhook result and state transition.
- Do not store card data in Marketiv.

## 9. Hard Rules

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

## 10. AI Coding Assistant Notes

- Load this file before generating code in the related area.
- Do not invent missing architecture, collection names, permissions, or enum values.
- Prefer minimal, scoped changes over broad rewrites unless migration is explicitly requested.
- Before suggesting a new package, justify why existing Next.js, React, Tailwind, or Appwrite capabilities are insufficient.
- Always mention affected files and expected behavior when producing implementation prompts.
- Do not move business rules into presentational components.
- Do not remove security checks to make implementation simpler.
- When unsure about a sensitive operation, route it through trusted backend execution.

## 11. Review Checklist

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

## 12. Additional Implementation Notes

- Note 1: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
