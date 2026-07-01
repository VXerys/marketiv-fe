"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  PlayCircle,
  MessageCircle,
  User,
  Tag,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface CreatorSidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>; // Use Lucide React icon components
}

const SIDEBAR_ITEMS: CreatorSidebarItem[] = [
  { label: "Overview", href: "/dashboard/kreator", icon: LayoutDashboard },
  { label: "Job Pool", href: "/dashboard/kreator/job-pool", icon: Briefcase },
  { label: "Pekerjaan Aktif", href: "/dashboard/kreator/pekerjaan-aktif", icon: PlayCircle },
  { label: "Negosiasi", href: "/dashboard/kreator/negosiasi", icon: MessageCircle },
  { label: "Profil Saya", href: "/dashboard/kreator/profil", icon: User },
  { label: "Rate Card", href: "/dashboard/kreator/rate-card", icon: Tag },
  { label: "Keuangan", href: "/dashboard/kreator/keuangan", icon: Wallet },
];

interface CreatorDashboardSidebarProps {
  creatorName: string;
  creatorHandle: string;
  isSidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export function CreatorDashboardSidebar({
  creatorName,
  creatorHandle,
  onCloseSidebar,
}: CreatorDashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar className="bg-[#0c172b] text-white border-r border-white/5 shadow-xl" collapsible="icon">
      {/* Brand Header */}
      <SidebarHeader className="flex items-center gap-3 p-4 border-b border-white/5 min-h-[76px] overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.25)] shrink-0">
          <span className="font-extrabold text-lg text-white font-display">M</span>
        </div>
        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
          <h1 className="text-sm font-extrabold text-white leading-none tracking-wide font-display">Marketiv</h1>
          <p className="text-[10px] text-white/40 mt-1 truncate font-semibold uppercase tracking-wider">Kreator: {creatorName}</p>
        </div>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="p-3">
        <SidebarMenu className="gap-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard/kreator"
                ? pathname === "/dashboard/kreator"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-250 cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-md shadow-blue-500/15"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Link href={item.href} onClick={onCloseSidebar}>
                    <item.icon className={cn("size-5", isActive ? "text-white" : "text-white/40")} />
                    <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-3 border-t border-white/5 gap-1.5">
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.06] group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 mb-2 border-b border-white/[0.06] pb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center font-extrabold text-xs text-blue-400 shrink-0">
              {creatorName.substring(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{creatorName}</p>
              <p className="text-[9px] text-white/40 mt-1 truncate font-medium">@{creatorHandle}</p>
            </div>
          </div>
          <Link
            href="/dashboard/kreator/profil"
            className="flex items-center gap-2 text-white/50 hover:text-white py-1.5 transition-colors text-xs font-semibold"
          >
            <Settings className="size-4 text-white/40" />
            <span>Pengaturan</span>
          </Link>
        </div>

        <SidebarMenu className="group-data-[collapsible=icon]:block hidden">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Keluar" className="text-red-300 hover:bg-white/5 hover:text-white rounded-xl">
              <Link href="/">
                <LogOut className="size-5 text-red-400/60" />
                <span className="text-sm font-semibold">Keluar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Link
          href="/"
          className="flex items-center gap-3 text-red-300 hover:text-white px-4 py-2 hover:bg-white/[0.04] rounded-xl transition-colors text-sm font-semibold group-data-[collapsible=icon]:hidden"
        >
          <LogOut className="size-5 text-red-400/60" />
          <span>Keluar</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
