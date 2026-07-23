/**
 * Tipe view-model dashboard Kreator.
 *
 * Semua nilai status di-reexport dari kanon `@/types/domain` — jangan
 * mendefinisikan ulang union status di file ini.
 */
import type {
  CampaignStatus,
  ClaimStatus,
  SubmissionStatus,
  FraudStatus,
  OrderStatus,
  EscrowStatus,
  RateCardStatus,
  TransactionStatus,
  TransactionType,
} from "./domain";

export type {
  ServiceResult,
  ServiceErrorCode,
  CampaignStatus,
  ClaimStatus,
  SubmissionStatus,
  FraudStatus,
  OrderStatus,
  EscrowStatus,
  RateCardStatus,
  TransactionStatus,
  TransactionType,
} from "./domain";

export type CreatorNiche =
  | "kuliner"
  | "fashion"
  | "pariwisata"
  | "edukasi"
  | "kecantikan"
  | "lainnya";

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  niche: CreatorNiche;
  bio: string;
  location: string;
  followers: number;
  startingPrice: number;
  rating: number;
  completedJobs: number;
  engagementRate: number;
  instagramUrl?: string;
  tiktokUrl?: string;
  isVerified: boolean;
  isOnboarded: boolean;
  bannerUrl?: string;
  averageViews?: number;
  responseTime?: string;
  completionRate?: number;
  portfolioUrl?: string;
}

export interface CreatorPortfolioItem {
  id: string;
  title: string;
  platform: "tiktok" | "instagram";
  url: string;
  niche: CreatorNiche;
  views: number;
  thumbnailUrl?: string;
  description: string;
}

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
  totalEarnings?: number;
  thisMonthEarnings?: number;
  campaignEarnings?: number;
  rateCardEarnings?: number;
}

export interface CreatorJob {
  id: string;
  title: string;
  brandName: string;
  brandAvatar: string;
  brief: string;
  niche: CreatorNiche;
  quota: number;
  usedQuota: number;
  ratePerThousandViews: number;
  status: CampaignStatus;
  totalBudget: number;
  createdAt: string;
  // Detail brief fields
  targetViews?: number;
  productDescription?: string;
  contentInstruction?: string;
  doAndDont?: {
    do: string[];
    dont: string[];
  };
  targetAudience?: string;
  ctaInstruction?: string;
  externalAssetUrl?: string;
  thumbnailUrl?: string;
}

export interface CreatorActiveWork {
  id: string; // claimId
  campaignId: string;
  title: string;
  brandName: string;
  brandAvatar: string;
  brief: string;
  ratePerThousandViews: number;
  /** campaign_claims.status kanon */
  status: ClaimStatus;
  claimedAt: string;
  deadline: string;
  submissionId?: string;
  submissionStatus?: SubmissionStatus;
  /** hasil ai-fraud-precheck — terpisah dari submissionStatus */
  fraudStatus?: FraudStatus;
  contentUrl?: string;
  actualViews?: number;
  earnings?: number;
  platform?: "tiktok" | "instagram";
  notes?: string;
  submittedAt?: string;
  validatedAt?: string;
  rejectedReason?: string;
}

export interface CreatorSubmission {
  id: string;
  campaignId: string;
  claimId: string;
  platform: "tiktok" | "instagram";
  contentUrl: string;
  actualViews: number;
  status: SubmissionStatus;
  fraudStatus?: FraudStatus;
  submittedAt: string;
  validatedAt?: string;
  earnings: number;
}

export interface CreatorNegotiation {
  id: string; // orderId
  umkmId: string;
  umkmName: string;
  umkmAvatarUrl: string;
  projectTitle: string;
  scope: string;
  finalPrice: number;
  deadline: string;
  /** orders.status kanon */
  status: OrderStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  deliverables?: string;
  revisionCount?: number;
  platformFee?: number;
  totalAmount?: number;
  /** escrows.status kanon */
  escrowStatus?: EscrowStatus;
  submittedCollabUrl?: string;
}

export interface CreatorRateCardPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  deliverable: string;
  estimatedDays: number;
  /** rate_cards.status — bukan boolean isActive */
  status: RateCardStatus;
  revisionCount?: number;
  platform?: "tiktok" | "instagram" | "youtube" | "all";
}

export interface CreatorTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  referenceId?: string;
  source?: "Campaign" | "Rate Card" | "Withdrawal";
  relatedName?: string;
  notes?: string;
}

/**
 * Empat nilai pertama adalah kategori tampilan yang sudah punya warna & label di
 * CreatorDashboardView. Sisanya adalah nilai `notifications.type` yang benar-benar
 * ditulis backend dan tidak punya padanan — diteruskan apa adanya, dan UI
 * menampilkannya sebagai "INFO" lewat cabang default-nya.
 */
export type CreatorActivityType =
  | "submission_valid"
  | "payout"
  | "negotiation_new"
  | "pending_escrow"
  | "claim"
  | "claim_expired"
  | "campaign_published";

export interface CreatorActivity {
  id: string;
  type: CreatorActivityType;
  title: string;
  description: string;
  amount?: number;
  createdAt: string;
}
