# 14 — Observability, Logging, and Audit

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define how Marketiv records operational events, errors, audit logs, and business-sensitive changes.
- Make financial, admin, and security workflows traceable.
- Support debugging, dispute resolution, and reporting.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Observability Goals

- Detect errors before users repeatedly report them.
- Trace payment and escrow state changes.
- Trace admin actions and dispute decisions.
- Understand failed webhooks and function executions.
- Support debugging without exposing sensitive data.
- Provide enough context for incident response.
- Preserve critical business event history.

## 4. Application Logs

- Log server-side unexpected errors.
- Log Appwrite Function execution failures.
- Log provider webhook result.
- Log AI provider failure without logging secret prompts unnecessarily.
- Log permission denial patterns where useful.
- Log retry attempts for idempotent jobs.
- Do not log raw secrets, passwords, tokens, or card data.

## 5. Audit Log Requirements

- Audit campaign activation.
- Audit payment webhook processing.
- Audit claim creation where relevant.
- Audit submission validation.
- Audit fraud marking.
- Audit payout release.
- Audit withdrawal request and processing.
- Audit dispute open and resolution.
- Audit user suspension.
- Audit admin override.
- Audit manual financial adjustment.

## 6. Audit Record Shape

- `actor_user_id` identifies the actor where available.
- `actor_role` captures role at action time.
- `action` uses stable enum-like event names.
- `entity_type` identifies target domain object.
- `entity_id` identifies target document.
- `before_data` stores safe previous state where needed.
- `after_data` stores safe new state where needed.
- `reason` stores admin or system reason when required.
- `ip_address` and `user_agent` may be captured for sensitive operations.
- `created_at` is required.

## 7. Severity Levels

- `debug` for local/internal non-critical development traces.
- `info` for successful expected business events.
- `warning` for suspicious but recoverable conditions.
- `error` for failed operations requiring investigation.
- `critical` for payment, security, or data integrity incidents.
- Production should avoid excessive debug logs.
- Critical financial failures should be visible in admin or alerting workflow.

## 8. Privacy and Safety

- Do not log passwords.
- Do not log full bank account numbers unless explicitly protected.
- Do not log card details.
- Do not log API keys.
- Do not expose internal stack traces to users.
- Mask sensitive identifiers in UI where appropriate.
- Use trace IDs to connect user-facing errors with backend logs.

## 9. Incident Response

- Identify impacted user and entity.
- Check audit logs for sensitive changes.
- Check provider event history.
- Check Appwrite Function logs.
- Check current document status.
- Apply corrective transaction/refund/adjustment through trusted operation only.
- Record incident resolution if financial or trust-related.

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
