# 08 — Frontend Data Contract

> Kontrak data untuk Frontend Marketiv.
> Semua DTO camelCase English — cocok dengan output Function backend.
> Source status: `src/types/domain.ts` (kanon). Jangan invent nilai sendiri.
> Source tipe: `src/types/umkm-dashboard.types.ts`, `src/types/creator-dashboard.ts`.

---

## 1. Frontend Principles

1. Frontend hanya kirim intent — backend/Function putuskan validasi, saldo, escrow, payout, status.
2. Frontend tidak invent field di luar dokumen ini.
3. Frontend tidak hardcode enum selain yang tercatat.
4. Frontend wajib punya: loading, empty, error, success state.
5. Frontend mobile-first.
6. Frontend pakai Bahasa Indonesia di UI layer saja — state/data pakai English lowercase.
7. Campaign Mode tidak punya chat.
8. Rate Card Mode satu-satunya mode dengan chat.
9. Data agregasi kompleks berasal dari Function DTO — jangan hitung di klien.

---

## 2. Base API Response

```ts
export interface ApiSuccessDTO<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorDTO {
  success: false;
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResponseDTO<T> = ApiSuccessDTO<T> | ApiErrorDTO;
```

- Tampilkan `message` jika ada.
- `code` boleh di-map ke pesan UI spesifik.
- Jangan tampilkan stack trace / raw payload ke user.

---

## 3. Shared Primitive Types

```ts
export type UserRole = "umkm" | "creator" | "admin";
export type UserStatus = "active" | "suspended";

export type CreatorNiche =
  | "kuliner"
  | "fashion"
  | "pariwisata"
  | "edukasi"
  | "kecantikan"
  | "lainnya";

export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignType = "ugc" | "clipping";
export type CampaignPlatform = "tiktok";

export type ClaimStatus = "claimed" | "submitted" | "approved" | "rejected" | "expired";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type FraudStatus = "safe" | "review" | "rejected";

export type RateCardStatus = "draft" | "published";
export type OfferStatus = "pending" | "accepted" | "rejected";
export type OrderStatus =
  | "pending_payment"
  | "escrow"
  | "in_progress"
  | "revision"
  | "approved"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";
export type PaymentPurpose = "order" | "topup" | "campaign";
export type EscrowStatus = "held" | "released" | "refunded";
export type WithdrawalStatus =
  | "requested"
  | "processing"
  | "succeeded"
  | "failed"
  | "reversed";
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "payment"
  | "refund"
  | "release"
  | "fee";
export type TransactionStatus = PaymentStatus | EscrowStatus;

export type MessageType = "text" | "offer" | "system";
```

Money: integer Rupiah.
Date: ISO string dari backend. UI tampilkan zona Asia/Jakarta.

---

## 4. Auth Session Contract

```ts
export interface AuthSessionDTO {
  userId: string;
  email: string;
  profile: UmkmProfile | CreatorProfile;
}
```

Flow after login:
1. Ambil Appwrite Auth session.
2. Ambil profile dari collection `users` (mirror) + `umkm_profiles` / `creator_profiles`.
3. Jika profile belum ada, panggil `create-user-profile` Function.
4. Jika role `umkm` → redirect `/dashboard/umkm`.
5. Jika role `creator` → redirect `/dashboard/kreator`.
6. Jika role `admin` → redirect `/admin`.
7. Jika `status = suspended` → blokir dashboard.

---

## 5. UMKM Profile DTO

**Function:** `get-umkm-profile`

```ts
export interface UmkmProfile {
  id: string;
  businessName: string;
  ownerName: string;        // dari Auth users.get(name), fallback businessName
  email: string;
  whatsappNumber: string;   // dari users.phone, fallback Auth phone
  location: string;         // umkm_profiles.city
  avatarUrl: string;        // umkm_profiles.logoUrl
  isVerified: boolean;      // umkm_profiles.isProfileCompleted
}
```

Frontend boleh update:
- `businessName`, `location`, `avatarUrl`
- Field profil lainnya lewat service layer

Frontend tidak boleh update:
- `ownerName`, `email`, `whatsappNumber` (sumber: Auth/users mirror)
- `isVerified`

---

## 6. UMKM Dashboard Summary DTO

