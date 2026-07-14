# 04 — Appwrite Backend Standards

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define how Appwrite services must be used in Marketiv.
- Separate Auth, Database, Storage, Functions, Realtime, and Messaging responsibilities.
- Prevent direct frontend mutation of sensitive domain state.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Appwrite Auth Boundary

- Appwrite Auth is the identity source of truth.
- Email/password handling must stay inside Appwrite Auth.
- Password hashes must never be stored in Marketiv domain collections.
- User sessions must be verified before protected reads or writes.
- Profile documents extend Auth users with role and domain information.
- Role assignment must be controlled by trusted flows.
- Admin assignment must not be available from public registration.

## 4. Appwrite Database Boundary

- Databases store domain documents only.
- Collections must follow the documented schema in `docs/database/02-collections-schema.md`.
- Do not create collections ad hoc from feature code.
- Document IDs should be stable and meaningful only when explicitly documented.
- Status fields must use the documented enum values.
- Money fields must use consistent numeric representation as defined by database docs.
- Database writes must include timestamps where required.
- Sensitive collections require restrictive permissions.

## 5. Appwrite Storage Boundary

- Storage is allowed for profile pictures, business logos, portfolio images, and campaign image references.
- Storage is not allowed for raw video hosting.
- Storage is not allowed for final creator video proof.
- File size validation must be enforced before upload and in trusted backend checks.
- Storage permissions must match resource ownership.
- Public file access must be deliberate and documented.
- Uploaded files must store metadata references in database documents only when needed.

## 6. Appwrite Functions Boundary

- Use Functions for payment webhook handling.
- Use Functions for campaign claim mutation and quota updates.
- Use Functions for submission validation and payout release.
- Use Functions for wallet balance changes.
- Use Functions for withdrawal processing.
- Use Functions for dispute resolution and admin override.
- Use Functions for AI Brief Assistant calls.
- Functions must validate caller identity, role, input, current resource state, and allowed transition.

## 7. Realtime Boundary

- Realtime is allowed for Rate Card chat messages.
- Realtime is allowed for notification badge counts.
- Realtime is allowed for order status updates and submission status updates.
- Do not subscribe users to broad private collections.
- Do not rely on Realtime for authorization.
- Realtime payloads must be treated as event notifications, not as permission proof.
- Always confirm final state with a trusted read when needed.

## 8. Server SDK vs Client SDK

- Client SDK can be used for authenticated reads and safe user-owned updates.
- Server SDK with elevated credentials must only run server-side.
- Do not bundle Appwrite API keys into frontend code.
- Do not use elevated credentials for normal user reads.
- Use least privilege even in backend code.
- Backend service wrappers must centralize repeated Appwrite logic.

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
- Note 2: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
