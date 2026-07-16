# Workflow: Dispute

## Purpose

Sengketa atau aju banding pada order rate card — UMKM/creator cukup menghubungi admin via WhatsApp. Tidak ada sistem review sengketa di dalam platform.

## Modules Involved

- [Orders](../02_Modules/Orders/00_Index.md) — order terkait sengketa.
- [Users](../02_Modules/Users/00_Index.md) — data profil kedua pihak.

## Trigger

UMKM atau Creator ingin mengajukan sengketa/banding atas suatu order.

## Step-by-step Flow

### Tahap 1: Hubungi Admin

1. **Orders** — User buka halaman detail order.
2. **Orders** — Tampilkan tombol "Hubungi Admin" yang mengarah ke nomor WhatsApp admin.
3. User klik tombol → terbuka chat WhatsApp dengan pesan otomatis berisi informasi order (order ID, judul, dll).
4. Admin akan merespon dan menangani sengketa secara manual di luar platform.

## Nomor WhatsApp Admin

- Nomor WhatsApp admin disimpan sebagai konstanta sistem (`ADMIN_WHATSAPP_NUMBER`).
- Format link: `https://wa.me/{ADMIN_WHATSAPP_NUMBER}?text=Halo%20Admin%2C%20saya%20ingin%20mengajukan%20sengketa%20untuk%20order%20...`

## Edge Cases

- **Dispute hanya untuk order aktif** — order `pending_payment` atau `completed` tidak perlu dispute.
- **Semua keputusan final** — keputusan admin melalui WhatsApp bersifat final dan di luar platform.
- **Campaign Viral dispute** — creator appeal atas auto-reject submission campaign. Sama: hubungi admin via WhatsApp (lihat [40_Submission_Fraud.md](40_Submission_Fraud.md)).

## Links

- [Orders](../02_Modules/Orders/00_Index.md)
- [Submission Fraud workflow](40_Submission_Fraud.md) — appeal creator campaign
