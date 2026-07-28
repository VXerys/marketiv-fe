"use client";

import { useCallback, useEffect, useState } from "react";
import { getCreatorActiveWorkById } from "@/services/creator/creator-dashboard.service";
import type { CreatorActiveWork } from "@/types/creator-dashboard";
import { ActiveWorkDetailView } from "./ActiveWorkDetailView";
import { CreatorPageSkeleton } from "./CreatorPageSkeleton";
import { CreatorErrorState } from "./CreatorErrorState";

/** Client shell untuk detail pekerjaan aktif (s5-ssr-to-client). */
export function ActiveWorkDetailPageClient({ workId }: { workId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [work, setWork] = useState<CreatorActiveWork | null>(null);

  const fetchData = useCallback(
    async (isActive: () => boolean) => {
      const res = await getCreatorActiveWorkById(workId);
      if (!isActive()) return;
      if (!res.success && res.code !== "not_found") {
        setError(res.error ?? "Gagal memuat pekerjaan.");
        setLoading(false);
        return;
      }
      setWork(res.data ?? null);
      setLoading(false);
    },
    [workId]
  );

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

  if (loading) return <CreatorPageSkeleton showMetrics={false} variant="detail" />;
  if (error) {
    return <CreatorErrorState errorMsg={error} onRetry={handleRetry} />;
  }

  return <ActiveWorkDetailView work={work} />;
}
