# 06 — Performance and Scalability

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define Marketiv performance targets and scalability rules.
- Ensure dashboard pages remain fast on mobile-first devices.
- Prevent inefficient Appwrite queries, over-fetching, and broad realtime subscriptions.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Performance Targets

- LCP should be below 2.5 seconds on a good mobile connection.
- INP should be below 200ms for primary interactions.
- CLS should remain below 0.1.
- Dashboard first meaningful load should target under 3 seconds on typical 4G.
- Route transitions should avoid blank screens.
- Forms should remain responsive during validation.
- Realtime chat should append messages without reloading entire order data.

## 4. Next.js Performance Rules

- Prefer Server Components for read-heavy route shells.
- Lazy-load heavy charts and admin-only components.
- Use image optimization for local or stored images.
- Avoid shipping large client bundles for static content.
- Split interactive widgets into Client Components only where needed.
- Do not import admin-heavy components into regular user bundles.
- Use Suspense and skeletons for progressive loading.
- Avoid blocking rendering on non-critical secondary data.

## 5. Appwrite Query Rules

- Never fetch all documents in a collection.
- Always paginate list views.
- Use documented indexes for filters and sorts.
- Use field selection/projection when available and practical.
- Do not recursively load relationships for dashboard list cards.
- Fetch detail data only on detail pages or expansion actions.
- Keep query parameters aligned with `docs/database/05-indexing-and-query-strategy.md`.
- Prevent N+1 fetches by designing DTOs or batched reads where appropriate.

## 6. Realtime Performance Rules

- Subscribe only to specific order message channels or user notification scopes.
- Do not subscribe to all messages globally.
- Do not subscribe to all transactions globally from user dashboards.
- Unsubscribe on unmount.
- Handle reconnect without duplicating displayed messages.
- Use cursor-based or timestamp-based message pagination for long chats.
- Do not use realtime as a substitute for indexed queries.

## 7. Data Loading Patterns

- Dashboard overview should fetch summary metrics separately from long lists.
- Lists must support pagination or infinite loading.
- Search inputs should debounce requests.
- Filters should map to indexed fields.
- Admin reports should use export jobs for large datasets where needed.
- Frontend should avoid waterfall requests when data can be loaded in parallel.
- Empty states should render quickly even when secondary widgets are still loading.

## 8. Scalability Constraints

- MVP must remain compatible with low-cost/free-tier infrastructure as long as feasible.
- Do not introduce paid infrastructure without explicit approval.
- Do not build internal video hosting.
- Do not process large reports synchronously in user-facing requests.
- Do not store large binary payloads in database documents.
- Keep collection documents lean and query-focused.

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