**Function:** `get-umkm-dashboard-summary`

```ts
export interface UmkmDashboardSummary {
  activeCampaigns: number;
  completedCampaigns: number;
  totalViews: number;           // Σ submission views (rejected excluded)
  totalSpent: number;           // spentAmount + completed order amounts
  escrowBalance: number;        // remainingBudget (active/paused) + held escrows
  pendingSubmissions: number;   // count
  activeNegotiations: number;   // orders not completed/cancelled
  pendingPayments: number;      // count of pending_payment orders
}
```

UI usage:
- Metric cards (4-6 kartu)
- Tidak hitung ulang di klien

---

## 7. Kreator Dashboard — Planned

**Function:** `get-creator-metrics` — **BELUM ADA.** Sementara gunakan `get-creator-directory` untuk data profil dasar + query langsung ke `campaign_claims` dan `orders`.

```ts
// Planned — belum diimplementasikan
export interface CreatorMetric {
  availableJobsCount: number;
  activeJobsCount: number;
  pendingSubmissionsCount: number;
  balance: number;
  pendingPayouts: number;
  validatedViewsCount: number;
  activeRateCardsCount: number;
  negotiationOrdersCount: number;
  escrowBalance: number;
}
```

---

## 8. Campaign — Tipe Status

Semua status lowercase English — lihat `src/types/domain.ts`:

```ts
type CampaignStatus = "draft" | "active" | "paused" | "completed";
type CampaignType = "ugc" | "clipping";
type CampaignPlatform = "tiktok";     // MVP hanya TikTok
```

Label UI (Bahasa Indonesia):
- `draft` → Draft
- `active` → Aktif
- `paused` → Dihentikan
- `completed` → Selesai

---

## 9. Campaign DTO

```ts
export interface Campaign {
  id: string;
  umkmId: string;
  title: string;
  brief: string;               // campaign_briefs.briefDetail
  externalAssetUrl: string;    // campaign_assets.fileUrl (source=external)
  thumbnailUrl: string;
  niche: CreatorNiche;         // campaigns.category
  status: CampaignStatus;
  creatorQuota: number;        // claimLimit
  usedQuota: number;           // totalClaims
  pricePerThousandViews: number; // rewardPer1000Views
  totalBudgetEscrow: number;   // budget
  usedBudget: number;          // spentAmount
  totalViews: number;          // dari submissions
  createdAt: string;
  updatedAt: string;
  // Optional wizard fields
  location?: string;
  videoStyle?: string;
  callToAction?: string;
  hashtags?: string;
  requiredPoints?: string;
  assetNotes?: string;
}
```

---

## 10. Campaign Detail — Planned

**Function:** Belum ada endpoint detail. Sementara compose dari `campaigns` + `campaign_briefs` + `campaign_assets` via service layer.

---

## 11. Campaign Create Payload

```ts
export interface CampaignWizardState {
  // Step 1 — Informasi Produk
  title: string;
  brief: string;
  niche: CreatorNiche | "";
  externalAssetUrl: string;
  // Step 2 — Budget & Kuota
  pricePerThousandViews: number;   // 2000 - 10000
  creatorQuota: number;            // min 1
  totalBudgetEscrow: number;       // > 0
  // Optional wizard fields
  location: string;
  videoStyle: string;
  callToAction: string;
  hashtags: string;
  requiredPoints: string;
  assetNotes: string;
}
```

Frontend validation:
- Title wajib
- Brief min 50 karakter
- Niche wajib
- URL harus HTTPS jika diisi
- File upload max 100MB
- Harga per 1000 views Rp 2.000 - Rp 10.000
- Kuota min 1
- Budget > 0

Submit via service layer → Appwrite SDK langsung (security via permission).

---

## 12. Job Pool — Planned

**Function:** Belum ada. Sementara query `campaigns` collection langsung (`status = "active"`, `remainingBudget > 0`).

---

## 13. Campaign Claim DTO

Collection: `campaign_claims`

```ts
export interface CampaignClaimDTO {
  $id: string;
  campaignId: string;
  creatorId: string;
  status: ClaimStatus;
  claimedAt: string;
  cancelledAt?: string;
  completedAt?: string;
}
```

