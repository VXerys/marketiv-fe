"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface DashboardLayoutShellProps { children: React.ReactNode; }

export function DashboardLayoutShell({ children }: DashboardLayoutShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#F7F3EE]">
      {/* Fixed Admin Sidebar (Desktop & Mobile Drawer) */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Column Wrapper */}
      <div className="flex flex-1 flex-col h-full min-w-0 max-w-full overflow-hidden">
        {/* Permanently Fixed Non-Scrolling Admin Header */}
        <div className="shrink-0 w-full z-30">
          <AdminHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
        </div>

        {/* Scrollable Main Content Workspace with responsive horizontal & vertical padding */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
