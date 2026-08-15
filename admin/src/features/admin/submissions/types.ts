export type SubmissionStatus = "pending" | "approved" | "rejected";

export type SocialPlatform = "tiktok" | "instagram" | "youtube";

export interface CreatorDomain {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  tiktokHandle?: string;
}

export interface UMKMDomain {
  id: string;
  name: string;
  ownerName?: string;
  logoUrl?: string;
}

export interface CampaignDomain {
  id: string;
  title: string;
  rewardPer1000Views: number; // Rate e.g. Rp 10.000 per 1.000 views
  platform: SocialPlatform;
  budgetLimit?: number;
}

export interface CampaignSubmissionDomain {
  id: string;
  campaignId: string;
  creator: CreatorDomain;
  campaign: CampaignDomain;
  umkm: UMKMDomain;
  platform: SocialPlatform;
  postUrl: string;
  note?: string;
  status: SubmissionStatus;
  submittedAt: string;
  
  // Verification details (locked on approval)
  verifiedViews?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  estimatedReward?: number;
  finalReward?: number;
  
  rejectionReason?: string;
}

export interface ReviewApprovePayload {
  submissionId: string;
  verifiedViews: number;
}

export interface ReviewRejectPayload {
  submissionId: string;
  rejectionReason: string;
}

export interface StatusUIConfig {
  label: string;
  badgeVariant: "pending" | "approved" | "rejected";
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  dotColorClass: string;
  description: string;
}
