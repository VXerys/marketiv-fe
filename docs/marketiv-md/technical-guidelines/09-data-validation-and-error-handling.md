# 09 — Data Validation and Error Handling

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define validation and error-handling standards across frontend, backend, Appwrite Functions, and UI.
- Ensure every mutation is predictable, safe, and user-friendly.
- Prevent invalid status transitions, bad URLs, malformed financial values, and inconsistent error responses.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Validation Layers

- Frontend validation improves UX but is not security.
- Backend validation is mandatory for every mutation.
- Appwrite Function validation is mandatory for sensitive workflows.
- Database attribute constraints are useful but not enough for business rules.
- Appwrite permissions restrict access but do not replace domain validation.
- Admin tools must validate input as strictly as user dashboards.
- Provider webhooks must validate signature and payload structure.

## 4. Common Field Validation

- Required strings must be trimmed.
- Email should be handled by Appwrite Auth where possible.
- Phone/WhatsApp fields must use an accepted format.
- URL fields must use `https` protocol.
- External asset URLs should be validated as reachable where practical.
- TikTok/Instagram proof URLs must match supported platform patterns.
- Money values must be positive where required.
- Integer quotas and counts must not be negative.

## 5. Campaign Validation

- Campaign title is required.
- Campaign brief must meet minimum length.
- Niche is required.
- Campaign asset must use allowed file or external URL rule.
- Price per 1,000 views must be within documented range.
- Creator quota must be at least 1.
- Campaign cannot become active before payment success is confirmed by backend.
- Campaign cannot be claimed when full, cancelled, draft, or completed.

## 6. Rate Card Validation

- Rate card package name is required.
- Rate card price must be above minimum defined by feature docs.
- Creator can have maximum three active rate cards.
- Custom Offer must include scope, deadline, price, deliverables, and revision policy.
- Only UMKM can send Custom Offer.
- Only Kreator can accept or reject Custom Offer.
- Accepted offer locks price and scope unless documented renegotiation flow exists.

## 7. Financial Validation

- Payment status can only change from trusted provider webhook or admin trusted operation.
- Wallet balance cannot be directly edited from frontend.
- Withdrawal amount cannot exceed available balance.
- Refund must reference a valid transaction or order.
- Every financial operation must create transaction record.
- Every financial operation must create audit log.
- Duplicate provider events must not duplicate balance changes.

## 8. Error Response Convention

- Use stable machine-readable error codes.
- Use user-facing Bahasa Indonesia messages.
- Include details only when safe.
- Do not leak internal stack traces to users.
- Log internal error details server-side.
- Map expected errors to friendly UI states.
- Unexpected errors should provide retry action or support direction.

## 9. Example Error Shape

- `success: false` indicates failed operation.
- `code` contains stable value such as `CAMPAIGN_QUOTA_FULL`.
- `message` contains clear Bahasa Indonesia copy.
- `details` contains optional safe structured metadata.
- `trace_id` may be included for support/debugging.
- Frontend should not parse human message for logic.
- Frontend should map error code to UI behavior where needed.

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
