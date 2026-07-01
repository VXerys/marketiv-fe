# Notifications — Business Rules

## Trigger

Notifikasi dibuat saat event berikut terjadi:

- Register (welcome notification)
- Offer masuk (offer received)
- Offer diterima (offer accepted)
- Pembayaran berhasil (payment success)
- Submission masuk
- Revision request
- Approval (submission/deliverable approved)
- Withdraw (requested/approved/rejected)
- Campaign claimed
- Campaign published

> Pemetaan event → modul sumber ada di [90_Events.md](90_Events.md).

## Kanal

- **In-App** (notification center).
- **Email**.
- WhatsApp & Push Notification = future (di luar MVP).

## Status Baca

- Setiap notifikasi punya flag `isRead` (default `false`).
- Ditandai terbaca saat pengguna membuka/menandai notifikasi.

## Lihat Juga

- [50_Database.md](50_Database.md) — skema field.
