import {
  CampaignStatus,
  CampaignClaimStatus,
  SubmissionStatus,
  RateCardOrderStatus,
  TransactionStatus,
} from "./status";

export interface ServiceResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export type CreatorNiche =
  | "kuliner"
  | "fesyen"
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
  status: CampaignClaimStatus;
  claimedAt: string;
  deadline: string;
  submissionId?: string;
  submissionStatus?: SubmissionStatus;
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
  status: RateCardOrderStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  deliverables?: string;
  revisionCount?: number;
  platformFee?: number;
  totalAmount?: number;
  escrowStatus?: "Pending" | "Escrowed" | "Released" | "Refunded";
  submittedCollabUrl?: string;
}

export interface CreatorRateCardPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  deliverable: string;
  estimatedDays: number;
  isActive: boolean;
  revisionCount?: number;
  platform?: "tiktok" | "instagram" | "youtube" | "all";
}

export interface CreatorTransaction {
  id: string;
  type: "withdrawal" | "payout" | "adjustment" | "escrow_release";
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  referenceId?: string;
  source?: "Campaign" | "Rate Card" | "Withdrawal";
  relatedName?: string;
  notes?: string;
}

export interface CreatorActivity {
  id: string;
  type: "submission_valid" | "payout" | "negotiation_new" | "pending_escrow";
  title: string;
  description: string;
  amount?: number;
  createdAt: string;
}
