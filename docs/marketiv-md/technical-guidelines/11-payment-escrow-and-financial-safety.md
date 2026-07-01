# 11 — Payment, Escrow, and Financial Safety

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define technical safety rules for payment, escrow, wallet, withdrawal, refund, and financial records.
- Prevent direct money movement outside trusted workflows.
- Ensure all financial operations are auditable and reversible when business rules allow.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Payment Boundary

- Midtrans handles payment processing.
- Marketiv must not store card numbers, CVV, or raw payment credentials.
- Frontend may initiate payment flow but cannot confirm payment success.
- Payment success must come from verified provider webhook or trusted provider status check.
- Payment token creation must happen server-side.
- Provider secrets must remain server-side.
- Payment status shown in UI must come from backend source of truth.

## 4. Escrow Rules

- UMKM payment enters escrow state before creator payout.
- Funds are not released to creator until validation conditions are met.
- Campaign payout depends on valid submission and views/rules.
- Rate Card payout depends on accepted/completed order and valid collab post requirement.
- Dispute freezes payout release.
- Cancelled or expired payment must not activate campaign/order.
- Refund must be recorded as transaction and audit log.

## 5. Ledger and Transaction Rules

- Every money movement must create a transaction record.
- Transaction records must reference campaign, order, withdrawal, or refund where applicable.
- Transaction status must use documented lifecycle.
- Wallet balance should be derived or updated only by trusted financial events.
- Manual adjustment requires admin reason and audit log.
- Provider order ID must be stored for reconciliation.
- Do not delete financial records; use reversal/refund/adjustment records.

## 6. Webhook Rules

- Verify signature before processing.
- Validate payload schema.
- Map provider status to Marketiv transaction status explicitly.
- Make processing idempotent.
- Store received provider event metadata as safe log if needed.
- Reject unknown or malformed webhook events.
- Do not expose webhook endpoint behavior to users beyond safe status updates.

## 7. Withdrawal Rules

- Only Kreator with available balance can request withdrawal.
- Withdrawal amount cannot exceed available balance.
- Withdrawal should create withdrawal record and transaction record.
- Pending withdrawal amount should not remain fully available for another withdrawal.
- Admin or trusted provider workflow processes withdrawal.
- Failed withdrawal must restore or keep balance consistent according to ledger design.
- Bank account details must be protected and not publicly exposed.

## 8. Frontend Finance Rules

- Frontend can display wallet, transactions, payment instructions, and status.
- Frontend can request payment creation or withdrawal creation through backend.
- Frontend cannot edit transaction records.
- Frontend cannot mark a campaign/order as paid.
- Frontend cannot release escrow.
- Frontend cannot update wallet balance.
- Frontend must show pending states clearly.

## 9. Admin Finance Rules

- Admin can inspect transactions according to role permission.
- Admin actions on money require reason.
- Admin override must create audit log.
- Admin refund/payout decisions must validate current dispute and transaction state.
- Admin UI must show irreversible action warnings.
- Admin must not bypass transaction ledger.

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
