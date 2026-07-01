# 01 — Engineering Principles

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define non-negotiable engineering principles for Marketiv.
- Keep MVP implementation secure, maintainable, scalable, and team-friendly.
- Prevent business-critical mistakes around escrow, permissions, Campaign Mode, and Appwrite boundaries.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Principle: Security First

- Assume all browser input is untrusted.
- Validate identity and authorization inside trusted execution paths.
- Use Appwrite permissions as a baseline, not as the only business-rule enforcement layer.
- Never expose provider secrets to the browser.
- Never trust role stored in client-side state.
- Prefer least-privilege access for every collection, bucket, function, and route.
- Audit all sensitive operations.

## 4. Principle: Backend-Trusted Mutations

- Sensitive mutations must be executed by Appwrite Functions or secure server-side handlers.
- Frontend may request an operation, but backend decides whether it is allowed.
- Quota, payment, wallet, validation, and dispute changes must never be controlled by the client.
- Server-side code must re-check the current database state before committing state transitions.
- Server-side code must reject stale transitions and duplicated operations.
- Payment webhooks must be idempotent.

## 5. Principle: MVP First, Scalable by Design

- Build only MVP features that are documented and prioritized.
- Keep architecture modular so post-MVP features can be added without rewrites.
- Do not create heavy abstractions before the flow is stable.
- Do not add integrations such as TikTok/Instagram API automation unless explicitly moved into scope.
- Prefer simple reliable workflows over premature automation.
- Document post-MVP assumptions instead of implementing them early.

## 6. Principle: Explicit Domain Boundaries

- Campaign Mode and Rate Card Mode are separate business ecosystems.
- Campaign Mode is performance-based, job-pool driven, and zero-chat.
- Rate Card Mode is consultative, chat-enabled, and fixed-price.
- Finance and escrow state must be isolated from UI convenience state.
- Admin operations must not be mixed into public dashboard logic.
- AI features must assist users but must not bypass review or publish actions.

## 7. Principle: Maintainable Code

- Use TypeScript domain types for DTOs, statuses, and role mappings.
- Keep business logic out of JSX and presentational components.
- Keep data access in services, actions, or backend functions.
- Prefer small, composable components over massive dashboard files.
- Keep function names aligned with domain language.
- Avoid undocumented shortcuts.

## 8. Hard Rules

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

## 9. AI Coding Assistant Notes

- Load this file before generating code in the related area.
- Do not invent missing architecture, collection names, permissions, or enum values.
- Prefer minimal, scoped changes over broad rewrites unless migration is explicitly requested.
- Before suggesting a new package, justify why existing Next.js, React, Tailwind, or Appwrite capabilities are insufficient.
- Always mention affected files and expected behavior when producing implementation prompts.
- Do not move business rules into presentational components.
- Do not remove security checks to make implementation simpler.
- When unsure about a sensitive operation, route it through trusted backend execution.

## 10. Review Checklist

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

## 11. Additional Implementation Notes

- Note 1: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 2: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 3: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 4: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 5: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 6: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 7: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 8: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 9: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 10: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 11: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 12: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 13: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 14: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 15: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 16: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 17: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
