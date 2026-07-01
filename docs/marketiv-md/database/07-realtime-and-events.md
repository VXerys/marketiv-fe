# 07 — Realtime and Events

> Dokumen ini menjelaskan penggunaan Appwrite Realtime, Functions events, webhook, dan notifikasi untuk Marketiv.
> Realtime dipakai untuk pengalaman UI, bukan sebagai source of truth finansial.

---

## 1. Prinsip Realtime

Realtime hanya mempercepat UI menerima update.
Realtime tidak menggantikan query awal.
Realtime tidak menggantikan validasi backend.
Realtime tidak menjadi bukti payment sukses.
Realtime tidak boleh dipakai untuk mengubah saldo langsung.
Semua data realtime tetap berasal dari database write yang sah.

---

## 2. Realtime Use Cases

Realtime dipakai untuk:

1. Chat Rate Card Mode.
2. Message read state.
3. Notification badge.
4. Order status update.
5. Submission status update.
6. Payment status display setelah backend update.
7. Admin review queue refresh ringan.
8. Dashboard badge update ringan.

Realtime tidak dipakai untuk:

1. Campaign Mode chat.
2. Payment verification utama.
3. Saldo mutation.
4. Fraud detection utama.
5. Withdrawal processing.
6. Admin override tanpa Function.
7. Bulk export.
8. Database migration.

---

## 3. Event Sources

| Source | Event | Consumer |
|---|---|---|
| Auth | User registered | create profile Function |
| Database | New message | Chat realtime UI |
| Database | New notification | Notification UI |
| Database | Submission update | Dashboard Kreator/UMKM |
| Database | Order update | Chat/order detail UI |
| Storage | File uploaded | Optional validation Function |
| Function | Payment webhook handled | Database update + notification |
| Webhook | Midtrans notification | Payment Function |
| Admin action | Validation/dispute update | Audit + notification |

---

## 4. Chat Realtime Scope

Chat hanya berlaku untuk `rate_card_orders`.
Chat disimpan di collection `messages`.
Chat tidak boleh dibuat untuk `campaigns`.

Chat room identity:

```txt
room_id = rate_card_orders.$id
messages.order_id = room_id
```

Initial load:

```txt
Query messages where order_id == room_id orderAsc created_at limit 50
```

Realtime update:

```txt
Subscribe to messages create events.
Filter client-side by order_id if channel granularity tidak cukup.
Append message to local state.
Update unread badge if receiver_user_id == current_user_id.
```

---

## 5. Chat Message Lifecycle

1. User membuka order detail.
2. Frontend cek participant permission.
3. Frontend memuat 50 pesan terbaru.
4. Frontend subscribe realtime messages.
5. User mengirim pesan.
6. Backend/client create message sesuai permission.
7. Database write berhasil.
8. Realtime event diterima participant.
9. Receiver melihat badge unread.
10. Receiver membuka chat.
11. Frontend mark messages as read.
12. Realtime update read state jika diperlukan.

---

## 6. Custom Offer Event Flow

Custom Offer adalah message tipe `CustomOffer`.
Action sensitif tetap via Function.

Flow send offer:

1. UMKM mengisi form custom offer.
2. Frontend memanggil Function `send-custom-offer`.
3. Function validasi UMKM participant.
4. Function validasi order status `Negosiasi`.
5. Function menghitung fee 10%.
6. Function membuat message tipe `CustomOffer`.
7. Function membuat notification ke Kreator.
8. Function membuat audit log.
9. Realtime mengirim message baru ke chat UI.

Flow accept offer:

1. Kreator klik terima.
2. Frontend memanggil Function `accept-custom-offer`.
3. Function validasi Kreator participant.
4. Function update `rate_card_orders` ke `MenungguPembayaran`.
5. Function update offer status jika disimpan.
6. Function membuat system message.
7. Function membuat notification ke UMKM.
8. Function membuat audit log.
9. Realtime update order dan messages.

---

## 7. Notification Realtime

Notification disimpan di `notifications`.
Realtime hanya memberi tahu UI bahwa ada notification baru.
Frontend tetap harus bisa fallback query notification list.

Notification event flow:

1. Backend membuat document `notifications`.
2. Realtime event diterima user jika sedang online.
3. UI increment badge unread.
4. User membuka notification panel.
5. Frontend query notification list terbaru.
6. User mark as read.
7. UI update badge.

Notification types:

```txt
CampaignActivated
ClaimCreated
SubmissionValidated
PaymentSuccess
CustomOfferReceived
OrderCompleted
WithdrawalSuccess
DisputeUpdated
System
```

---

## 8. Payment Event Flow

Payment event tidak boleh bergantung pada realtime dari client.
Source of truth payment adalah provider webhook + backend verification.

Campaign payment flow:

1. UMKM klik bayar.
2. Frontend memanggil Function create payment.
3. Function membuat transaction pending.
4. Function mengembalikan payment URL/token.
5. User membayar di provider.
6. Provider mengirim webhook ke Function.
7. Function verify signature.
8. Function lookup transaction by provider_order_id.
9. Function idempotency check.
10. Function update transaction.
11. Function update campaign payment status.
12. Function update campaign status `Aktif` jika sukses.
13. Function membuat notification.
14. Function membuat audit log.
15. Realtime hanya memperbarui UI setelah database berubah.

Critical:

```txt
Jangan set payment sukses dari callback browser saja.
```

---

## 9. Submission Validation Event Flow

Flow:

1. Kreator submit proof via Function.
2. Function create/update `campaign_submissions` status `Pending`.
3. Admin dashboard menerima update queue via query/realtime.
4. Admin validasi submission.
5. Function `validate-submission` update status.
6. Jika valid, Function membuat transaction pencairan.
7. Function update saldo kreator.
8. Function membuat notification ke Kreator dan UMKM.
9. Function membuat audit log.
10. Realtime update dashboard status.

