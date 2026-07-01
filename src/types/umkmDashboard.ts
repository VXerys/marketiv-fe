export interface CampaignSummary {
  title: string;
  status: "Aktif" | "Draft" | "Penuh" | "Selesai" | "Dibatalkan";
  description: string;
  totalViews: number;
  viewsTrend: string;
  budgetUsed: number;
  budgetTotal: number;
  activeCreatorsCount: number;
  targetCreatorsCount: number;
  progressPercent: number;
  imageUrl: string;
}

export interface EscrowBalance {
  totalAmount: number;
  infoText: string;
}

export interface SubmissionPending {
  id: string;
  creatorName: string;
  campaignTitle: string;
  platform: "tiktok" | "instagram";
  status: "Pending" | "Valid" | "Invalid";
  timeAgo: string;
}

export interface ChartBarData {
  day: string;
  value: string;
  percent: number;
  active: boolean;
}

export interface UmkmDashboardData {
  businessName: string;
  greeting: string;
  subtitle: string;
  campaign: CampaignSummary;
  escrow: EscrowBalance;
  submissions: SubmissionPending[];
  chartData: ChartBarData[];
}
