# 08 — Notifications
Route: `/dashboard/umkm/notifikasi`

Finding: `UMKM-NOTIF-01`.

Source: `NotificationView.tsx`, `notification-appwrite.service.ts`.

Fix:
- cursor pagination;
- batch mark-read Function.

Keep: realtime, unknown type -> `sistem`, internal allowlisted actions.

Verify: >100, realtime prepend, partial mark-read failure, unknown type.
