/**
 * Domain Status Types
 *
 * Shared status union types for all Appwrite collections.
 * Matches documented enum values in: docs/marketiv-md/database/02-collections-schema.md
 *
 * IMPORTANT: Do not add undocumented values.
 */

/** campaigns.status */
export type CampaignStatus =
  | "Draft"
  | "MenungguPembayaran"
  | "Aktif"
  | "Penuh"
  | "Selesai"
  | "Dibatalkan"
  | "Dispute";

/** campaigns.payment_status | rate_card_orders.payment_status */
export type PaymentStatus =
  | "Unpaid"
  | "Pending"
  | "Paid"
  | "Failed"
  | "Expired"
  | "Refunded";

/** campaign_claims.status */
export type CampaignClaimStatus = "Aktif" | "Dibatalkan" | "Selesai" | "Dispute";

/** campaign_submissions.status_validasi */
export type SubmissionStatus =
  | "Pending"
  | "Valid"
  | "Fraud"
  | "Dispute"
  | "Rejected";

/** rate_card_orders.status */
export type RateCardOrderStatus =
  | "Negosiasi"
  | "MenungguPembayaran"
  | "Escrow"
  | "Revisi"
  | "MenungguVerifikasi"
  | "Selesai"
  | "Dibatalkan"
  | "Dispute";

/** transactions.status */
export type TransactionStatus =
  | "Pending"
  | "Escrow"
  | "Success"
  | "Failed"
  | "Expired"
  | "Refunded"
  | "Cancelled";

/** withdrawals.status */
export type WithdrawalStatus =
  | "Pending"
  | "Processing"
  | "Success"
  | "Failed"
  | "Rejected"
  | "Cancelled";

/** disputes.status */
export type DisputeStatus =
  | "Open"
  | "UnderReview"
  | "ResolvedForUMKM"
  | "ResolvedForKreator"
  | "Refunded"
  | "Rejected"
  | "Closed";

/** profiles.verification_status */
export type VerificationStatus =
  | "Pending"
  | "Verified"
  | "Rejected"
  | "Suspended";

/** profiles.onboarding_status */
export type OnboardingStatus = "Incomplete" | "Complete";
