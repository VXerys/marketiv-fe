"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MessageCircle,
  Wallet,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  ArrowRight,
  X,
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
  useSidebar,
} from "@/components/ui/sidebar";


interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard/umkm", icon: LayoutDashboard, exact: true },
  { label: "Campaign", href: "/dashboard/umkm/campaign", icon: Megaphone },
  { label: "Kreator", href: "/dashboard/umkm/kreator", icon: Users },
  { label: "Negosiasi", href: "/dashboard/umkm/negosiasi", icon: MessageCircle },
  { label: "Keuangan", href: "/dashboard/umkm/keuangan", icon: Wallet },
  { label: "Analitik", href: "/dashboard/umkm/analitik", icon: TrendingUp },
];

interface DashboardSidebarProps {
  businessName: string;
  isSidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export function DashboardSidebar({
  businessName,
  onCloseSidebar,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar className="bg-[#0c172b] text-white border-r-0 shadow-[4px_0_32px_rgba(12,23,43,0.18)]" collapsible="icon">
      {/* Brand Header */}
      <SidebarHeader className="relative flex flex-row items-center justify-between gap-3 p-4 border-b border-white/[0.07] min-h-[76px] !overflow-visible group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:justify-center">
        <div
          className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
        >
          <div
            className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-[0_12px_32px_rgba(249,115,22,0.28)] group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:rounded-2xl"
            style={{
              background: "radial-gradient(circle at 35% 25%, rgba(255,255,255,.95) 0 10%, transparent 11%), linear-gradient(135deg, #f97316, #c2410c)",
            }}
          >
            <span className="font-extrabold text-base text-white font-display group-data-[collapsible=icon]:text-lg">M</span>
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <strong className="block text-[1rem] font-extrabold text-white leading-none tracking-tight font-display" style={{ letterSpacing: "-.03em" }}>
              Marketiv
            </strong>
            <span className="block mt-[3px] text-[.68rem] text-white/40 font-semibold truncate">
              Dashboard UMKM
            </span>
          </div>
        </div>

        {/* Protruding Tab Toggle Button (Shopeers/Dashify Style) */}
        <button
          onClick={toggleSidebar}
          className="absolute z-50 flex items-center justify-center rounded-r-md cursor-pointer transition-all duration-250 bg-[#0c172b] text-white/60 hover:text-white border border-l-0 border-white/[0.08] shadow-[2px_0_8px_rgba(0,0,0,0.15)]"
          style={{ right: "-22px", top: "25px", width: "22px", height: "26px" }}
          title={state === "collapsed" ? "Perluas Sidebar" : "Sembunyikan Sidebar"}
        >
          {state === "collapsed" ? (
            <ArrowRight className="size-3" strokeWidth={2.5} />
          ) : (
            <X className="size-3" strokeWidth={2.5} />
          )}
        </button>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "flex items-center gap-3 min-h-[46px] px-[14px] rounded-2xl transition-all duration-200 cursor-pointer",
                    "group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl",
                    isActive
                      ? "text-white font-bold shadow-[0_10px_24px_rgba(249,115,22,0.22)] [background:linear-gradient(135deg,#f97316,#f59e0b)]"
                      : "text-white/40 hover:bg-white/10 hover:text-white/90"
                  )}
                >
                  <Link href={item.href} onClick={onCloseSidebar}>
                    <item.icon className={cn("size-5 shrink-0", isActive ? "text-white" : "text-white/40")} />
                    <span className="text-[.86rem] font-[760] tracking-[-0.015em] group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer — utility links + user */}
      <SidebarFooter className="p-3 border-t border-white/[0.07] gap-1 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:justify-center">
        <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Pengaturan"
              className="text-white/40 hover:bg-white/10 hover:text-white/90 rounded-2xl min-h-[42px] transition-colors cursor-pointer group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl"
            >
              <Link href="/dashboard/umkm/pengaturan" onClick={onCloseSidebar}>
                <Settings className="size-5 shrink-0" />
                <span className="text-[.82rem] font-[720] group-data-[collapsible=icon]:hidden">Pengaturan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Bantuan"
              className="text-white/40 hover:bg-white/10 hover:text-white/90 rounded-2xl min-h-[42px] transition-colors cursor-pointer group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl"
            >
              <Link href="#">
                <HelpCircle className="size-5 shrink-0" />
                <span className="text-[.82rem] font-[720] group-data-[collapsible=icon]:hidden">Bantuan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Keluar"
              className="text-red-400/70 hover:bg-white/5 hover:text-red-300 rounded-2xl min-h-[42px] transition-colors cursor-pointer group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl"
            >
              <Link href="/">
                <LogOut className="size-5 shrink-0" />
                <span className="text-[.82rem] font-[720] group-data-[collapsible=icon]:hidden">Keluar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User identity strip */}
        <div className="flex items-center gap-3 mt-2 px-2 py-3 rounded-2xl overflow-hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:py-3">
          <div
            className="w-10 h-10 shrink-0 rounded-xl shadow-[0_8px_20px_rgba(249,115,22,0.16)] group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:rounded-2xl"
            style={{ background: "radial-gradient(circle at 36% 28%, rgba(255,255,255,.86) 0 12%, transparent 13%), linear-gradient(135deg, #fed7aa, #fb923c)" }}
          />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <strong className="block text-[.84rem] text-white leading-[1.2]" style={{ letterSpacing: "-.02em" }}>
              {businessName}
            </strong>
            <span className="block mt-[2px] text-[.7rem] text-white/40 font-[650]">UMKM Terverifikasi</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
