import { UmkmDashboardSummary } from "@/types/umkm-dashboard.types";
import { mockCampaigns } from "./campaigns.mock";
import { mockSubmissions } from "./submissions.mock";
import { mockNegotiations } from "./negotiations.mock";

export function getCalculatedDashboardSummary(): UmkmDashboardSummary {
  const activeCampaigns = mockCampaigns.filter((c) => c.status === "active").length;
  const completedCampaigns = mockCampaigns.filter((c) => c.status === "completed").length;
  
  // Sum views across campaigns
  const totalViews = mockCampaigns.reduce((sum, c) => sum + c.totalViews, 0);

  // Spent budget from campaigns
  const campaignSpent = mockCampaigns.reduce((sum, c) => sum + c.usedBudget, 0);
  // Spent budget from completed rate card orders
  const rateCardSpent = mockNegotiations
    .filter((n) => n.status === "completed")
    .reduce((sum, n) => sum + n.finalPrice, 0);
  const totalSpent = campaignSpent + rateCardSpent;

  // Escrow balance: campaigns remaining budget + rate cards currently in escrow/revision/waiting_verification
  const campaignEscrow = mockCampaigns
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + (c.totalBudgetEscrow - c.usedBudget), 0);
  const rateCardEscrow = mockNegotiations
    .filter((n) => n.status === "escrow" || n.status === "in_progress" || n.status === "revision" || n.status === "approved")
    .reduce((sum, n) => sum + n.finalPrice, 0);
  const escrowBalance = campaignEscrow + rateCardEscrow;

  const pendingSubmissions = mockSubmissions.filter((s) => s.validationStatus === "pending").length;
  // Order yang masih berjalan (belum completed/cancelled) dihitung sebagai negosiasi aktif
  const activeNegotiations = mockNegotiations.filter(
    (n) => n.status !== "completed" && n.status !== "cancelled"
  ).length;
  const pendingPayments = mockNegotiations.filter((n) => n.status === "pending_payment").length;

  return {
    activeCampaigns,
    completedCampaigns,
    totalViews,
    totalSpent,
    escrowBalance,
    pendingSubmissions,
    activeNegotiations,
    pendingPayments,
  };
}
