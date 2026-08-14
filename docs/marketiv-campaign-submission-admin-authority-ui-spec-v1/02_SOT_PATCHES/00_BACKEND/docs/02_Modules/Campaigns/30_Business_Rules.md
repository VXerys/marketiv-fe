# Campaigns — Business Rules

## 1. Campaign Status

`draft | active | paused | completed`

- Campaign dibuat `draft`.
- Publish hanya boleh setelah funding business rule terpenuhi.
- `paused` menghentikan claim baru tetapi tidak membatalkan submission existing.
- `completed` berarti Campaign ditutup/remaining budget tidak lagi tersedia sesuai backend rule.

## 2. Campaign Type & Assets

- Type: `ugc | clipping`.
- MVP menggunakan aset digital; tidak ada physical sample shipping.
- External asset URL harus aman/valid sesuai validation layer.

## 3. Platform

- Current Campaign MVP product contract: **TikTok**.
- Platform adalah property Campaign/job dan Creator submission harus mengikuti platform Campaign.
- UI Creator tidak boleh menawarkan platform yang tidak dimiliki/supported Campaign.
- Future multi-platform support harus diperkenalkan melalui Campaign contract, bukan selector bebas saat submit.

## 4. Budget & Fee

- Minimum Campaign budget mengikuti konstanta/current approved product rule.
- Campaign platform fee = buyer-side UMKM sesuai ADR-008.
- Creator receives full calculated Campaign reward; frontend tidak boleh memotong Campaign reward dengan platform fee.

## 5. Claim Rules

- satu Creator maksimal satu claim per Campaign;
- Creator profile harus eligible/complete sesuai backend rule;
- Campaign harus `active`;
- total claim tidak boleh melewati quota;
- expired claim mengembalikan slot secara server-side/idempotent.

Claim status: `claimed | submitted | approved | rejected | expired`.

## 6. Submission Rules

Submission status: `pending | approved | rejected`.

- Creator hanya boleh submit untuk claim miliknya dengan status `claimed`.
- Submission terhubung 1:1 dengan claim.
- Creator mengirim public post URL + optional caption/note; Creator tidak mengisi final views.
- Trusted Function membuat submission `pending` dan mengubah claim menjadi `submitted`.
- Client-side validation hanya UX; server-side validation tetap authoritative.
- Creator tidak boleh mengubah submission setelah final decision jika backend menguncinya.

## 7. Validation Authority

**ADR-010:** Admin Marketiv adalah final user-facing validation authority.

Admin dapat, melalui trusted Function:

- membuka submission pending;
- membaca supporting risk/fraud data;
- menangkap `views_count` final;
- menetapkan validation timestamp/source;
- approve atau reject;
- mencatat reason/note.

UMKM:

- dapat membaca submission pada campaign miliknya;
- tidak dapat approve/reject;
- tidak dapat menginput atau mengubah final views;
- tidak dapat langsung memicu payout.

## 8. Fraud Rules

`fraudStatus: safe | review | rejected`

- Fraud precheck menghasilkan metadata risiko.
- Fraud precheck **tidak menjadi final submission authority** pada current implementation/target contract.
- `safe` tidak otomatis berarti submission approved.
- `review` berarti prioritas manual review.
- `rejected` fraud signal harus dipertimbangkan Admin, tetapi final submission status tetap authoritative decision path.
- Tidak boleh ada payout hanya karena fraud score rendah.

## 9. Views Rules

- Final views ditetapkan saat Admin validation.
- Prefer locked fields `views_count`, `views_captured_at`, `views_source`, `views_final` ketika tersedia.
- `views_source=manual_admin` berarti views dicatat oleh operation Admin Marketiv; label UI user-facing adalah `Diverifikasi Marketiv`.
- Legacy `views` hanya fallback compatibility, bukan alasan mengklaim data automatic/verified.
- Views tidak boleh negatif.

## 10. Reward Rules

```text
rewardBase = floor(verifiedViews / 1000) × rewardPer1000Views
reward = min(rewardBase, remainingBudget)
```

- Reward diproses backend setelah submission authoritative `approved`.
- Event/retry harus idempotent sehingga satu submission tidak menghasilkan reward ganda.
- UI approval status tidak sama dengan `cash paid`; financial wording mengikuti authoritative transaction state.

## 11. Read/Write Boundary

- Creator: write only through submit Function.
- UMKM: read submission only.
- Admin: review mutation only through trusted Function.
- Backend: financial mutation only.
- Direct client write terhadap final status/views/reward dilarang.

## 12. Migration Status

Product rule ini aktif sebagai target canonical contract. `review-submission` baseline 2026-08-14 masih mengotorisasi UMKM owner; backend authorization migration belum selesai dan harus dianggap blocker E2E, bukan alasan mempertahankan UI UMKM review.
