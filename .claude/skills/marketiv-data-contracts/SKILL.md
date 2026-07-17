# Skill: marketiv-data-contracts

Kontrak tipe data resmi antara frontend dan backend Marketiv. Gunakan skill ini sebagai referensi saat mengimplementasikan service baru, memetakan dokumen Appwrite, atau memastikan konsistensi tipe antar layer.

---

## Prinsip

- Semua tipe domain didefinisikan di `00_BACKEND/src/services/<module>.service.ts`
- Frontend menggunakan tipe yang sama via re-export atau type import
- Appwrite `$id` selalu dimapping ke `id` di tipe domain kita
- Appwrite `$createdAt`/`$updatedAt` dimapping ke `createdAt`/`updatedAt`
- Field optional di Appwrite (`null`) dimapping ke `undefined` di TypeScript

---

## Pola Mapping Dokumen

```typescript
// Pola standar: Appwrite Document → Domain Type
const mapEntity = (doc: Record<string, any>): Entity => ({
  id: doc.$id,                          // selalu dari $id
  userId: doc.userId,
  someField: doc.someField,
  optionalField: doc.optionalField || undefined,  // null → undefined
  numericField: doc.numericField ?? 0,            // null → 0 untuk numerik
  createdAt: doc.$createdAt,
  updatedAt: doc.$updatedAt,
});
```

---

## Tipe Domain per Module

### Auth / Users

```typescript
// User (mirror Appwrite Auth, collection: users)
type UserRole = 'umkm' | 'creator';
type UserStatus = 'active' | 'suspended' | 'pending_verification';

type AppUser = {
  id: string;           // Appwrite Auth userId = document $id
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  createdAt?: string;
};

// Register inputs (di auth.service.ts)
type RegisterUMKMInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};

type RegisterCreatorInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};
```

### UMKM Profile

```typescript
// collection: umkm_profiles
type UMKMProfile = {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  description?: string;
  city?: string;
  address?: string;
  tiktokHandle?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### Creator Profile

```typescript
// collection: creator_profiles
type CreatorProfile = {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  city?: string;
  avatarUrl?: string;
  totalFollowers: number;
  totalOrders: number;
  rating: number;
  createdAt?: string;
};

// collection: creator_social_accounts
type CreatorSocialAccount = {
  id: string;
  creatorId: string;
  platform: 'tiktok';   // MVP: TikTok only
  username: string;
  followers: number;
  engagementRate: number;
};
```

### Campaigns (PPV Model)

```typescript
// collection: campaigns
type CampaignType = 'ugc' | 'clipping';
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

type Campaign = {
  id: string;
  umkmId: string;
  title: string;
  category: string;
  type: CampaignType;
  platforms: string[];          // MVP: ['tiktok']
  budget: number;               // in Rupiah
  rewardPer1000Views: number;   // CPM in Rupiah
  claimLimit: number;
  submissionDays: number;       // default 7
  totalClaims: number;
  spentAmount: number;
  remainingBudget: number;
  status: CampaignStatus;
  publishedAt?: string;
  createdAt?: string;
};

type CreateCampaignInput = {
  title: string;
  category: string;
  type: CampaignType;
  platforms: string[];
  budget: number;
  rewardPer1000Views: number;
  claimLimit: number;
  submissionDays?: number;
};

// collection: campaign_claims
type ClaimStatus = 'claimed' | 'submitted' | 'approved' | 'rejected' | 'expired';

type CampaignClaim = {
  id: string;
  creatorId: string;
  campaignId: string;
  status: ClaimStatus;
  claimedAt: string;
  submittedAt?: string;
  expiresAt?: string;
};
```

### Rate Cards & Packages

```typescript
// collection: rate_cards
type RateCard = {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  platform: 'tiktok';
  contentType: string;
  isActive: boolean;
  createdAt?: string;
};

// collection: rate_card_packages
type RateCardPackage = {
  id: string;
  rateCardId: string;
  name: string;
  price: number;           // in Rupiah
  revisionLimit: number;
  deliveryDays: number;
  description?: string;
  features: string[];
};
```

### Offers & Negotiations

```typescript
// collection: offers
type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';

