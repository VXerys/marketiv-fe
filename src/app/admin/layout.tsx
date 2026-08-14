import React from "react";
import { DashboardLayoutShell } from "@/components/admin/DashboardLayoutShell";
import { fetchDashboardMetrics } from "@/features/admin/dashboard/fixtures/dashboard.fixtures";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metrics = await fetchDashboardMetrics();

  return (
    <DashboardLayoutShell pendingCount={metrics.pendingSubmissionsCount}>
      {children}
    </DashboardLayoutShell>
  );
}
