# 10 — Realtime, Events, and Background Jobs

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define how Marketiv uses Appwrite Realtime, Events, Functions, and background-like workflows.
- Keep realtime subscriptions scoped, secure, and efficient.
- Ensure asynchronous provider and status workflows remain idempotent and auditable.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Realtime Use Cases

- Rate Card chat message stream.
- Unread notification badge.
- Order status update for involved participants.
- Submission status update for related UMKM or Kreator.
- Admin queue refresh for pending submissions or disputes.
- Payment status UI update after backend confirmation.
- Do not use realtime for Campaign Mode chat because Campaign Mode has no chat.

## 4. Realtime Subscription Rules

- Subscribe only after session and resource access are confirmed.
- Subscribe to specific order or user-relevant resource scopes.
- Do not subscribe to entire private collections.
- Do not use public read for private realtime convenience.
- Unsubscribe when component unmounts.
- Handle reconnects without duplicating messages.
- Treat realtime events as update signals; fetch canonical data if precision matters.

## 5. Event-Driven Workflows

- Payment webhook received should update transaction and related campaign/order status.
- Submission validation should create notification and audit log.
- Custom Offer accepted should update order status and create notification.
- Withdrawal requested should create transaction, notification, and admin/admin-ops visibility.
- Dispute opened should freeze relevant payout/release workflow.
- Admin decision should update entity status, create audit log, and notify affected users.
- AI brief generation should log request metadata without storing sensitive secrets.

## 6. Background Job Requirements

- Long-running work should not block user-facing requests when avoidable.
- Export generation can be asynchronous if dataset grows.
- Fraud analysis can be asynchronous post-MVP.
- Provider reconciliation can run as scheduled trusted workflow.
- Retries must be bounded and logged.
- Failed jobs must be visible to admin or logs.
- Jobs must be idempotent when they can be triggered more than once.

## 7. Idempotency Rules

- Payment webhook must use provider transaction ID or order ID to prevent duplicate processing.
- Campaign claim must prevent duplicate claim per campaign and creator.
- Payout release must not run twice for the same validated submission/order.
- Notification creation should avoid critical duplicate alerts where possible.
- Audit logs may record repeated attempts but must identify duplicate/retry context.
- Background jobs must check current status before writing transitions.
- Status transitions must follow `docs/features/18-status-lifecycle-reference.md`.

## 8. Failure Handling

- Realtime disconnection should show soft stale indicator where needed.
- Webhook failure should be logged and retryable.
- Notification failure should not corrupt payment state.
- Audit logging failure for critical operations must be treated seriously.
- AI generation failure should not block manual campaign creation.
- Payment pending state must remain until trusted confirmation or expiry.
- Users should receive actionable message when asynchronous processing is delayed.

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
- Note 3: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
