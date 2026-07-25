"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCreatorMetrics,
  getCreatorRateCardPackages,
} from "@/services/creator/creator-dashboard.service";
import type { CreatorRateCardPackage } from "@/types/creator-dashboard";
import { RateCardView } from "./RateCardView";
import { CreatorPageSkeleton } from "./CreatorPageSkeleton";
import { CreatorErrorState } from "./CreatorErrorState";

/**
 * Client shell untuk route rate-card. Baca dipindah dari Server Component ke
 * useEffect (s3-ssr-session): tanpa session bridge SSR, browser SDK 401 saat
 * mock OFF. Pola loading/error/loadData mengikuti CampaignsPage.
 */
export function RateCardPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<CreatorRateCardPackage[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [packagesRes, metricsRes] = await Promise.all([
      getCreatorRateCardPackages(),
      getCreatorMetrics(),
    ]);
    if (!packagesRes.success || !packagesRes.data) {
      setError(packagesRes.error ?? "Gagal memuat rate card.");
      setLoading(false);
      return;
    }
    setPackages(packagesRes.data);
    setOrdersCount(metricsRes.data?.negotiationOrdersCount ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <CreatorPageSkeleton showMetrics variant="grid" />;
  if (error) return <CreatorErrorState errorMsg={error} onRetry={loadData} />;

  return <RateCardView initialPackages={packages} ordersCount={ordersCount} />;
}
