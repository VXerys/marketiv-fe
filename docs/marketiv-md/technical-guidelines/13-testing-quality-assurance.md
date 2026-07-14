# 13 — Testing and Quality Assurance

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define testing and QA expectations for Marketiv MVP.
- Make role-based, financial, realtime, Appwrite permission, and mobile workflows testable.
- Ensure no feature ships without critical state coverage.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Testing Layers

- Unit tests cover pure functions, validators, formatters, status mapping, and fee calculations.
- Integration tests cover Appwrite services, server actions, route handlers, and functions where feasible.
- End-to-end tests cover primary user flows.
- Manual QA covers UX, copy, edge cases, mobile layout, and provider sandbox behavior.
- Security tests cover unauthorized access and forbidden mutations.
- Regression tests cover previously fixed critical bugs.
- Accessibility checks cover keyboard, focus, labels, and contrast.

## 4. Role-Based Test Matrix

- Guest can access public routes and cannot access dashboards.
- UMKM can access UMKM dashboard and cannot access Kreator dashboard.
- Kreator can access Kreator dashboard and cannot create campaigns.
- Admin can access admin routes and operational queues.
- UMKM cannot claim campaigns.
- Kreator cannot validate submissions.
- Non-participants cannot read Rate Card chat room.
- Campaign Mode must never render chat for any role.

## 5. Critical Flow Tests

- Register and create profile.
- Login and role-based redirect.
- UMKM creates campaign draft.
- UMKM proceeds to payment.
- Payment webhook activates campaign.
- Kreator views Job Pool.
- Kreator claims campaign.
- Kreator submits proof URL.
- Admin validates submission.
- Backend releases payout.
- UMKM browses creator directory.
- UMKM starts Rate Card chat.
- UMKM sends Custom Offer.
- Kreator accepts offer.
- UMKM pays order.
- Order completes and payout is released.
- Kreator requests withdrawal.
- Admin resolves dispute.

## 6. Frontend QA Requirements

- Test at 375px mobile viewport.
- Test desktop dashboard layout.
- Test loading states.
- Test empty states.
- Test error states.
- Test unauthorized states.
- Test disabled button states.
- Test long text wrapping.
- Test low-data lists and high-data lists.
- Test form validation and error copy.

## 7. Backend QA Requirements

- Test duplicate campaign claim rejection.
- Test quota full rejection.
- Test invalid status transition rejection.
- Test direct wallet mutation rejection.
- Test payment webhook idempotency.
- Test forbidden transaction edit from frontend.
- Test admin audit log creation.
- Test owner-only access to private resources.
- Test non-participant chat denial.

## 8. Definition of Done

- No feature is done without role permission verification.
- No feature is done without mobile verification.
- No feature is done without loading/empty/error state.
- No sensitive mutation is done without backend validation.
- No financial flow is done without transaction record.
- No admin operation is done without audit logging.
- No realtime feature is done without unsubscribe/reconnect behavior.
- No AI feature is done without fallback state.

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
