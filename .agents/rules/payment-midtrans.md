---
trigger: always_on
description: Strict security boundaries, webhook handler protection, and status mutations rules for Midtrans payment gateway integration.
---

# 💳 STRICT RULES — MIDTRANS PAYMENT INTEGRATION

Dokumen ini mengatur **standar integrasi payment gateway Midtrans** di Marketiv. Aturan ini **MUTLAK** untuk melindungi platform dari manipulasi status pembayaran.

---

## 1. TRANSACTION FLOW & SECURITY BOUNDARY

Semua inisiasi pembayaran (token Snap) dan validasi status harus diproses di lingkungan server yang aman:

```
[UMKM (Browser)] --(Click Bayar)--> [Next.js Server Action / Appwrite Function]
                                                     │
                                            (Request token Snap)
                                                     │
                                                     ▼
[UMKM Snap Modal] <---(Return Token Snap)--- [Midtrans API]
```

- **Client SDK Restriction:** Browser **TIDAK BOLEH** meminta token transaksi langsung ke Midtrans API menggunakan server key. Server key Midtrans bersifat **sangat rahasia** dan dilarang keras dibundel ke client-side JavaScript.
- **Client Status Restriction:** Status pembayaran di database **TIDAK BOLEH** diubah langsung oleh browser setelah modal Snap ditutup. Pembaruan status transaksi hanya valid jika dikerjakan oleh trusted webhook.

---

## 2. WEBHOOK HANDLING & IDEMPOTENCY

Tiap notifikasi status pembayaran dari Midtrans dikirimkan melalui HTTP POST webhook ke server (Appwrite Function).

### Verifikasi Signature Key (Wajib):
Webhook handler **wajib** melakukan validasi signature key sebelum memproses payload dari Midtrans guna mencegah fraud request:
```typescript
// Signature formula dari Midtrans:
// SHA512(order_id + status_code + gross_amount + ServerKey)
```
Jika signature hash tidak cocok dengan value header/payload, request **wajib ditolak** dengan HTTP `401 Unauthorized` atau `400 Bad Request`.

### Idempotency:
Webhook handler harus aman dari pemrosesan ganda (double-processing):
- Periksa status transaksi di database sebelum melakukan mutasi saldo kreator atau perilisan escrow.
- Jika transaksi sudah berstatus `paid` / `settlement`, abaikan webhook request berikutnya dengan return HTTP `200 OK`.

---

## 3. USER INTERFACE FEEDBACK (FRONTEND)

Saat UMKM menyelesaikan pembayaran di modal Snap:

- **Pending State:** Jika status adalah pending (misal: bank transfer belum dibayar), arahkan user ke detail order dengan petunjuk cara bayar dan visual `StatusBadge` kuning (`warning`).
- **Success State:** Jika pembayaran sukses terkonfirmasi oleh SDK event callback, tampilkan visual sukses sementara di client-side, namun sertakan banner informatif:
  > "Pembayaran sedang diverifikasi sistem. Halaman akan ter-refresh otomatis dalam beberapa saat."
- **Polling / Realtime:** Halaman detail pembayaran memanfaatkan subscription Appwrite Realtime atau interval polling ringan untuk mendeteksi perubahan status transaksi di database (yang di-update oleh webhook Midtrans) agar UI ter-refresh otomatis menjadi `Paid` (`success`).
