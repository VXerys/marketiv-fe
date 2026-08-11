# Creator Submit Proof Design

Goal: pindah submit bukti tayang kreator ke trusted Function path agar frontend tidak tergantung schema Appwrite live dan error field drift seperti `creator_id` berhenti muncul dari browser flow.

## Scope

- Ubah jalur submit creator dari direct `databases.createDocument` ke `executeFunction`.
- Pertahankan kontrak UI: `claimId`, `campaignId`, `platform`, `postUrl`, `caption?`.
- Tambah guard server-facing di service frontend: claim owner tetap dicek lokal, plus `claim.campaignId === input.campaignId`.
- Tangani error Function secara konsisten ke `ServiceResult`.

## Architecture

- `src/lib/appwrite/functions.ts`
  Tambah ID Function baru `submitCampaignProof`.
- `src/services/creator/creator-appwrite.service.ts`
  `submitProofInAppwrite()` berubah jadi wrapper trusted Function. Claim dibaca dulu untuk ownership dan kecocokan campaign, lalu payload dikirim ke Function.
- `src/services/creator/creator-dashboard.service.ts`
  Kontrak publik tetap sama; caller UI tidak berubah.
- `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`
  Tidak perlu ubah API; hanya tetap mengandalkan hasil `submitProof()`.

## Data Flow

1. UI submit form.
2. `submitProof()` panggil `submitProofInAppwrite(input)`.
3. Service baca `campaign_claims` by `$id + creatorId`.
4. Service tolak jika claim tidak ada, status bukan `claimed`, atau `claim.campaignId !== input.campaignId`.
5. Service panggil `submit-campaign-proof` dengan payload camelCase.
6. Function backend menjadi satu-satunya tempat translate payload ke schema live dan menulis `campaign_submissions`.

## Error Handling

- Claim tidak ditemukan: `not_found`.
- Claim bukan milik user / campaign mismatch / status invalid: `validation`.
- Kegagalan Function: map lewat `FunctionExecutionError` dan `failFromWriteError`.
- UI tetap menampilkan toast dari `ServiceResult.error`.

## Testing

- Unit test: wrapper memanggil Function ID benar dengan payload benar.
- Unit test: mismatch `claim.campaignId` vs input ditolak sebelum Function dipanggil.
- Unit test: status claim selain `claimed` tetap ditolak.

## Constraints

- Jangan ubah kontrak caller UI.
- Jangan tambah direct write baru ke `campaign_submissions`.
- Perubahan minimal; fokus submit proof creator saja.
