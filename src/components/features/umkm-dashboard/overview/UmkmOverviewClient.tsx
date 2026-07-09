"use client";

import { useRouter } from "next/navigation";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { UmkmPageWrapper } from "../shared/UmkmPageWrapper";
import { HeroOverview } from "./HeroOverview";
import { KPISection } from "./KPISection";
import { CampaignSection } from "./CampaignSection";
import { ActivityTimeline } from "./ActivityTimeline";
import { FinancialOverview } from "./FinancialOverview";
import { InsightSection } from "./InsightSection";
import { QuickActions } from "./QuickActions";
import type { UmkmDashboardData } from "@/types/umkmDashboard";
import type { Campaign, CampaignStatus } from "@/types/umkm-dashboard.types";

interface UmkmOverviewClientProps {
  data: UmkmDashboardData;
}

export function UmkmOverviewClient({ data }: UmkmOverviewClientProps) {
  const router = useRouter();

  const getMappedCampaigns = (): Campaign[] => {
    if (!data.campaign) return [];

    let status: CampaignStatus = "active";
    const rawStatus = data.campaign.status.toLowerCase();
    if (rawStatus.includes("aktif")) status = "active";
    else if (rawStatus.includes("draft")) status = "draft";
    else if (rawStatus.includes("penuh")) status = "full";
    else if (rawStatus.includes("selesai")) status = "completed";
    else if (rawStatus.includes("batal")) status = "cancelled";

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
  };

  const handleCreateCampaign = () => router.push("/dashboard/umkm/campaign/buat");
  const handleSearchCreator = () => router.push("/dashboard/umkm/kreator");
  const handleViewCampaigns = () => router.push("/dashboard/umkm/campaign");
  const handleViewFinance = () => router.push("/dashboard/umkm/keuangan");
  const handleViewAnalytics = () => router.push("/dashboard/umkm/analitik");

  const mappedCampaigns = getMappedCampaigns();

  return (
    <UmkmDashboardChrome businessName={data.businessName}>
      {/* UmkmPageWrapper handles responsive padding, 26px gap, and 1400px max-width */}
      <UmkmPageWrapper>
        {/* Hero banner */}
        <HeroOverview
          businessName={data.businessName}
          campaignAktif={data.kpis?.campaignActive}
          totalViews={
            data.kpis?.viewsValid !== undefined
              ? `${(data.kpis.viewsValid / 1_000_000).toFixed(1)}jt`
              : "2.4jt"
          }
          totalKreator={data.kpis?.creatorJoined}
          danaBerjalan={
            data.kpis?.escrowBalance !== undefined
              ? `Rp ${(data.kpis.escrowBalance / 1_000_000).toFixed(1)}jt`
              : "Rp 12.5jt"
          }
        />

        {/* KPI metrics row */}
        <KPISection kpisData={data.kpis} />

        {/*
         * 2-column layout — both columns use align-content: start so cards
         * only take the height they need (no stretching to fill the row).
         * Intentional exception: uses a custom bespoke 1.85fr/1fr split
         * at 1100px that no shared grid class covers.
         */}
        {/* Core dashboard layout stacked and grouped */}
        <div className="space-y-6">
          {/* Campaign Section (Full Width) */}
          <CampaignSection
            campaigns={mappedCampaigns}
            onCreateClick={handleCreateCampaign}
            onViewAllClick={handleViewCampaigns}
          />

          {/* Secondary Grid (Balanced Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Finance & Quick Actions */}
            <div className="space-y-6">
              <FinancialOverview
                escrowBalance={data.kpis?.escrowBalance}
                totalSpend={data.kpis?.totalSpend}
                pendingValidation={data.kpis?.pendingSubmissions}
                onViewFinanceClick={handleViewFinance}
              />
              <QuickActions />
            </div>

            {/* Right Column: Insights & Activity Timeline */}
            <div className="space-y-6">
              <InsightSection
                insights={data.insights}
                onSearchCreatorClick={handleSearchCreator}
                onViewAnalyticsClick={handleViewAnalytics}
              />
              <ActivityTimeline activities={data.activities} />
            </div>
          </div>
        </div>
      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
