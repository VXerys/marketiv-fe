# 12 — AI Integration Standards

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define secure and maintainable integration rules for AI features in Marketiv.
- Ensure AI helps users without bypassing business rules, review, security, or budget control.
- Prevent API key exposure, prompt leakage, and unsafe auto-publishing.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. AI Boundary

- AI calls must go through backend-side execution.
- Do not call AI provider APIs directly from browser code.
- AI provider keys must remain in environment secrets.
- AI output is advisory, not authoritative.
- AI must not publish campaign automatically.
- AI must not approve submissions automatically in MVP.
- AI must not release payment or escrow.

## 4. AI Brief Assistant

- AI Brief Assistant helps UMKM create campaign brief text.
- Input may include product name, short description, niche, target audience, and tone.
- Output may include campaign brief, hook idea, selling points, CTA, and hashtag suggestions.
- Generated output must be editable before saving.
- Generated output should be labeled as AI draft.
- User can discard AI output and write manually.
- AI failure must not block campaign creation.

## 5. Prompt Safety

- Do not include provider secrets in prompts.
- Do not include internal admin notes unless required and authorized.
- Minimize personal data in prompts.
- Use Bahasa Indonesia simple instructions for UMKM-facing outputs.
- Constrain model output format where structured output is needed.
- Validate AI output before storing or displaying.
- Treat AI output as untrusted text until sanitized.

## 6. Cost Control

- Use cost-efficient model for MVP brief generation unless quality requirement changes.
- Limit max tokens.
- Rate-limit AI endpoints per user.
- Cache or store generated draft only where useful.
- Log request count and failures.
- Do not generate repeatedly on every keystroke.
- Provide manual fallback.

## 7. AI Fraud Detection Boundary

- Advanced fraud detection is post-MVP unless explicitly approved.
- MVP can use manual validation and simple heuristics.
- AI fraud score must not be the only reason for irreversible financial action.
- Admin must be able to review suspicious submissions.
- Fraud decision must create audit trail.
- False positive risk must be considered in UI and admin workflows.

## 8. AI Coding Assistant Constraints

- AI-generated implementation must not invent business rules.
- AI-generated prompts must reference relevant docs.
- AI-generated UI must include loading/error/empty states.
- AI-generated backend code must validate role and resource state.
- AI-generated code must not embed prompt/provider keys.
- AI-generated schema must not create undocumented collections or fields.

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
- Note 4: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
- Note 5: Keep this guideline explicit in pull requests, code review comments, and AI prompts for this area.
