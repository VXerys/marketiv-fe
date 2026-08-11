"use client";

import { type ReactNode, useState, useEffect } from "react";
import { DashboardShell } from "@/components/features/dashboard/DashboardShell";
import { CreatorDashboardSidebar } from "./CreatorDashboardSidebar";
import { CreatorDashboardTopbar } from "./CreatorDashboardTopbar";
import { CreatorIdentityProvider } from "./CreatorIdentityContext";

interface CreatorDashboardChromeProps {
  children: ReactNode;
}

export function CreatorDashboardChrome({ children }: CreatorDashboardChromeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("theme-kreator");
    return () => {
      document.body.classList.remove("theme-kreator");
    };
  }, []);

  return (
    <CreatorIdentityProvider>
      <DashboardShell
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        variant="kreator"
        sidebar={
          <CreatorDashboardSidebar
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
          />
        }
        topbar={
          <CreatorDashboardTopbar
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        }
      >
        {children}
      </DashboardShell>
    </CreatorIdentityProvider>
  );
}

