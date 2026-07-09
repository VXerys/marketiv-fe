"use client";

import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
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
  icon: React.ComponentType<{ className?: string; size?: number }>;
  exact?: boolean;
}

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard",  href: "/dashboard/umkm",            icon: LayoutDashboard, exact: true },
  { label: "Campaign",   href: "/dashboard/umkm/campaign",   icon: Megaphone },
  { label: "Kreator",    href: "/dashboard/umkm/kreator",    icon: Users },
  { label: "Negosiasi",  href: "/dashboard/umkm/negosiasi",  icon: MessageCircle },
  { label: "Keuangan",   href: "/dashboard/umkm/keuangan",   icon: Wallet },
  { label: "Analitik",   href: "/dashboard/umkm/analitik",   icon: TrendingUp },
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
  const isCollapsed = state === "collapsed";

  const [activeCampaignCreator, setActiveCampaignCreator] = useState<{
    name: string;
    avatar: string;
    campaignTitle: string;
  } | null>({
    name: "Sulianto Indria Putra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
    campaignTitle: "Rasa Nusantara Food Review"
  });

  return (
    <Sidebar
      className="border-r-0"
      collapsible="icon"
      style={{
        background: "linear-gradient(180deg, #0d1b2e 0%, #0a1525 60%, #091220 100%)",
        boxShadow: "4px 0 40px rgba(0,0,0,.28), 1px 0 0 rgba(255,255,255,.04)",
      }}
    >
      {/* Sidebar collapse toggle tab — centered vertically on viewport */}
      <button
        onClick={toggleSidebar}
        className="absolute z-50 flex items-center justify-center rounded-r-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          right: "-18px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "18px",
          height: "48px",
          background: "linear-gradient(135deg, #1a2d47, #0d1b2e)",
          border: "1px solid rgba(255,255,255,.10)",
          borderLeft: "none",
          boxShadow: "3px 0 12px rgba(0,0,0,.25)",
          color: "rgba(255,255,255,.5)",
        }}
        title={isCollapsed ? "Perluas Sidebar" : "Sembunyikan Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="size-2.5" strokeWidth={2.5} />
        ) : (
          <ChevronLeft className="size-2.5" strokeWidth={2.5} />
        )}
      </button>

      {/* ── Brand Header ──────────────────────────────────────── */}
      <SidebarHeader
        className="relative flex flex-row items-center justify-between gap-3 px-4 py-3.5 min-h-[68px] !overflow-visible"
        style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
      >
        <div className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
          {/* Logo mark */}
          <div
            className="w-9 h-9 rounded-[11px] shrink-0 flex items-center justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:rounded-[13px] transition-all duration-300"
            style={{
              background:
                "radial-gradient(circle at 35% 25%, rgba(255,255,255,.92) 0 10%, transparent 11%), linear-gradient(135deg, #f97316, #c2410c)",
              boxShadow: "0 8px 24px rgba(249,115,22,.32), 0 2px 6px rgba(0,0,0,.2)",
            }}
          >
            <span className="font-extrabold text-[.88rem] text-white font-display group-data-[collapsible=icon]:text-[1rem]">
              M
            </span>
          </div>

          {/* Brand text */}
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <strong
              className="block text-[.96rem] font-extrabold text-white leading-none font-display"
              style={{ letterSpacing: "-.03em" }}
            >
              Marketiv
            </strong>
            <span className="block mt-[3px] text-[.65rem] font-semibold tracking-wide uppercase"
              style={{ color: "rgba(255,255,255,.32)" }}>
              Dashboard UMKM
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Main Navigation ───────────────────────────────────── */}
      <SidebarContent className="px-3 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 !overflow-y-auto custom-sidebar-scrollbar">
        <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
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
                    "relative flex items-center gap-3 min-h-[46px] px-3.5 rounded-[14px] transition-all duration-200 cursor-pointer overflow-hidden",
                    "group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl",
                    isActive
                      ? "text-white font-bold hover:bg-transparent hover:text-white"
                      : "hover:text-white/90 hover:bg-white/5"
                  )}
                  style={isActive ? {
                    background: "linear-gradient(135deg, rgba(249,115,22,.22) 0%, rgba(251,122,24,.14) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 4px 16px rgba(249,115,22,.12)",
                    border: "1px solid rgba(249,115,22,.22)",
                  } : {
                    border: "1px solid transparent",
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={onCloseSidebar}
                    className={cn(
                      "flex items-center gap-3 w-full",
                      "group-data-[collapsible=icon]:justify-center"
                    )}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full group-data-[collapsible=icon]:hidden"
                        style={{ background: "linear-gradient(180deg, #f97316, #fb923c)" }}
                        aria-hidden="true"
                      />
                    )}
                    <item.icon
                      size={20}
                      className={cn(
                        "shrink-0 transition-all duration-200",
                        isActive ? "text-orange-400 group-hover:text-orange-400" : "text-white/30 group-hover:text-white/70"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[0.88rem] tracking-[-0.015em] group-data-[collapsible=icon]:hidden transition-colors duration-200",
                        isActive ? "font-[760] text-white group-hover:text-white" : "font-[640] text-white/45 group-hover:text-white/80"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Section 2: Campaign Aktif Diikuti (Conditional) */}
        {activeCampaignCreator && (
          <div className="mt-7 px-3.5 group-data-[collapsible=icon]:hidden">
            <span className="block text-[0.66rem] font-[800] text-white/20 uppercase tracking-widest mb-3 select-none">
              Campaign Aktif Diikuti
            </span>
            <Link
              href="/dashboard/umkm/negosiasi"
              className="flex items-center gap-3 p-2.5 rounded-[16px] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.09] transition-all duration-200 cursor-pointer no-underline group"
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}
            >
              <div className="relative w-8.5 h-8.5 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-3xs">
                <img
                  src={activeCampaignCreator.avatar}
                  alt={activeCampaignCreator.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#0d1b2e] animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[0.82rem] font-bold text-white/85 truncate group-hover:text-white transition-colors duration-150">
                  {activeCampaignCreator.name}
                </span>
                <span className="block text-[0.64rem] font-semibold text-white/35 truncate mt-0.5">
                  {activeCampaignCreator.campaignTitle}
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Section 3: Support / Bantuan */}
        <div className="mt-7 px-3.5 group-data-[collapsible=icon]:hidden">
          <span className="block text-[0.66rem] font-[800] text-white/20 uppercase tracking-widest mb-2.5 select-none">
            Butuh Bantuan?
          </span>
          <div className="flex flex-col gap-1">
            <Link
              href="#"
              className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-white/45 hover:text-white/80 transition-all duration-150 text-[0.8rem] font-[650] no-underline group"
            >
              <MessageCircle size={17} className="text-white/30 group-hover:text-white/60 transition-colors" />
              <span>Hubungi Admin</span>
            </Link>
            <Link
              href="/dashboard/umkm/panduan"
              className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-white/45 hover:text-white/80 transition-all duration-150 text-[0.8rem] font-[650] no-underline group"
            >
              <HelpCircle size={17} className="text-white/30 group-hover:text-white/60 transition-colors" />
              <span>FaQ & Peraturan</span>
            </Link>
          </div>
        </div>
      </SidebarContent>

      {/* ── Footer — utility + user strip ─────────────────────── */}
      <SidebarFooter
        className="px-3 pb-3 pt-2 gap-0.5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-2 group-data-[collapsible=icon]:items-center"
        style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
      >
        <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
          {/* Pengaturan */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Pengaturan"
              className="flex items-center gap-3 min-h-[42px] px-3.5 rounded-[14px] transition-all duration-200 cursor-pointer text-white/30 hover:text-white/80 group-data-[collapsible=icon]:min-h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl"
              style={{ border: "1px solid transparent" }}
            >
              <Link
                href="/dashboard/umkm/pengaturan"
                onClick={onCloseSidebar}
                className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
              >
                <Settings size={18} className="shrink-0" />
                <span className="text-[.84rem] font-[640] tracking-tight group-data-[collapsible=icon]:hidden">
                  Pengaturan
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Keluar */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Keluar"
              className="flex items-center gap-3 min-h-[42px] px-3.5 rounded-[14px] transition-all duration-200 cursor-pointer text-red-400/50 hover:text-red-300 hover:bg-red-500/8 group-data-[collapsible=icon]:min-h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl"
              style={{ border: "1px solid transparent" }}
            >
              <Link
                href="/"
                className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
              >
                <LogOut size={18} className="shrink-0" />
                <span className="text-[.84rem] font-[640] tracking-tight group-data-[collapsible=icon]:hidden">
                  Keluar
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User identity strip */}
        <div
          className="flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-[14px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:mt-1 transition-all duration-200"
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.07)",
          }}
        >
          {/* Avatar circle with initials */}
          <div
            className="w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:rounded-[13px] transition-all duration-300"
            style={{
              background:
                "radial-gradient(circle at 36% 28%, rgba(255,255,255,.82) 0 12%, transparent 13%), linear-gradient(135deg, #fed7aa, #f97316)",
              boxShadow: "0 4px 12px rgba(249,115,22,.20)",
            }}
          >
            <span className="font-extrabold text-[.82rem] text-white/90 font-display leading-none group-data-[collapsible=icon]:text-[.88rem]">
              {businessName.slice(0, 1).toUpperCase()}
            </span>
          </div>

          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <strong
              className="block text-[0.84rem] text-white leading-[1.2] truncate"
              style={{ letterSpacing: "-.02em" }}
            >
              {businessName}
            </strong>
            <span className="flex items-center gap-1 mt-[2px]">
              <BadgeCheck size={10.5} className="text-emerald-400 shrink-0" />
              <span className="text-[.66rem] font-[650] text-emerald-400/80">
                UMKM Terverifikasi
              </span>
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
