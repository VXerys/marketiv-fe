export interface ServiceResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export type CampaignStatus =
  | "draft"
  | "active"
  | "full"
  | "completed"
  | "cancelled";

export type SubmissionStatus =
  | "pending"
  | "valid"
  | "fraud"
  | "dispute";

export type TransactionStatus =
  | "pending"
  | "escrow"
  | "success"
  | "failed"
  | "refunded";

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "fee"
  | "refund"
  | "payout"
  | "escrow"
  | "pencairan"
  | "adjustment";

export type CreatorNiche =
  | "kuliner"
  | "fesyen"
  | "pariwisata"
  | "edukasi"
  | "kecantikan"
  | "lainnya";

export interface UmkmProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  whatsappNumber: string;
  location: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface Campaign {
  id: string;
  umkmId: string;
  title: string;
  brief: string;
  externalAssetUrl: string;
  thumbnailUrl: string;
  niche: CreatorNiche;
  status: CampaignStatus;
  creatorQuota: number;
  usedQuota: number;
  pricePerThousandViews: number;
  totalBudgetEscrow: number;
  usedBudget: number;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSubmission {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string;
  platform: "tiktok" | "instagram";
  contentUrl: string;
  actualViews: number;
  targetViews: number;
  releasedFund: number;
  validationStatus: SubmissionStatus;
  submittedAt: string;
  validatedAt?: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  niche: CreatorNiche;
  bio: string;
  location: string;
  startingPrice: number;
  rating: number;
  completedJobs: number;
  engagementRate: number;
  instagramUrl?: string;
  tiktokUrl?: string;
  isVerified: boolean;
}

export interface RateCardPackage {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  price: number;
  deliverable: string;
  estimatedDays: number;
  isActive: boolean;
}

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
  status:
    | "negotiation"
    | "waiting_payment"
    | "escrow"
    | "revision"
    | "waiting_verification"
    | "completed"
    | "cancelled"
    | "dispute";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: "umkm" | "creator" | "system";
  type: "text" | "custom_offer" | "system";
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

export interface UmkmDashboardSummary {
  activeCampaigns: number;
  completedCampaigns: number;
  totalViews: number;
  totalSpent: number;
  escrowBalance: number;
  pendingSubmissions: number;
  activeNegotiations: number;
  pendingPayments: number;
}

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