Frontend action:
- Klaim → `campaigns` document update (via service layer)
- Lihat status klaim

---

## 14. Campaign Submission DTO

Collection: `campaign_submissions`  
**Function (read):** Belum ada endpoint terpisah. Dibaca via query langsung.

```ts
export interface CampaignSubmission {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string;
  platform: CampaignPlatform | "instagram";
  contentUrl: string;
  actualViews: number;
  targetViews: number;
  releasedFund: number;
  validationStatus: SubmissionStatus;
  fraudStatus: FraudStatus;        // field terpisah dari status
  rejectedReason?: string;
  submittedAt: string;
  validatedAt?: string;
}
```

Frontend tidak boleh update:
- `actualViews`
- `validationStatus`
- `fraudStatus`
- `releasedFund`

**AI Fraud Precheck** (otomatis via Function): `ai-fraud-precheck` — trigger on `campaign_submissions.*.create`.

---

## 15. Creator Directory DTO

**Function:** `get-creator-directory`

```ts
export interface CreatorProfile {
  id: string;
  name: string;              // creator_profiles.displayName
  username: string;          // dari social account (TikTok priority)
  avatarUrl: string;
  niche: CreatorNiche;       // creator_profiles.niche, fallback "lainnya"
  bio: string;
  location: string;          // creator_profiles.city
  startingPrice: number;     // termurah dari rate_card_packages.published
  rating: number;            // creator_profiles.rating
  completedJobs: number;     // creator_profiles.totalOrders
  engagementRate: number;    // dari social account
  instagramUrl?: string;
  tiktokUrl?: string;
  isVerified: boolean;       // isProfileCompleted
}
```

Body opsional:
```json
{ "creatorId": "string", "limit": number }
```

Jangan ekspos:
- Nomor WhatsApp
- Saldo kreator
- Data bank

---

## 16. Creator Rate Card DTO

Collections: `rate_cards` + `rate_card_packages`

```ts
export interface RateCardPackage {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  price: number;
  deliverable: string;
  estimatedDays: number;
  status: RateCardStatus;      // "draft" | "published"
}
```

Frontend rule:
- Max 3 published rate cards per creator (backend validasi)
- Draft tidak boleh bocor ke UMKM
- Jangan hard delete — pakai status draft

---

## 17. Negotiation / Order DTO

Collections: `orders` + `offers`  

**Function (read):** Belum ada endpoint terpisah. Baca via query langsung.

```ts
export interface NegotiationOrder {
  id: string;
  umkmId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string;
  projectTitle: string;
  scope: string;
  finalPrice: number;
  deadline: string;
  status: OrderStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
```

Order status flow:
```
pending_payment → escrow → in_progress → revision → approved → completed
                                                              → cancelled
```

---

## 18. Message DTO

Collection: `messages`

```ts
export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: "umkm" | "creator" | "system";
  type: MessageType;
  content: string;
  offerData?: {
    finalPrice: number;
    scope: string;
    deadline: string;
    revisionCount: number;
  };
  isRead: boolean;
  createdAt: string;
}
```

Render rules:
- `text` → normal chat bubble
- `system` → centered system notice
- `offer` → structured offer card
- Jangan render di Campaign Mode

---

## 19. Transaction DTO

Collection: `transactions`  
**Function:** `get-umkm-finance-summary` (agregasi, bukan list)

```ts
export interface Transaction {
  id: string;
  userId: string;
  referenceId: string;
  referenceType: "campaign" | "rate_card";
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  midtransOrderId?: string;
  createdAt: string;
}
```

Jangan ekspos:
- Raw provider payload
- Provider secret
- Internal signature

---

## 20. Finance Summary DTO

**Function:** `get-umkm-finance-summary`

Response: `{ finance: UmkmFinanceSummary, escrow: EscrowOverview }`

```ts
export interface UmkmFinanceSummary {
  totalExpenses: number;
  escrowBalance: number;
  pendingPayments: number;
  refundsReceived: number;
  platformFees: number;
  successfulTransactionsCount: number;
}

export interface EscrowOverview {
  activeEscrow: number;
  pendingRelease: number;
  refundEligible: number;
  campaignEscrow: number;
  rateCardEscrow: number;
}
```

---

## 21. Withdrawal DTO

