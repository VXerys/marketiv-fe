"use client";

import { type ReactNode, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

interface UmkmDashboardChromeProps {
  businessName: string;
  children: ReactNode;
}

export function UmkmDashboardChrome({ businessName, children }: UmkmDashboardChromeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DashboardShell
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      sidebar={
        <DashboardSidebar
          businessName={businessName}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      }
      topbar={<DashboardTopbar onOpenSidebar={() => setIsSidebarOpen(true)} />}
    >
      {children}
    </DashboardShell>
  );
}
