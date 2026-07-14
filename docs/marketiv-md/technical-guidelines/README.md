# README — Technical Guidelines Index

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Provide the entry point for Marketiv engineering standards.
- Define how technical documents connect to database, feature, and UI/UX documentation.
- Make the project understandable for backend, frontend, QA, product, and AI coding assistants.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Stack Summary

- Frontend uses Next.js App Router, React, TypeScript, and Tailwind CSS.
- Backend platform uses Appwrite Auth, Databases, Storage, Functions, Realtime, and optional Messaging.
- Payment processing uses Midtrans; Marketiv must never store card data.
- AI integration uses provider APIs only through backend-side execution.
- Deployment should use Vercel/Appwrite Cloud or another serverless-compatible environment.
- Appwrite Storage is only for lightweight files such as profile images, logos, and selected campaign images.
- Raw video assets and final proof must be represented as external URLs, not binary database fields.

## 4. Documentation Map

- `docs/features/` defines what users can do and how feature lifecycle works.
- `docs/database/` defines Appwrite collections, attributes, relationships, indexes, and frontend data contracts.
- `docs/ui-ux/` defines visual direction, design tokens, component standards, and screen-level design rules.
- `docs/technical-guidelines/` defines how the system must be implemented safely and consistently.
- Technical Guidelines must not duplicate full schemas unless needed to define engineering boundaries.
- Feature docs must not override security, payment, or backend-only mutation rules.
- Database docs are the source of truth for collection and field names.
- UI/UX docs are the source of truth for visual tokens and component styling.

## 5. Recommended Reading Order

- Start with this README.
- Read `01-engineering-principles.md` before any implementation work.
- Read `02-project-architecture.md` before creating routes, services, or Appwrite Functions.
- Read `04-appwrite-backend-standards.md` before writing data access logic.
- Read `05-security-and-permissions.md` before implementing permissions, auth, or sensitive mutations.
- Read the relevant feature file in `docs/features/` before implementing a page or workflow.
- Read `17-ai-coding-assistant-rules.md` before prompting Cursor, Copilot, Windsurf, or similar tools.

## 6. Team Responsibilities

- Frontend owns UI rendering, user interactions, form UX, optimistic feedback, and safe read operations.
- Backend owns sensitive mutations, role validation, payment state changes, quota changes, wallet changes, and audit logs.
- QA owns role-based testing, mobile viewport checks, payment sandbox checks, and regression verification.
- Product owns feature scope, copy clarity, acceptance criteria, and MVP boundary decisions.
- Design owns tokens, layout consistency, accessibility review, and dashboard UI patterns.

## 7. Environment Overview

- Local is used for individual development with test Appwrite project and sandbox provider keys.
- Development is used for feature integration and non-production QA.
- Staging mirrors production configuration without real money movement.
- Production uses restricted credentials, locked permissions, and production-grade monitoring.
- Each environment should have separate Appwrite project IDs and provider credentials when possible.
- Secrets must be configured in environment providers, not committed to Git.

## 8. Definition of Done

- A feature is not complete if it has no loading state.
- A feature is not complete if it has no empty state.
- A feature is not complete if it has no actionable error message.
- A feature is not complete if role permission is untested.
- A feature is not complete if mobile 375px layout is broken.
- A feature is not complete if financial/admin-sensitive flows lack audit logging.
- A feature is not complete if it violates documented status lifecycle.
- A feature is not complete if the AI-generated code introduced undocumented schema or status values.

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