Realtime use:

1. Kreator melihat status berubah dari Pending ke Valid/Fraud.
2. UMKM melihat submission status update.
3. Admin queue menghilangkan item yang sudah diproses.

---

## 10. Withdrawal Event Flow

Withdrawal tidak diproses realtime.
Realtime hanya untuk update status UI.

Flow:

1. Kreator request withdrawal via Function.
2. Function cek saldo.
3. Function create withdrawal `Pending`.
4. Function create transaction `Pending`.
5. Admin finance melihat queue.
6. Admin finance process withdrawal.
7. Backend update status `Processing`.
8. Provider/manual transfer selesai.
9. Backend update status `Success` atau `Failed`.
10. Backend update saldo sesuai model.
11. Backend create notification.
12. Backend create audit log.
13. Realtime update UI kreator.

---

## 11. Dispute Event Flow

Flow:

1. User membuka dispute via Function.
2. Function validasi user terkait reference.
3. Function create dispute `Open`.
4. Function update entity terkait jika perlu.
5. Function notify admin/support.
6. Admin review dispute.
7. Admin update status via Function.
8. Function membuat resolution.
9. Jika uang berubah, Function membuat transaction.
10. Function membuat notification ke pihak terkait.
11. Function membuat audit log.
12. Realtime update status dispute/order/submission.

---

## 12. Events to Functions

Recommended Appwrite Function triggers:

| Function | Trigger |
|---|---|
| `create-profile-after-signup` | Auth user created |
| `handle-midtrans-webhook` | HTTP webhook endpoint |
| `notify-on-message-created` | Optional database message create |
| `notify-on-submission-updated` | Optional database submission update |
| `audit-sensitive-action` | Called directly by mutation Functions |

Catatan:

1. Jangan membuat terlalu banyak trigger jika logic bisa dibuat eksplisit di Function utama.
2. Payment webhook harus HTTP endpoint khusus.
3. Audit log lebih aman dibuat eksplisit di Function utama.
4. Notification bisa dibuat eksplisit agar predictable.

---

## 13. Idempotency Rules

Event-driven system harus idempotent.
Webhook provider bisa dikirim lebih dari sekali.
Realtime event bisa diterima ulang jika client reconnect.
Function retry bisa menyebabkan duplicate jika tidak dicek.

Idempotency wajib untuk:

1. Payment webhook.
2. Withdrawal provider callback.
3. Campaign claim.
4. Submission validation.
5. Payout release.
6. Notification creation untuk event finansial.
7. Audit log untuk webhook duplicate.

Idempotency key examples:

```txt
provider_order_id
provider_transaction_id
campaign_id + kreator_user_id for claim
reference_type + reference_id + tipe for transaction
```

---

## 14. Realtime UI Fallback

Frontend tidak boleh bergantung 100% pada realtime.
Setiap realtime page harus punya fallback query.

Fallback strategy:

1. Initial query saat page load.
2. Subscribe realtime setelah query sukses.
3. On reconnect, refetch latest data.
4. On mutation success, optimistic update hanya untuk low-risk UI.
5. Untuk payment/status uang, refetch dari backend.
6. Jika realtime error, tampilkan data terakhir dan retry.

---

## 15. Optimistic UI Rules

Allowed optimistic UI:

1. Text message bubble sementara.
2. Mark notification as read.
3. Mark message as read.
4. Local form progress.

Not allowed optimistic UI:

1. Payment success.
2. Campaign active after payment.
3. Saldo bertambah.
4. Submission valid.
5. Withdrawal success.
6. Dispute resolved.
7. Admin override.

---

## 16. Realtime Security Checklist

Sebelum subscribe:

1. Pastikan user authenticated.
2. Pastikan user participant untuk order chat.
3. Pastikan query awal berhasil.
4. Pastikan event difilter sesuai entity.
5. Jangan render event yang bukan milik user.
6. Jangan expose sensitive payload.
7. Jangan subscribe collection admin di user biasa.
8. Unsubscribe saat page unmount.
9. Handle reconnect.
10. Handle duplicate event.

---

## 17. Frontend Event Handling Pattern

Recommended pattern:

```txt
useInitialQuery()
useRealtimeSubscription()
mergeRealtimeEventIntoState()
dedupeByDocumentId()
refetchOnReconnect()
cleanupOnUnmount()
```

State merge rules:

1. Jika event create, append jika belum ada.
2. Jika event update, replace matching document.
3. Jika event delete, remove only if UI supports delete.
4. Jika event duplicate, ignore.
5. Jika event unrelated, ignore.

---

## 18. Admin Realtime

Admin dashboard boleh memakai realtime untuk queue ringan.
Tetapi admin action tetap via Function.

Realtime admin use:

1. New submission pending.
2. New dispute open.
3. New withdrawal pending.
4. Payment webhook failure alert.

Admin must still query:

1. Detail submission.
2. Detail transaction.
3. Detail dispute.
4. Audit trail.

---

## 19. Event Logging

Event penting harus meninggalkan jejak.
Tidak semua realtime event perlu audit log.
Aksi sensitif wajib audit log.

Audit required:

1. Payment webhook received.
2. Payment status changed.
3. Submission validated.
4. Balance changed.
5. Withdrawal processed.
6. Dispute resolved.
7. Admin override.
8. Role changed.
9. User suspended.
10. Manual adjustment.

---

## 20. Final Rule

Realtime membuat UI terasa hidup.
Database tetap source of truth.
Functions tetap penjaga validasi.
Audit logs tetap jejak keamanan.
Jangan pernah mengubah uang, escrow, payment, atau validation status hanya karena event realtime diterima client.
