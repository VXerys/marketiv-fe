# 07 — UI/UX Implementation Standards

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define how the approved Marketiv visual direction must be implemented in code.
- Keep UI consistent across UMKM dashboard, Kreator dashboard, admin panel, Campaign Mode, and Rate Card Mode.
- Prevent hardcoded styling and inconsistent component behavior.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Design Token Rules

- Use documented Tailwind design tokens for color, spacing, typography, radius, shadow, and breakpoints.
- Primary color is orange and should be used for primary CTA, focus states, important highlights, and active navigation.
- Secondary color is deep navy and should be used for structure, text emphasis, and trust-oriented UI.
- Background should use light warm neutral surfaces.
- Do not introduce random colors in feature components.
- Semantic colors must be reserved for success, warning, danger, and info states.
- Component styling must be consistent with `docs/ui-ux/`.

## 4. Layout Rules

- Dashboard pages must be mobile-first.
- Use responsive shells for sidebar/topbar navigation.
- Primary content should not be hidden under fixed navigation.
- Cards should use consistent radius, border, padding, and shadow.
- Tables must have mobile alternatives or responsive overflow behavior.
- Metric cards should be readable at 375px viewport.
- Avoid dense layouts for UMKM-facing flows.
- Use whitespace deliberately to reduce cognitive load.

## 5. Component Rules

- Important actions must not be icon-only.
- Buttons must have loading and disabled states.
- Badges must map to documented statuses.
- Modals must support keyboard and screen-reader friendly behavior.
- Forms must use labels, helper text, and error text.
- Empty states must tell the user what to do next.
- Skeletons must match approximate final layout.
- Destructive actions require confirmation.

## 6. CTA Hierarchy

- Each screen should have one primary CTA.
- Secondary CTA should not visually compete with primary CTA.
- Destructive CTA must use danger styling and confirmation.
- Disabled CTA should explain why action is unavailable when context is not obvious.
- Campaign Job Pool card primary CTA is `Klaim Job Ini`.
- UMKM campaign creation primary CTA should progress the wizard.
- Payment CTA must clearly mention escrow or payment action.
- Admin destructive decisions must show confirmation and reason field.

## 7. Wizard Form Standards

- Use wizard form for long UMKM campaign creation.
- Show step indicator and progress.
- Validate each step before moving forward.
- Allow back navigation without losing input.
- Show review screen before payment.
- Never hide payment fee details.
- Use Bahasa Indonesia copy that explains unfamiliar concepts.
- AI-generated brief must be editable before submission.

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
