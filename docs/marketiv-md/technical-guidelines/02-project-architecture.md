# 02 — Project Architecture

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Describe Marketiv's architecture across client, Next.js frontend, Appwrite backend, trusted functions, and external providers.
- Define where each type of logic belongs.
- Prevent accidental mixing of frontend rendering, backend mutation, and provider integrations.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. High-Level Architecture

- Browser renders the Marketiv web app through Next.js App Router.
- Next.js provides route groups for public pages, UMKM dashboard, Kreator dashboard, admin panel, and API/Route Handlers where needed.
- Appwrite Auth manages user identity, verification, sessions, and account recovery.
- Appwrite Databases stores domain documents such as profiles, campaigns, claims, submissions, orders, messages, transactions, disputes, notifications, and audit logs.
- Appwrite Storage stores lightweight files only.
- Appwrite Functions execute trusted workflows and provider integrations.
- External services include Midtrans, AI provider APIs, Google Drive/Dropbox URLs, TikTok URLs, and Instagram URLs.

## 4. Layer Responsibilities

- Client layer handles interaction, form input, local UI state, and visual feedback.
- Frontend server layer handles secure reads, composition, route-level protection, and controlled server-side operations.
- Appwrite platform layer handles identity, permissions, structured storage, file storage, realtime, and events.
- Trusted function layer handles sensitive domain mutation and integrations.
- External provider layer handles payment, AI generation, and off-platform media hosting.
- Audit layer records sensitive operations for debugging, compliance, and trust.

## 5. Next.js Routing Architecture

- Use `app/(public)` for public routes such as landing, login, register, guide, and about pages.
- Use `app/dashboard/umkm` for UMKM-protected dashboard routes.
- Use `app/dashboard/kreator` for Kreator-protected dashboard routes.
- Use `app/admin` for Admin-only routes.
- Use Route Handlers for server-side request handling that belongs in Next.js.
- Do not mix Pages Router API Routes and App Router Route Handlers unless explicitly migrating legacy code.
- Prefer Server Components for static and read-heavy dashboard shells.
- Use Client Components only for interactions, forms, realtime subscriptions, and local state.

## 6. Trusted Execution Boundary

- Appwrite Functions are required for payment webhooks.
- Appwrite Functions are required for AI provider calls when provider secrets are needed.
- Appwrite Functions are required for campaign claim mutation to avoid quota race conditions.
- Appwrite Functions are required for wallet, transaction, payout, withdrawal, and dispute mutation.
- Next.js server-side handlers may be used for web-specific orchestration, but must not expose secrets to the browser.
- Frontend must treat trusted function results as the source of truth after mutation.

## 7. Storage Boundary

- Do not store binary data in Appwrite Databases.
- Use Appwrite Storage for profile photo, UMKM logo, and selected lightweight campaign images.
- Use external URLs for video source materials.
- Use TikTok/Instagram public URLs for proof-of-work submission.
- Store external URL metadata as strings with validation result and platform type.
- Do not build internal video hosting or editing in MVP.

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
