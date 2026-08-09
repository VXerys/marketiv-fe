"use client";

import { useCallback, useEffect, useState } from "react";
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
import { getOverview } from "@/services/umkm/umkm-dashboard.service";
import type { UmkmOverviewData } from "@/types/umkm-dashboard.types";
import { UmkmPageSkeleton } from "../shared/UmkmPageSkeleton";

/**
 * Overview UMKM.
 *
 * Data diambil DI SINI, bukan di Server Component. Function DTO menegakkan
 * kepemilikan lewat header `x-appwrite-user-id` sesi aktif, dan sesi Appwrite
 * hidup di klien — memanggilnya dari server selalu balik 401 (pelajaran
 * `s3-ssr-session`, dituntaskan di `s5-ssr-to-client`).
 */
export function UmkmOverviewClient() {
  const router = useRouter();

  const [data, setData] = useState<UmkmOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getOverview().then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          setLoadError(null);
        } else {
          setData(null);
          setLoadError(res.error ?? "Gagal memuat ringkasan dashboard.");
        }
        setIsLoading(false);
      }),
    []
  );

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateCampaign = () => router.push("/dashboard/umkm/campaign/buat");
  const handleSearchCreator  = () => router.push("/dashboard/umkm/kreator");
  const handleViewCampaigns  = () => router.push("/dashboard/umkm/campaign");
  const handleViewFinance    = () => router.push("/dashboard/umkm/keuangan");
  const handleViewAnalytics  = () => router.push("/dashboard/umkm/analitik");

  if (isLoading) {
    return (
      <UmkmDashboardChrome businessName="">
        <UmkmPageSkeleton />
      </UmkmDashboardChrome>
    );
  }

  if (!data) {
    return (
      <UmkmDashboardChrome businessName="">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-text-secondary">{loadError}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              void load();
            }}
            className="text-sm font-bold text-primary-600 underline underline-offset-2 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      </UmkmDashboardChrome>
    );
  }

  return (
    <UmkmDashboardChrome businessName={data.businessName}>
      {/* UmkmPageWrapper handles responsive padding, 26px gap, and 1400px max-width */}
      <UmkmPageWrapper>
        {/* Hero banner. Tanpa angka → strip, bukan "2.4jt"/"Rp 12.5 jt" karangan
            yang dulu tampil kalau data gagal dibaca. */}
        <HeroOverview
          businessName={data.businessName}
          campaignAktif={data.kpis?.campaignActive}
          totalViews={
            data.kpis?.viewsValid !== undefined
              ? formatCompactViews(data.kpis.viewsValid)
              : "—"
          }
          totalKreator={data.kpis?.creatorJoined}
          danaBerjalan={
            data.kpis?.escrowBalance !== undefined
              ? formatCompactCurrency(data.kpis.escrowBalance)
              : "—"
          }
        />

        {/* KPI metrics row */}
        <KPISection kpisData={data.kpis} />

        {/* Core dashboard layout stacked and grouped */}
        <div className="space-y-6">
          {/* Campaign Section (Full Width) */}
          <CampaignSection
            campaigns={data.campaigns}
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
