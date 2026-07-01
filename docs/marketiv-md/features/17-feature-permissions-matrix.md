# 17 — Feature Permissions Matrix

Dokumen ini adalah sumber kebenaran untuk permission fitur Marketiv.
Gunakan dokumen ini sebelum membuat route, tombol, menu sidebar, backend function, atau query data.

## 1. Role Legend

- Guest: belum login.
- UMKM: pemilik usaha.
- KREATOR: konten kreator.
- ADMIN: operator internal.
- Backend Function: trusted execution layer.

## 2. Global Rule

- Gunakan Bahasa Indonesia yang sederhana, tegas, dan mudah dipahami oleh UMKM.
- Semua flow finansial wajib melewati backend/Appwrite Function, bukan mutasi langsung dari frontend.
- Semua status harus menggunakan enum yang didefinisikan di `18-status-lifecycle-reference.md`.
- Semua operasi sensitif wajib menghasilkan record `audit_logs`.
- UI harus mobile-first, readable di viewport 375px, dan memiliki loading/error/empty state.
- Campaign Mode tidak boleh memiliki chat, tombol kontak, WhatsApp, email, atau komentar.
- Rate Card Mode adalah satu-satunya mode yang memiliki Live Chat dan Custom Offer.
- File video final tidak boleh disimpan di Marketiv; gunakan URL TikTok/Instagram sebagai bukti tayang.
- Aset besar UMKM harus menggunakan Google Drive/Dropbox atau external URL valid.
- Appwrite Auth adalah sumber identity; `profiles` adalah sumber data domain user.

## 3. Matrix

| Feature / Action | Guest | UMKM | KREATOR | ADMIN | Backend Function | Notes |
|---|---:|---:|---:|---:|---:|---|
| Open landing page | ✅ | ✅ | ✅ | ✅ | - | Public route. |
| Register account | ✅ | - | - | - | ✅ | Creates Auth user + profile. |
| Create ADMIN account | ❌ | ❌ | ❌ | ❌ | ✅ | Internal only. |
| Login/logout | ✅ | ✅ | ✅ | ✅ | - | Appwrite Account session. |
| Edit own profile | ❌ | ✅ | ✅ | ✅ | Optional | Non-sensitive fields only. |
| Change own role | ❌ | ❌ | ❌ | ❌ | ✅ | Admin/trusted operation. |
| Create campaign | ❌ | ✅ | ❌ | ❌ | Optional | Draft allowed by UMKM. |
| Publish campaign | ❌ | ❌ | ❌ | ❌ | ✅ | Only after payment success. |
| Cancel own campaign | ❌ | ✅ | ❌ | ✅ | ✅ | Depends claim/payment status. |
| View own UMKM campaign | ❌ | ✅ | ❌ | ✅ | - | Owner/admin. |
| View Job Pool | ❌ | ❌ | ✅ | ✅ | - | Only active campaigns. |
| Claim campaign | ❌ | ❌ | ❌ | ❌ | ✅ | Kreator triggers function. |
| Submit proof URL | ❌ | ❌ | ✅ | ✅ | ✅ | Kreator owner/admin. |
| Validate submission | ❌ | ❌ | ❌ | ✅ | ✅ | Admin function. |
| Release campaign payout | ❌ | ❌ | ❌ | ✅ | ✅ | Trusted mutation. |
| Browse creator directory | ❌ | ✅ | ✅ | ✅ | - | Kreator may preview public data. |
| Create rate card | ❌ | ❌ | ✅ | ✅ | ✅ | Max 3 active. |
| Start Rate Card chat | ❌ | ✅ | ❌ | ✅ | ✅ | UMKM initiates order. |
| Send normal chat message | ❌ | ✅ | ✅ | ✅ | Optional | Participants only. |
| Send Custom Offer | ❌ | ✅ | ❌ | ✅ | ✅ | UMKM only. |
| Accept/Reject Custom Offer | ❌ | ❌ | ✅ | ✅ | ✅ | Kreator only. |
| Pay order/campaign | ❌ | ✅ | ❌ | ❌ | ✅ | Provider/payment function. |
| Update payment status | ❌ | ❌ | ❌ | ❌ | ✅ | Webhook/trusted. |
| View own wallet | ❌ | ❌ | ✅ | ✅ | - | Read-only. |
| Request withdrawal | ❌ | ❌ | ✅ | ✅ | ✅ | Balance validation. |
| Approve withdrawal | ❌ | ❌ | ❌ | ✅ | ✅ | Admin/trusted. |
| Open dispute | ❌ | ✅ | ✅ | ✅ | ✅ | Participant/admin. |
| Resolve dispute | ❌ | ❌ | ❌ | ✅ | ✅ | Requires reason. |
| Export report | ❌ | ❌ | ❌ | ✅ | ✅ | Admin only. |
| View audit logs | ❌ | ❌ | ❌ | ✅ | - | Read-only admin. |

## 4. Frontend Rendering Rules

- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.
- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.
- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.
- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.
- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.
- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.
- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.
- Do not render CTA if user does not have permission.
- Do not hide permission failures as empty state.
- For disabled CTA, explain the reason in helper text or tooltip.
- For Campaign Mode, never render chat/contact components.
- For finance, never expose mutation controls beyond approved user action.
- Admin actions require confirmation modal and reason input.

## Additional Implementation Notes
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
- Keep implementation aligned with database docs, permission matrix, and status lifecycle reference.
