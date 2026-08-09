"use client";

import { useEffect } from "react";
import { DashboardStateCard } from "@/components/features/dashboard/shared/DashboardStateCard";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UmkmError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error occurred:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <DashboardStateCard
        kind="error"
        title="Terjadi Kesalahan"
        description="Halaman tidak dapat dibuka saat ini. Silakan coba lagi beberapa saat kemudian."
        actionLabel="Coba Lagi"
        onAction={reset}
      />
    </div>
  );
}
