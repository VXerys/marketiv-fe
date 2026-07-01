# 16 — Code Style and Review Checklist

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define coding style, naming, structure, and review expectations.
- Keep contributions consistent across frontend, backend, Appwrite functions, and AI-generated code.
- Make code review easier and safer for a marketplace with sensitive financial workflows.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. TypeScript Standards

- Use TypeScript for application code.
- Prefer strict typing.
- Avoid `any` unless justified and localized.
- Define domain types for roles, statuses, DTOs, and provider responses.
- Use union types for documented enum values.
- Do not duplicate status strings across files without shared constants.
- Use explicit return types for critical service functions.
- Validate external data before casting to domain types.

## 4. Naming Standards

- Use clear domain names: campaign, claim, submission, rateCardOrder, transaction, withdrawal, dispute.
- Use collection names exactly as documented.
- Use action names that describe business operation.
- Use boolean names beginning with `is`, `has`, `can`, or `should`.
- Use status constants for lifecycle values.
- Use file names that match component or domain responsibility.
- Do not use vague names such as `data`, `temp`, `fix`, or `newLogic` in committed code.

## 5. Component Style

- Keep presentational components focused on rendering.
- Keep business decisions in services/actions/functions.
- Do not place Appwrite mutation logic inside generic UI components.
- Pass minimal props to child components.
- Use composition for cards, tables, and status blocks.
- Keep feature-specific components inside feature folders.
- Keep shared primitives free of domain-specific business rules.

## 6. Service and Function Style

- Validate input at function boundary.
- Validate session and role.
- Validate resource ownership.
- Validate current resource status.
- Perform mutation.
- Create related transaction/audit/notification records when required.
- Return stable success/error shape.
- Log internal failure safely.

## 7. Commit and PR Standards

- Commit messages should describe the actual change.
- Separate unrelated changes.
- Do not mix major refactor with feature implementation unless planned.
- PR description should include affected feature, affected routes, affected collections, and testing notes.
- PR must mention if schema, permission, or status lifecycle changed.
- Generated code must be reviewed like handwritten code.

## 8. Review Checklist

- Does this change respect Campaign Mode zero-chat rule?
- Does this change respect Appwrite schema docs?
- Does this change respect status lifecycle docs?
- Does this change mutate sensitive fields from frontend?
- Does this change expose secrets?
- Does this change validate input server-side?
- Does this change include user-friendly error handling?
- Does this change include loading/empty/error states?
- Does this change create audit logs where required?
- Does this change remain mobile-first?

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

