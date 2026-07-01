# 19 — Frontend Backend Contract

Dokumen ini mendefinisikan boundary implementasi antara frontend, Appwrite client SDK, Appwrite Functions, dan database.

## 1. Core Principle

Frontend boleh membaca data yang permission-nya aman, tetapi semua mutasi sensitif wajib melewati trusted backend/Appwrite Function.

## 2. Frontend May Do

- Read own profile.
- Update non-sensitive profile fields.
- Read own dashboard summary.
- Read active Job Pool campaigns.
- Read own campaign/order/submission/transaction lists.
- Create normal chat message if participant and order status allows.
- Mark own notification as read.
- Start UI flow for payment/withdrawal/dispute via function call.

## 3. Frontend Must Not Do

- Update saldo/dompet_saldo.
- Update payment_status.
- Update transaction status.
- Increment campaign quota.
- Validate submission.
- Release payout.
- Resolve dispute.
- Create admin account.
- Modify role.
- Write audit log manually from client.

## 4. Backend Function Only Operations

- `createProfileAfterRegister`
- `createCampaignPayment`
- `activateCampaignAfterPayment`
- `claimCampaign`
- `submitCampaignProof`
- `validateSubmission`
- `releaseCampaignPayout`
- `createRateCardOrder`
- `sendCustomOffer`
- `acceptCustomOffer`
- `createOrderPayment`
- `activateOrderEscrow`
- `submitCollabPost`
- `completeRateCardOrder`
- `createWithdrawalRequest`
- `processWithdrawal`
- `openDispute`
- `resolveDispute`
- `adminSuspendUser`
- `exportReport`

## 5. DTO Conventions

Gunakan DTO yang eksplisit. Jangan langsung expose seluruh Appwrite document ke UI jika ada field sensitif.

### CampaignCardDTO

```ts
type CampaignCardDTO = {
  id: string
  title: string
  niche: string
  thumbnailUrl?: string
  pricePerThousandViews: number
  quotaTotal: number
  quotaUsed: number
  status: CampaignStatus
  createdAt: string
}
```

### CreatorCardDTO

```ts
type CreatorCardDTO = {
  id: string
  name: string
  niche: string[]
  photoUrl?: string
  city?: string
  startingPrice?: number
  verificationStatus: VerificationStatus
}
```

### TransactionDTO

```ts
type TransactionDTO = {
  id: string
  type: TransactionType
  status: TransactionStatus
  nominal: number
  referenceType: string
  createdAt: string
}
```

## 6. Error Response Convention

```ts
type ApiError = {
  code: string
  message: string
  field?: string
  details?: unknown
}
```

## Query Rules

- Use documented collection names and field names only.
- Validate role before rendering action.
- Validate permission again in backend/function.
- Return typed errors for known business failures.
- Never trust client-provided amount, status, quota, or role.
- Use pagination for lists.
- Use optimistic UI only for reversible non-financial changes.
- Refresh server state after sensitive mutation.
- Log sensitive operation to audit_logs.
- Create notification for user-facing async result.

## Mutation Rules

- Use documented collection names and field names only.
- Validate role before rendering action.
- Validate permission again in backend/function.
- Return typed errors for known business failures.
- Never trust client-provided amount, status, quota, or role.
- Use pagination for lists.
- Use optimistic UI only for reversible non-financial changes.
- Refresh server state after sensitive mutation.
- Log sensitive operation to audit_logs.
- Create notification for user-facing async result.

## Realtime Rules

- Use documented collection names and field names only.
- Validate role before rendering action.
- Validate permission again in backend/function.
- Return typed errors for known business failures.
- Never trust client-provided amount, status, quota, or role.
- Use pagination for lists.
- Use optimistic UI only for reversible non-financial changes.
- Refresh server state after sensitive mutation.
- Log sensitive operation to audit_logs.
- Create notification for user-facing async result.

## Security Rules

- Use documented collection names and field names only.
- Validate role before rendering action.
- Validate permission again in backend/function.
- Return typed errors for known business failures.
- Never trust client-provided amount, status, quota, or role.
- Use pagination for lists.
- Use optimistic UI only for reversible non-financial changes.
- Refresh server state after sensitive mutation.
- Log sensitive operation to audit_logs.
- Create notification for user-facing async result.

## Testing Rules

- Use documented collection names and field names only.
- Validate role before rendering action.
- Validate permission again in backend/function.
- Return typed errors for known business failures.
- Never trust client-provided amount, status, quota, or role.
- Use pagination for lists.
- Use optimistic UI only for reversible non-financial changes.
- Refresh server state after sensitive mutation.
- Log sensitive operation to audit_logs.
- Create notification for user-facing async result.

## AI Coding Assistant Rules

- Use documented collection names and field names only.
- Validate role before rendering action.
- Validate permission again in backend/function.
- Return typed errors for known business failures.
- Never trust client-provided amount, status, quota, or role.
- Use pagination for lists.
- Use optimistic UI only for reversible non-financial changes.
- Refresh server state after sensitive mutation.
- Log sensitive operation to audit_logs.
- Create notification for user-facing async result.

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
