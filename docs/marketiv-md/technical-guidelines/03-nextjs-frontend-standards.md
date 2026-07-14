# 03 — Next.js Frontend Standards

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define frontend implementation standards for Next.js App Router, React, TypeScript, and Tailwind CSS.
- Keep dashboard implementation consistent, safe, and maintainable.
- Make frontend code predictable for human developers and AI coding assistants.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. App Router Rules

- Use the `app/` directory as the primary routing system.
- Use route groups to separate public, dashboard, and admin sections.
- Use layouts for repeated navigation shells, sidebars, and topbars.
- Use `loading.tsx` for route-level loading UI where appropriate.
- Use `error.tsx` for route-level error boundaries.
- Use `not-found.tsx` where resource lookup can fail.
- Keep protected route checks near layout boundaries.
- Do not duplicate role-guard logic across every child page when layout-level guard is enough.

## 4. Server and Client Component Policy

- Use Server Components by default.
- Use Client Components for stateful interactivity, form handling, Appwrite Realtime subscriptions, modal state, and browser APIs.
- Do not put provider secrets in Client Components.
- Do not fetch private data in a Client Component unless permission and session handling are clear.
- Do not pass full sensitive objects to Client Components when only a subset is needed.
- Use DTOs to control what fields are exposed to UI.
- Do not render admin-only data in hidden DOM for non-admin users.

## 5. Folder Convention

- `components/ui` contains reusable primitives such as Button, Input, Card, Badge, Modal, Table, Skeleton, EmptyState, and Alert.
- `components/layout` contains Sidebar, Topbar, PageShell, DashboardShell, and responsive navigation components.
- `components/campaign` contains campaign-specific UI only.
- `components/rate-card` contains creator directory, rate card, order, and custom offer components.
- `components/chat` contains Rate Card chat-only components.
- `components/finance` contains wallet, transaction, payment, and withdrawal components.
- `components/admin` contains admin-only UI.
- `lib/appwrite` contains Appwrite clients and wrappers.
- `lib/validations` contains reusable validation schemas and helpers.
- `types` contains shared domain, DTO, status, and API response types.

## 6. Data Fetching Rules

- Use server-side reads for protected dashboard pages when possible.
- Use client-side queries for realtime or highly interactive sections only.
- Do not over-fetch entire documents when the UI needs a small subset.
- Use pagination for all lists.
- Use search/filter parameters that correspond to documented indexes.
- Keep loading states visible while data is being fetched.
- Retry behavior must be deliberate and not create duplicate sensitive mutations.
- After mutation, refetch source-of-truth data instead of assuming local optimistic state is correct.

## 7. Forms and UX

- Forms must use clear labels and helper text.
- Inputs must validate on the client for immediate feedback.
- Server-side validation remains mandatory.
- Primary action buttons must show loading and disabled states.
- Destructive actions must ask confirmation.
- Wizard forms must preserve partial user input where practical.
- Long UMKM forms must be broken into steps.
- All form errors must be specific and actionable in Bahasa Indonesia.

## 8. State Requirements

- Every page must render loading state.
- Every page must render empty state.
- Every page must render error state.
- Every protected page must render unauthorized or redirect behavior.
- Every mutation must handle pending, success, and failure states.
- Realtime pages must handle reconnect and stale subscription states.
- Financial pages must not show success until backend confirms success.

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
