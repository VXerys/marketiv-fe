/**
 * Kanon Domain Marketiv — Enum & Kontrak Service
 *
 * SATU-SATUNYA sumber nilai status di layer data. Nilai di sini adalah nilai
 * backend Appwrite yang sebenarnya (English lowercase), diambil dari:
 *   - 00_BACKEND/src/services/*.ts  (kode nyata — otoritas tertinggi)
 *   - 00_BACKEND/appwrite.config.json
 *   - docs/audits/umkm-kreator-integration-design-and-rules.md §4
 *
 * ATURAN:
 * - Jangan pernah menyimpan/membandingkan label Bahasa Indonesia ("Aktif",
 *   "Selesai", "MenungguPembayaran") di state atau data. Label hanya di layer
 *   presentasi lewat map status→label.
 * - Jangan menambah nilai yang tidak ada di backend.
 */

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export type UserRole = "umkm" | "creator" | "admin";
export type UserStatus = "active" | "suspended";

// ---------------------------------------------------------------------------
// Campaigns (Campaign Mode / PPV)
// ---------------------------------------------------------------------------
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignType = "ugc" | "clipping";
/** Platform MVP hanya TikTok */
export type CampaignPlatform = "tiktok";

/** campaign_claims.status */
export type ClaimStatus = "claimed" | "submitted" | "approved" | "rejected" | "expired";

/** campaign_submissions.status */
export type SubmissionStatus = "pending" | "approved" | "rejected";
/** campaign_submissions.fraudStatus — field TERPISAH, bukan bagian dari status */
export type FraudStatus = "safe" | "review" | "rejected";

// ---------------------------------------------------------------------------
// Rate Card Mode
// ---------------------------------------------------------------------------
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
export type DeliverableStatus = "submitted" | "revision_requested" | "approved";
export type DeliverableSource = "storage" | "external_url";
export type RevisionStatus = "open" | "resolved";

// ---------------------------------------------------------------------------
// Finansial
// ---------------------------------------------------------------------------
export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";
export type PaymentPurpose = "order" | "topup" | "campaign";
export type EscrowStatus = "held" | "released" | "refunded";
/** Withdrawal langsung processed — tanpa review admin (ADR-008) */
export type WithdrawalStatus = "processed";
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "payment"
  | "refund"
  | "release"
  | "fee";

/**
 * Status yang ditampilkan pada baris transaksi di UI.
 * Gabungan payments.status + escrows.status karena satu baris riwayat bisa
 * berasal dari salah satunya.
 */
export type TransactionStatus = PaymentStatus | EscrowStatus;

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------
export type MessageType = "text" | "offer" | "system";

// ---------------------------------------------------------------------------
// Kontrak service (R3 design doc)
// ---------------------------------------------------------------------------
export type ServiceErrorCode =
  | "validation"
  | "auth"
  | "not_found"
  | "forbidden"
  | "server"
  | "unknown";

export interface ServiceResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  /** UI memetakan code → perilaku. JANGAN mem-parse teks `error`. */
  code?: ServiceErrorCode;
}

// ---------------------------------------------------------------------------
// Konstanta bisnis
// Mirror 00_BACKEND/src/services/wallet.service.ts — jangan hardcode ulang.
// ---------------------------------------------------------------------------
export const PLATFORM_FEE_RATE = 0.05;
export const MINIMUM_WITHDRAW = 50_000;
export const MINIMUM_CAMPAIGN_BUDGET = 50_000;

/** Fee dibulatkan ke bawah, sama seperti backend. */
export const calculatePlatformFee = (nominal: number): number =>
  Math.floor(nominal * PLATFORM_FEE_RATE);

/** Campaign top-up = buyer-side: UMKM membayar budget + fee. */
export const calculateTotalPayment = (nominal: number): number =>
  nominal + calculatePlatformFee(nominal);

/** Rate card order = seller-side: kreator menerima nominal - fee saat release. */
export const calculateCreatorPayout = (nominal: number): number =>
  nominal - calculatePlatformFee(nominal);
