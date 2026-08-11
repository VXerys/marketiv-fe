"use client";

import { type ReactNode, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { useUmkmIdentity } from "./UmkmIdentityContext";

interface UmkmDashboardChromeProps {
  businessName?: string;
  isVerified?: boolean;
  children: ReactNode;
}

export function UmkmDashboardChrome({ businessName: propBusinessName, isVerified: propIsVerified, children }: UmkmDashboardChromeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { identity } = useUmkmIdentity();

  const businessName = identity?.businessName || propBusinessName || "";
  const isVerified = identity ? identity.isVerified : (propIsVerified ?? false);
  const avatarUrl = identity?.avatarUrl ?? "";

  return (
    <DashboardShell
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      sidebar={
        <DashboardSidebar
          businessName={businessName}
          isVerified={isVerified}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      }
      topbar={
        <DashboardTopbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          avatarUrl={avatarUrl}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
