"use client";

import { useCallback, useEffect, useState } from "react";
import { getCreatorActiveWorks } from "@/services/creator/creator-dashboard.service";
import type { CreatorActiveWork } from "@/types/creator-dashboard";
import { PekerjaanAktifView } from "./PekerjaanAktifView";
import { CreatorPageSkeleton } from "./CreatorPageSkeleton";
import { CreatorErrorState } from "./CreatorErrorState";

/** Client shell untuk route Pekerjaan Aktif (s5-ssr-to-client). */
export function PekerjaanAktifPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [works, setWorks] = useState<CreatorActiveWork[]>([]);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    const res = await getCreatorActiveWorks();
    if (!isActive()) return;
    if (!res.success || !res.data) {
      setError(res.error ?? "Gagal memuat pekerjaan aktif.");
      setLoading(false);
      return;
    }
    setWorks(res.data);
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

  if (loading) return <CreatorPageSkeleton showMetrics variant="list" />;
  if (error) {
    return <CreatorErrorState errorMsg={error} onRetry={handleRetry} />;
  }

  return <PekerjaanAktifView initialWorks={works} />;
}
