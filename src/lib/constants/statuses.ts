/**
 * Status Constants
 *
 * All status enum values matching the documented Appwrite collection schemas.
 * Source of truth: docs/marketiv-md/database/02-collections-schema.md
 *
 * IMPORTANT: Do not add undocumented status values.
 * IMPORTANT: Do not change existing values — production data depends on them.
 */

// ---------------------------------------------------------------------------
// Campaign Status
// Ref: campaigns.status
// ---------------------------------------------------------------------------
export const CAMPAIGN_STATUS = {
  DRAFT: "Draft",
  MENUNGGU_PEMBAYARAN: "MenungguPembayaran",
  AKTIF: "Aktif",
  PENUH: "Penuh",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
  DISPUTE: "Dispute",
} as const;

export type CampaignStatus =
  (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];

// ---------------------------------------------------------------------------
// Campaign Payment Status
// Ref: campaigns.payment_status
// ---------------------------------------------------------------------------
export const CAMPAIGN_PAYMENT_STATUS = {
  UNPAID: "Unpaid",
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
} as const;

export type CampaignPaymentStatus =
  (typeof CAMPAIGN_PAYMENT_STATUS)[keyof typeof CAMPAIGN_PAYMENT_STATUS];

// ---------------------------------------------------------------------------
// Campaign Claim Status
// Ref: campaign_claims.status
// ---------------------------------------------------------------------------
export const CAMPAIGN_CLAIM_STATUS = {
  AKTIF: "Aktif",
  DIBATALKAN: "Dibatalkan",
  SELESAI: "Selesai",
  DISPUTE: "Dispute",
} as const;

export type CampaignClaimStatus =
  (typeof CAMPAIGN_CLAIM_STATUS)[keyof typeof CAMPAIGN_CLAIM_STATUS];

// ---------------------------------------------------------------------------
// Submission Validation Status
// Ref: campaign_submissions.status_validasi
// ---------------------------------------------------------------------------
export const SUBMISSION_STATUS = {
  PENDING: "Pending",
  VALID: "Valid",
  FRAUD: "Fraud",
  DISPUTE: "Dispute",
  REJECTED: "Rejected",
} as const;

export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

// ---------------------------------------------------------------------------
// Rate Card Order Status
// Ref: rate_card_orders.status
// ---------------------------------------------------------------------------
export const RATE_CARD_ORDER_STATUS = {
  NEGOSIASI: "Negosiasi",
  MENUNGGU_PEMBAYARAN: "MenungguPembayaran",
  ESCROW: "Escrow",
  REVISI: "Revisi",
  MENUNGGU_VERIFIKASI: "MenungguVerifikasi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
  DISPUTE: "Dispute",
} as const;

export type RateCardOrderStatus =
  (typeof RATE_CARD_ORDER_STATUS)[keyof typeof RATE_CARD_ORDER_STATUS];

// ---------------------------------------------------------------------------
// Order Payment Status
// Ref: rate_card_orders.payment_status
// ---------------------------------------------------------------------------
export const ORDER_PAYMENT_STATUS = {
  UNPAID: "Unpaid",
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
} as const;

export type OrderPaymentStatus =
  (typeof ORDER_PAYMENT_STATUS)[keyof typeof ORDER_PAYMENT_STATUS];

// ---------------------------------------------------------------------------
// Transaction Status
// Ref: transactions.status
// ---------------------------------------------------------------------------
export const TRANSACTION_STATUS = {
  PENDING: "Pending",
  ESCROW: "Escrow",
  SUCCESS: "Success",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
} as const;

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

// ---------------------------------------------------------------------------
// Transaction Type
// Ref: transactions.tipe
// ---------------------------------------------------------------------------
export const TRANSACTION_TYPE = {
  DEPOSIT: "Deposit",
  FEE: "Fee",
  ESCROW: "Escrow",
  PENCAIRAN: "Pencairan",
  REFUND: "Refund",
  WITHDRAWAL: "Withdrawal",
  ADJUSTMENT: "Adjustment",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

// ---------------------------------------------------------------------------
// Withdrawal Status
// Ref: withdrawals.status
// ---------------------------------------------------------------------------
export const WITHDRAWAL_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SUCCESS: "Success",
  FAILED: "Failed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;

export type WithdrawalStatus =
  (typeof WITHDRAWAL_STATUS)[keyof typeof WITHDRAWAL_STATUS];

// ---------------------------------------------------------------------------
// Dispute Status
// Ref: disputes.status
// ---------------------------------------------------------------------------
export const DISPUTE_STATUS = {
  OPEN: "Open",
  UNDER_REVIEW: "UnderReview",
  RESOLVED_FOR_UMKM: "ResolvedForUMKM",
  RESOLVED_FOR_KREATOR: "ResolvedForKreator",
  REFUNDED: "Refunded",
  REJECTED: "Rejected",
  CLOSED: "Closed",
} as const;

export type DisputeStatus =
  (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

// ---------------------------------------------------------------------------
// Profile Verification Status
// Ref: profiles.verification_status
// ---------------------------------------------------------------------------
export const VERIFICATION_STATUS = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// ---------------------------------------------------------------------------
// Profile Onboarding Status
// Ref: profiles.onboarding_status
// ---------------------------------------------------------------------------
export const ONBOARDING_STATUS = {
  INCOMPLETE: "Incomplete",
  COMPLETE: "Complete",
} as const;

export type OnboardingStatus =
  (typeof ONBOARDING_STATUS)[keyof typeof ONBOARDING_STATUS];
