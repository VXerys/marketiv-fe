# 17 — AI Coding Assistant Rules

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define how Cursor, Copilot, Windsurf, VS Code AI tools, and other AI coding assistants must work on Marketiv.
- Prevent AI from inventing schema, statuses, permissions, business rules, or unsafe mutations.
- Make prompts more deterministic and aligned with Marketiv architecture.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Required Context Loading Order

- Read `docs/technical-guidelines/README.md` first.
- Read `docs/technical-guidelines/01-engineering-principles.md` before implementation.
- Read the specific technical guideline file for the area being modified.
- Read `docs/database/README.md` before data-related work.
- Read `docs/database/02-collections-schema.md` before using collection fields.
- Read `docs/features/README.md` before feature work.
- Read `docs/features/17-feature-permissions-matrix.md` before route or button permission work.
- Read `docs/features/18-status-lifecycle-reference.md` before status mutation work.
- Read `docs/ui-ux/02-design-tokens.md` before UI generation.

## 4. Forbidden AI Assumptions

- Do not invent collection names.
- Do not invent field names.
- Do not invent status enum values.
- Do not invent permissions.
- Do not add chat to Campaign Mode.
- Do not create direct contact features inside Campaign Mode.
- Do not update wallet, transaction, payment, escrow, quota, or validation status from frontend.
- Do not expose API keys or provider secrets.
- Do not add dependencies without explicit justification.
- Do not generate UI without loading, empty, error, and unauthorized states.

## 5. Prompt Requirements

- State the feature being modified.
- State affected routes and files.
- State user role involved.
- State backend collections involved.
- State whether mutation is frontend-safe or backend-only.
- State relevant status lifecycle.
- State validation rules.
- State expected UI states.
- State acceptance criteria.
- Ask for minimal diff unless full implementation is explicitly needed.

## 6. Output Requirements

- Show changed files clearly.
- Explain business impact briefly.
- Explain security impact for sensitive flows.
- Keep implementation scoped.
- Do not rewrite unrelated files.
- Do not silently change schema or statuses.
- Do not remove existing validation.
- Do not remove audit logging.
- Do not replace documented design tokens with hardcoded styles.

## 7. AI Code Review Checklist

- Does generated code import undocumented collections or fields?
- Does generated code bypass Appwrite Functions for sensitive mutation?
- Does generated code trust client role?
- Does generated code render forbidden Campaign Mode chat/contact actions?
- Does generated code include loading/empty/error states?
- Does generated code use design tokens?
- Does generated code handle mobile layout?
- Does generated code leak secrets?
- Does generated code include tests or at least test notes for critical flow?

## 8. Safe Prompt Template

- Context: Marketiv uses Next.js App Router, TypeScript, Tailwind, and Appwrite.
- Feature: describe the exact feature and role.
- Docs to follow: list relevant docs.
- Files to edit: list suspected files.
- Constraints: include zero-chat, backend-only mutation, permission, status lifecycle, and design tokens.
- Task: specify exact outcome.
- Output: request minimal diff and explanation.
- Testing: request manual and automated checks where relevant.

## 9. Unsafe Prompt Examples

- `Make campaign better` is too vague.
- `Add chat to campaign detail` violates Campaign Mode rules.
- `Update saldo after payment from frontend` violates financial safety rules.
- `Use any collection you need` invites schema drift.
- `Just make it work` invites insecure shortcuts.
- `Skip validation for now` is not acceptable for sensitive flows.

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