Collection: `withdrawals`  
**Mutation:** Appwrite Functions only. Browser mengirim intent; backend dan Admin Function menentukan financial state.

```ts
export interface WithdrawalDTO {
  $id: string;
  userId: string;
  amount: number;
  payoutMethod: "bank" | "ewallet";
  providerName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processingAt?: string;
  processedAt?: string;
  processedBy?: string;
  transferReference?: string;
  adminNote?: string;
  failureReason?: string;
  reversedAt?: string;
}
```

Response `request-withdrawal`:

```ts
export interface WithdrawalReceipt {
  success: true;
  withdrawalId: string;
  status: "requested";
  requestedAt: string;
  balanceAfter: number;
  transactionId: string;
}
```

UI wajib memakai `balanceAfter` authoritative dan menampilkan request sebagai pending, bukan transfer sukses.

Frontend form:
- `amount` (min Rp 50.000)
- `payoutMethod`
- `providerName` (bank name)
- `accountNumber`
- `accountName`

---

## 22. Notification DTO

Collection: `notifications`

```ts
export type NotificationType =
  | "campaign_activated"
  | "claim_created"
  | "submission_validated"
  | "payment_success"
  | "offer_received"
  | "order_completed"
  | "withdrawal_success"
  | "dispute_updated"
  | "system";

export interface NotificationDTO {
  $id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
```

Frontend boleh update: `isRead`, `readAt`.  
Frontend tidak boleh create notification langsung.

---

## 23. Page Contract: Campaign Create

Sections:
1. Informasi Produk (title, brief, niche, asset)
2. Budget & Kuota (price, quota, total)
3. Review & Simpan

Required states:
- Validation error
- Save success
- Error save

---

## 24. Page Contract: Job Pool (Planned)

Function `get-job-pool-feed` — **BELUM ADA.**  
Sementara query `campaigns` dengan filter `status = "active"`.

Required:
- Filter niche
- Sort by date / payout
- Pagination cursor

---

## 25. Page Contract: Rate Card Chat

Required data:
- `NegotiationOrder`
- Participant profiles
- `ChatMessage[]`
- Realtime subscription (Appwrite Realtime)

Forbidden:
- Jangan pakai chat di Campaign Mode

---

## 26. Formatting Contract

Money:
```ts
formatRupiah(350000); // "Rp 350.000"
```

Date: `formatDateJakarta(isoString)`

Status badge colors:
- success/approved/completed/paid → green
- pending/escrow/in_progress → amber
- failed/rejected/cancelled → red
- draft → neutral
- active → green

---

## 27. Mutation Boundary

**Wajib panggil Function atau Appwrite SDK langsung (service layer):**

| Action | Mechanism |
|--------|-----------|
| Create campaign | SDK direct write (service layer) |
| Claim campaign | SDK direct update `campaigns` + create `campaign_claims` |
| Submit proof | SDK direct create `campaign_submissions` |
| Create rate card | SDK direct write |
| Send offer | SDK direct create `offers` |
| Accept offer | SDK direct update `offers` |
| Create payment | `create-payment` Function |
| Request withdrawal | Function `request-withdrawal` |
| Read admin withdrawal queue | Function `get-admin-withdrawal-queue` |
| Process/finalize withdrawal | Function `review-withdrawal` |

**Auto-trigger Functions (events):**
- `create-user-profile` → on `users.*.create`
- `create-user-wallet` → on `users.*.create`
- `campaign-published` → on `campaigns.*.update`
- `ai-fraud-precheck` → on `campaign_submissions.*.create`
- `campaign-claimed` → on `campaign_claims.*.create`
- `create-order` → on `offers.*.update`
- `calculate-campaign-reward` → on `campaign_submissions.*.update`
- `create-escrow` → on `payments.*.update`
- `release-escrow` → on `deliverables.*.update`
- `send-chat-notification` → on `messages.*.create`

**May direct write:**
- Profile update (safe fields only)
- Message read state
- Notification read state

---

## 28. Final Rule

Frontend harus predictable, typed, aman.  
Jika data gabungan sulit dapat dengan query sederhana, buat Function DTO baru — jangan hitung di klien.  
Jika field tidak ada di kontrak ini, jangan pakai sebelum dokumentasi diupdate.