type Offer = {
  id: string;
  umkmId: string;
  creatorId: string;
  rateCardId?: string;
  packageId?: string;
  price: number;
  message?: string;
  status: OfferStatus;
  conversationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateOfferInput = {
  creatorId: string;
  rateCardId?: string;
  packageId?: string;
  price: number;
  message?: string;
};
```

### Orders & Deliverables

```typescript
// collection: orders
type OrderStatus =
  | 'pending_payment'
  | 'escrow'
  | 'in_progress'
  | 'revision'
  | 'approved'
  | 'completed'
  | 'cancelled';

type Order = {
  id: string;
  offerId: string;
  packageId?: string;
  creatorId: string;
  umkmId: string;
  amount: number;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};

// collection: deliverables
type DeliverableStatus = 'pending_review' | 'approved' | 'revision_requested' | 'rejected';
type DeliverableSource = 'storage' | 'external_url';

type Deliverable = {
  id: string;
  orderId: string;
  source: DeliverableSource;
  fileUrl?: string;
  fileId?: string;
  notes?: string;
  version: number;
  status: DeliverableStatus;
  createdAt?: string;
};

// collection: revisions
type RevisionStatus = 'open' | 'resolved';

type Revision = {
  id: string;
  orderId: string;
  deliverableId: string;
  requestedBy: string;
  message: string;
  status: RevisionStatus;
  createdAt?: string;
};
```

### Chat & Messages

```typescript
// collection: conversations
type Conversation = {
  id: string;
  umkmId: string;
  creatorId: string;
  offerId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt?: string;
};

// collection: messages
type MessageType = 'text' | 'image' | 'file' | 'offer' | 'system';

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;
  content?: string;
  offerId?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  createdAt?: string;
};

type SendMessageInput = {
  conversationId: string;
  messageType: MessageType;
  content?: string;
  offerId?: string;
};
```

### Wallet & Payments

```typescript
// collection: wallets
type Wallet = {
  id: string;
  userId: string;
  balance: number;        // saldo tersedia (Rupiah)
  pendingBalance: number; // pending dari escrow
  createdAt?: string;
  updatedAt?: string;
};

// collection: transactions
type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'release' | 'fee';

type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  referenceId?: string;
  referenceType?: string;
  status: string;
  createdAt?: string;
};

// collection: withdrawals
type WithdrawPayoutMethod = 'bank' | 'ewallet';
type WithdrawalStatus = 'pending' | 'processed' | 'rejected';

type Withdrawal = {
  id: string;
  userId: string;
  amount: number;
  payoutMethod: WithdrawPayoutMethod;
  providerName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  adminNote?: string;
  rejectionReason?: string;
  processedAt?: string;
  transferProofUrl?: string;
  createdAt?: string;
};

// collection: payments
type PaymentStatus = 'pending' | 'settlement' | 'expire' | 'cancel' | 'deny';
type PaymentPurpose = 'order' | 'topup' | 'campaign';

type Payment = {
  id: string;
  userId: string;
  orderId?: string;
  amount: number;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  snapToken?: string;
  redirectUrl?: string;
  midtransOrderId?: string;
  createdAt?: string;
};

// collection: escrows
type EscrowStatus = 'held' | 'released' | 'refunded';

type Escrow = {
  id: string;
  orderId: string;
  amount: number;
  status: EscrowStatus;
  releasedAt?: string;
};
```

### Notifications

```typescript
// collection: notifications
type NotificationType =
  | 'new_offer' | 'offer_accepted' | 'offer_rejected'
  | 'new_message' | 'new_order' | 'order_approved'
  | 'deliverable_submitted' | 'revision_requested'
  | 'payment_success' | 'withdrawal_processed'
  | 'campaign_claimed' | 'submission_approved';

type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  createdAt?: string;
};
```

---

## ServiceResult<T> — Frontend Pattern

```typescript
// Type yang dipakai di src/services/
type ServiceResult<T> = {
  success: boolean;
  data: T | null;
  error?: string;
};

// Helper untuk membuat hasil sukses:
const ok = <T>(data: T): ServiceResult<T> => ({ success: true, data });

// Helper untuk membuat hasil error:
const fail = (error: string): ServiceResult<never> => ({ success: false, data: null, error });
```

---

## Business Constants

```typescript
// Dari 00_BACKEND/src/services/wallet.service.ts
export const MINIMUM_WITHDRAW = 50_000;          // Rp 50.000
export const MINIMUM_CAMPAIGN_BUDGET = 50_000;   // Rp 50.000
export const PLATFORM_FEE_RATE = 0.05;           // 5%

// Kalkulasi
const fee = Math.floor(amount * PLATFORM_FEE_RATE);
const totalBayar = amount + fee;        // Yang dibayar UMKM
const payoutKreator = amount - fee;     // Yang diterima kreator
```

---

## Lokasi Tipe di Codebase

| Domain | Tipe di Backend | Tipe di Frontend |
|---|---|---|
| Auth | `auth.service.ts` | Diimport dari backend atau redefinisi |
| Campaign | `campaign.service.ts` | `src/types/` (jika ada) |
| Wallet | `wallet.service.ts` | `src/types/` |
| Order | `order.service.ts` | `src/types/` |
| Chat | `chat.service.ts` | `src/types/` |
| Notification | `notification.service.ts` | `src/types/` |
