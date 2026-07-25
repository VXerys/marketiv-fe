"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCreatorMetrics,
  getCreatorTransactions,
} from "@/services/creator/creator-dashboard.service";
import type { CreatorMetric, CreatorTransaction } from "@/types/creator-dashboard";
import { KeuanganView } from "./KeuanganView";
import { CreatorPageSkeleton } from "./CreatorPageSkeleton";
import { CreatorErrorState } from "./CreatorErrorState";

/**
 * Client shell untuk route keuangan kreator (s3-ssr-session).
 */
export function KeuanganPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CreatorMetric | null>(null);
  const [transactions, setTransactions] = useState<CreatorTransaction[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [metricsRes, txRes] = await Promise.all([
      getCreatorMetrics(),
      getCreatorTransactions(),
    ]);
    if (!metricsRes.success || !metricsRes.data || !txRes.success || !txRes.data) {
      setError(metricsRes.error ?? txRes.error ?? "Gagal memuat data keuangan.");
      setLoading(false);
      return;
    }
    setMetrics(metricsRes.data);
    setTransactions(txRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <CreatorPageSkeleton showMetrics variant="list" />;
  if (error || !metrics) {
    return <CreatorErrorState errorMsg={error ?? "Gagal memuat data keuangan."} onRetry={loadData} />;
  }

  return <KeuanganView metrics={metrics} initialTransactions={transactions} />;
}
