"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCreatorPortfolio,
  getCreatorProfile,
} from "@/services/creator/creator-dashboard.service";
import type { CreatorProfile, CreatorPortfolioItem } from "@/types/creator-dashboard";
import { SettingsView } from "./SettingsView";
import { CreatorPageSkeleton } from "./CreatorPageSkeleton";
import { CreatorErrorState } from "./CreatorErrorState";

/**
 * Client shell untuk route settings kreator (s3-ssr-session).
 */
export function SettingsPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [portfolio, setPortfolio] = useState<CreatorPortfolioItem[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [res, portfolioRes] = await Promise.all([
      getCreatorProfile(),
      getCreatorPortfolio(),
    ]);
    if (!res.success || !res.data) {
      setError(res.error ?? "Gagal memuat profil.");
      setLoading(false);
      return;
    }
    setProfile(res.data);
    setPortfolio(portfolioRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <CreatorPageSkeleton showMetrics={false} variant="detail" />;
  if (error || !profile) {
    return <CreatorErrorState errorMsg={error ?? "Gagal memuat profil."} onRetry={loadData} />;
  }

  return <SettingsView initialProfile={profile} initialPortfolio={portfolio} />;
}
