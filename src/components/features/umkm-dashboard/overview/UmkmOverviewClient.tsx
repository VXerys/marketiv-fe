"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { UmkmPageWrapper } from "../shared/UmkmPageWrapper";
import { HeroOverview } from "./HeroOverview";
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
      <UmkmPageWrapper>
        {/* 1. Hero banner with 4 integrated KPI cards */}
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

        {/* 2. Middle Row: Campaign Section (Left 2/3) + Activity Timeline (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <CampaignSection
              campaigns={data.campaigns}
              onCreateClick={handleCreateCampaign}
              onViewAllClick={handleViewCampaigns}
            />
          </div>
          <div className="lg:col-span-1 flex flex-col">
            <ActivityTimeline
              activities={data.activities}
              onViewAllClick={() => router.push("/dashboard/umkm/notifikasi")}
            />
          </div>
        </div>

        {/* 3. Bottom Row: Quick Actions (Col 1) + Financial Overview (Col 2) + Insights (Col 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <QuickActions />
          <FinancialOverview
            escrowBalance={data.kpis?.escrowBalance}
            totalSpend={data.kpis?.totalSpend}
            pendingValidation={data.kpis?.pendingSubmissions}
            onViewFinanceClick={handleViewFinance}
          />
          <InsightSection
            insights={data.insights}
            onSearchCreatorClick={handleSearchCreator}
            onViewAnalyticsClick={handleViewAnalytics}
          />
        </div>
      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
