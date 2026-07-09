import { UmkmOverviewClient } from "@/components/features/umkm-dashboard/overview/UmkmOverviewClient";
import { UMKM_DASHBOARD_MOCK_DATA } from "@/data/umkmDashboard";
import type { Campaign, CampaignStatus } from "@/types/umkm-dashboard.types";
import type { UmkmDashboardData } from "@/types/umkmDashboard";

/**
 * Server-side helper: maps mock UmkmDashboardData to Campaign[] format.
 * Runs in Server Component — no JS bundle cost for the browser.
 */
function mapCampaignsFromDashboardData(data: UmkmDashboardData): Campaign[] {
  if (!data.campaign) return [];

  let status: CampaignStatus = "active";
  const rawStatus = data.campaign.status.toLowerCase();
  if (rawStatus.includes("aktif"))  status = "active";
  else if (rawStatus.includes("draft"))  status = "draft";
  else if (rawStatus.includes("penuh"))  status = "full";
  else if (rawStatus.includes("selesai")) status = "completed";
  else if (rawStatus.includes("batal"))  status = "cancelled";

  return [
    {
      id: "campaign-1",
      umkmId: "umkm-1",
      title: data.campaign.title,
      brief: data.campaign.description,
      externalAssetUrl: "",
      thumbnailUrl: data.campaign.imageUrl,
      niche: "kuliner",
      status,
      creatorQuota: data.campaign.targetCreatorsCount,
      usedQuota: data.campaign.activeCreatorsCount,
      pricePerThousandViews: 5000,
      totalBudgetEscrow: data.campaign.budgetTotal,
      usedBudget: data.campaign.budgetUsed,
      totalViews: data.campaign.totalViews,
      createdAt: "2026-07-09T08:00:00Z",
      updatedAt: "2026-07-09T08:00:00Z",
    },
    {
      id: "campaign-2",
      umkmId: "umkm-1",
      title: "Paket Nasi Box Sehat Keluarga",
      brief: "Promosi paket makanan nasi box sehat keluarga daerah Sukabumi.",
      externalAssetUrl: "",
      thumbnailUrl: "",
      niche: "kuliner",
      status: "active",
      creatorQuota: 5,
      usedQuota: 3,
      pricePerThousandViews: 6000,
      totalBudgetEscrow: 2500000,
      usedBudget: 900000,
      totalViews: 92000,
      createdAt: "2026-07-08T08:00:00Z",
      updatedAt: "2026-07-08T08:00:00Z",
    },
    {
      id: "campaign-3",
      umkmId: "umkm-1",
      title: "Fesyen Muslimah Cantik",
      brief: "Promosi hijab dan gamis muslimah modern lokal kualitas butik.",
      externalAssetUrl: "",
      thumbnailUrl: "",
      niche: "fesyen",
      status: "active",
      creatorQuota: 8,
      usedQuota: 5,
      pricePerThousandViews: 7500,
      totalBudgetEscrow: 4500000,
      usedBudget: 1875000,
      totalViews: 128000,
      createdAt: "2026-07-07T08:00:00Z",
      updatedAt: "2026-07-07T08:00:00Z",
    },
  ];
}

export default function UmkmDashboardPage() {
  const data = UMKM_DASHBOARD_MOCK_DATA;
  const mappedCampaigns = mapCampaignsFromDashboardData(data);

  return <UmkmOverviewClient data={data} mappedCampaigns={mappedCampaigns} />;
}
