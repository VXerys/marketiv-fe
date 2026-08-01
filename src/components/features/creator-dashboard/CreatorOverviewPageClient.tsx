"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCreatorProfile,
  getCreatorMetrics,
  getCreatorActiveWorks,
  getCreatorActivities,
  getCreatorJobs,
} from "@/services/creator/creator-dashboard.service";
import type {
  CreatorProfile,
  CreatorMetric,
  CreatorActiveWork,
  CreatorActivity,
  CreatorJob,
} from "@/types/creator-dashboard";
import { CreatorDashboardView } from "./CreatorDashboardView";
import { CreatorPageSkeleton } from "./CreatorPageSkeleton";
import { CreatorErrorState } from "./CreatorErrorState";

interface OverviewData {
  profile: CreatorProfile;
  metrics: CreatorMetric;
  activeWorks: CreatorActiveWork[];
  activities: CreatorActivity[];
  recommendedJobs: CreatorJob[];
}

/**
 * Client shell untuk Overview kreator (s5-ssr-to-client).
 *
 * Enam pembacaan sekaligus; profil & metrik adalah isi halaman, sisanya boleh
 * kosong. Sebelumnya keenamnya di-`await` di Server Component, yang berarti
 * enam 401 sekaligus begitu mock dimatikan.
 */
export function CreatorOverviewPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    const [profileRes, metricsRes, worksRes, activityRes, jobsRes] =
      await Promise.all([
        getCreatorProfile(),
        getCreatorMetrics(),
        getCreatorActiveWorks(),
        getCreatorActivities(),
        getCreatorJobs(),
      ]);
    if (!isActive()) return;

    if (!profileRes.success || !profileRes.data || !metricsRes.success || !metricsRes.data) {
      setError(profileRes.error ?? metricsRes.error ?? "Gagal memuat dashboard.");
      setLoading(false);
      return;
    }

    setData({
      profile: profileRes.data,
      metrics: metricsRes.data,
      activeWorks: worksRes.data ?? [],
      activities: activityRes.data ?? [],
      recommendedJobs: jobsRes.data ?? [],
    });
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

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    void fetchData(() => true);
  };

  /**
   * Baca ulang tanpa memunculkan skeleton — dipakai setelah aksi yang mengubah
   * data (klaim campaign). Dashboard menampilkan metrik agregat yang hanya bisa
   * dihitung server, jadi menambal state lokal setelah aksi akan menghasilkan
   * angka yang berbeda dari isi database.
   */
  const handleRefresh = useCallback(async () => {
    await fetchData(() => true);
  }, [fetchData]);

  if (loading) return <CreatorPageSkeleton showMetrics variant="grid" />;
  if (error || !data) {
    return <CreatorErrorState errorMsg={error ?? "Gagal memuat dashboard."} onRetry={handleRetry} />;
  }

  return (
    <CreatorDashboardView
      profile={data.profile}
      metrics={data.metrics}
      activeWorks={data.activeWorks}
      activities={data.activities}
      recommendedJobs={data.recommendedJobs}
      onRefresh={handleRefresh}
    />
  );
}
