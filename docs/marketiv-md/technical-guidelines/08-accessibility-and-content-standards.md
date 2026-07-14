# 08 — Accessibility and Content Standards

> Marketiv Technical Guidelines — Appwrite-ready engineering standard.

## 1. Purpose

- Define accessibility and content quality standards for Marketiv.
- Make the product usable for UMKM, creators, admins, and users on mobile devices.
- Align implementation with WCAG-oriented accessibility practices.

## 2. Scope

- Applies to Marketiv MVP and all dashboard-first implementation work.
- Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
- Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
- When this document conflicts with generated code, this document wins.
- When this document conflicts with product feature details, escalate and update the docs before coding.

## 3. Accessibility Baseline

- Target WCAG 2.2 AA as the practical baseline where feasible.
- All interactive elements must be keyboard reachable.
- Focus state must be visible.
- Color contrast must be sufficient for text and important UI controls.
- Do not communicate status using color alone.
- Use semantic HTML whenever possible.
- Use accessible labels for form controls.
- Use alt text for meaningful images.

## 4. Form Accessibility

- Every input must have a visible label or equivalent accessible label.
- Error messages must be associated with the input where possible.
- Helper text should explain expected format.
- Required fields must be clearly indicated.
- Validation errors must be announced or placed near the field.
- Do not rely only on placeholder text.
- Input font size should be at least 16px on mobile.
- Touch target should be at least 44x44px.

## 5. Modal and Dialog Accessibility

- Dialogs must trap focus while open.
- Dialogs must be dismissible by a clear action.
- Destructive confirmation dialogs must be explicit.
- Do not open unexpected modal chains.
- Use proper heading structure in modal content.
- Return focus to the trigger after closing where possible.
- Avoid using modal for long forms unless necessary.

## 6. Content Tone by Role

- UMKM-facing copy must be simple, trust-oriented, and action-focused.
- Kreator-facing copy can be more direct, progress-oriented, and earning-focused.
- Admin copy must be precise, operational, and status-driven.
- Financial copy must be explicit about amount, fee, escrow, and status.
- Error copy must tell the user what happened and what to do next.
- Do not use heavy technical jargon for UMKM users.
- Use Bahasa Indonesia as default MVP language.

## 7. Microcopy Standards

- Bad: `Error occurred`.
- Good: `Link tidak valid. Gunakan URL publik TikTok atau Instagram Reels.`
- Bad: `Payment failed`.
- Good: `Pembayaran belum berhasil. Coba lagi atau pilih metode pembayaran lain.`
- Bad: `Unauthorized`.
- Good: `Akun Anda tidak memiliki akses ke halaman ini.`
- Bad: `Invalid file`.
- Good: `File tidak didukung. Gunakan gambar JPG atau PNG dengan ukuran sesuai batas.`

## 8. Inclusive UX Rules

- Do not use icons without text for critical actions.
- Do not hide important fee or escrow information.
- Do not assume users understand marketplace or escrow terminology.
- Provide short explanations for campaign, escrow, rate card, and collab post concepts.
- Use consistent words for the same action across the app.
- Avoid sarcasm, slang-heavy copy, or ambiguous warning messages.

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
