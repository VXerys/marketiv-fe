"use client";

import { type ReactNode, useState, useEffect } from "react";
import { DashboardShell } from "@/components/features/dashboard/DashboardShell";
import { CreatorDashboardSidebar } from "./CreatorDashboardSidebar";
import { CreatorDashboardTopbar } from "./CreatorDashboardTopbar";
import { getCreatorProfile } from "@/services/creator-dashboard.service";
import { CreatorProfile } from "@/types/creator-dashboard";

interface CreatorDashboardChromeProps {
  children: ReactNode;
}

export function CreatorDashboardChrome({ children }: CreatorDashboardChromeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const res = await getCreatorProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    }
    loadProfile();
  }, []);

  const creatorName = profile?.name || "Kreator Marketiv";
  const creatorHandle = profile?.username || "creator";
  const creatorAvatar = profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop";

  return (
    <DashboardShell
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      sidebar={
        <CreatorDashboardSidebar
          creatorName={creatorName}
          creatorHandle={creatorHandle}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      }
      topbar={
        <CreatorDashboardTopbar
          creatorName={creatorName}
          creatorAvatar={creatorAvatar}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
