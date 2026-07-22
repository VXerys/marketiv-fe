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
import { formatCompactViews, formatCompactCurrency } from "@/lib/formatters";
import type { UmkmDashboardData } from "@/data/umkmDashboard";
import type { Campaign } from "@/types/umkm-dashboard.types";

interface UmkmOverviewClientProps {
  data: UmkmDashboardData;
  /** Pre-mapped campaign list — dikirim dari Server Component (page.tsx) */
  mappedCampaigns: Campaign[];
}

export function UmkmOverviewClient({ data, mappedCampaigns }: UmkmOverviewClientProps) {
  const router = useRouter();

  const handleCreateCampaign = () => router.push("/dashboard/umkm/campaign/buat");
  const handleSearchCreator  = () => router.push("/dashboard/umkm/kreator");
  const handleViewCampaigns  = () => router.push("/dashboard/umkm/campaign");
  const handleViewFinance    = () => router.push("/dashboard/umkm/keuangan");
  const handleViewAnalytics  = () => router.push("/dashboard/umkm/analitik");

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
              ? formatCompactViews(data.kpis.viewsValid)
              : "2.4jt"
          }
          totalKreator={data.kpis?.creatorJoined}
          danaBerjalan={
            data.kpis?.escrowBalance !== undefined
              ? formatCompactCurrency(data.kpis.escrowBalance)
              : "Rp 12.5 jt"
          }
        />

        {/* KPI metrics row */}
        <KPISection kpisData={data.kpis} />

        {/* Core dashboard layout stacked and grouped */}
        <div className="space-y-6">
          {/* Campaign Section (Full Width) — mappedCampaigns dari Server Component */}
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
