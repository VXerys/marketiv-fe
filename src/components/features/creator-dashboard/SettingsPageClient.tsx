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

  /** Ambil data; setState hanya di posisi setelah await. */
  const fetchData = useCallback(async (isActive: () => boolean) => {
    let [res, portfolioRes] = await Promise.all([
      getCreatorProfile(),
      getCreatorPortfolio(),
    ]);

    if (!res.success && isActive()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (!isActive()) return;
      res = await getCreatorProfile();
    }

    if (!isActive()) return;
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
    let active = true;
    void (async () => {
      await fetchData(() => active);
    })();
    return () => {
      active = false;
    };
  }, [fetchData]);

  /** Retry dari tombol (event handler — bukan effect body). */
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    void fetchData(() => true);
  };


  if (loading) return <CreatorPageSkeleton showMetrics={false} variant="detail" />;
  if (error || !profile) {
    return <CreatorErrorState errorMsg={error ?? "Gagal memuat profil."} onRetry={handleRetry} />;
  }

  return <SettingsView initialProfile={profile} initialPortfolio={portfolio} />;
}
