"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  PlayCircle,
  MessageCircle,
  Tag,
  Wallet,
  Settings,
  LogOut,
  ArrowRight,
  X,
  BadgeCheck,
  HelpCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { LogoutConfirmDialog } from "@/components/features/dashboard/shared/LogoutConfirmDialog";
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
import { getCreatorActiveWorks } from "@/services/creator/creator-dashboard.service";
import type { ClaimStatus } from "@/types/domain";

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
  { label: "Rate Card", href: "/dashboard/kreator/rate-card", icon: Tag },
  { label: "Keuangan", href: "/dashboard/kreator/keuangan", icon: Wallet },
];

interface CreatorDashboardSidebarProps {
  creatorName: string;
  creatorHandle: string;
  isSidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

/**
 * Status klaim yang berarti pekerjaan masih berjalan — plus labelnya.
 * `approved`/`rejected`/`expired` absen: itu pekerjaan yang sudah tutup.
 */
const CLAIM_IN_PROGRESS: Partial<Record<ClaimStatus, string>> = {
  claimed: "Sedang Dikerjakan",
  submitted: "Menunggu Validasi",
};

export function CreatorDashboardSidebar({
  creatorName,
  creatorHandle,
  onCloseSidebar,
}: CreatorDashboardSidebarProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /**
   * Panel "Campaign Aktif".
   *
   * Sebelum `s5-sidebar-fabrikasi`, isinya dua baris hardcode di dalam useState
   * (Dapur Sehat Sukabumi & Sambal Bu Rudi, logo Unsplash) yang tampil di setiap
   * layar — termasuk pada akun kreator yang belum mengklaim apa pun.
   *
   * Sumber nyatanya `campaign_claims` lewat getCreatorActiveWorks().
   */
  const [activeCampaigns, setActiveCampaigns] = useState<Array<{
    businessName: string;
    logoUrl: string;
    campaignTitle: string;
    status: string;
  }>>([]);

  useEffect(() => {
    let active = true;
    void getCreatorActiveWorks().then((res) => {
      if (!active || !res.success || !res.data) return;
      setActiveCampaigns(
        res.data
          .filter((w) => CLAIM_IN_PROGRESS[w.status] !== undefined)
          .slice(0, 5)
          .map((w) => ({
            businessName: w.brandName,
            logoUrl: w.brandAvatar,
            campaignTitle: w.title,
            status: CLAIM_IN_PROGRESS[w.status] as string,
          }))
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Sidebar className="bg-kreator-ink-deep text-white border-r border-white/5 shadow-xl" collapsible="icon">
      {/* Protruding Tab Toggle Button (Shopeers/Dashify Style) — centered vertically on viewport */}
      <button
        onClick={toggleSidebar}
        className="absolute z-50 flex items-center justify-center rounded-r-md cursor-pointer transition-all duration-250 bg-kreator-ink-deep text-white/60 hover:text-white border border-l-0 border-white/5 shadow-[2px_0_8px_rgb(0_0_0_/_0.15)]"
        style={{
          right: "-22px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "22px",
          height: "48px"
        }}
        title={state === "collapsed" ? "Perluas Sidebar" : "Sembunyikan Sidebar"}
      >
        {state === "collapsed" ? (
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        ) : (
          <X className="size-3.5" strokeWidth={2.5} />
        )}
      </button>

      {/* Brand Header */}
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
                "radial-gradient(circle at 35% 25%, rgb(255 255 255 / 0.92) 0 10%, transparent 11%), linear-gradient(135deg, var(--color-kreator-gradient-start), var(--color-kreator-gradient-end))",
              boxShadow: "var(--shadow-kreator-brand)",
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
              Dashboard Kreator
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="px-3 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 !overflow-y-auto custom-sidebar-scrollbar">
        <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
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
                    "relative flex items-center gap-3 min-h-[50px] px-4 rounded-[14px] transition-all duration-200 cursor-pointer overflow-hidden",
                    "group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl",
                    isActive
                      ? "text-white font-bold hover:bg-transparent hover:text-white"
                      : "hover:text-white/90 hover:bg-white/5"
                  )}
                  style={isActive ? {
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--color-kreator-gradient-start) 22%, transparent) 0%, color-mix(in srgb, var(--color-kreator-600) 14%, transparent) 100%)",
                    boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.08), 0 4px 16px color-mix(in srgb, var(--color-kreator-gradient-start) 12%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--color-kreator-gradient-start) 22%, transparent)",
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
                        style={{ background: "linear-gradient(180deg, var(--color-kreator-gradient-start), var(--color-kreator-gradient-end))" }}
                        aria-hidden="true"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "w-5.5 h-5.5 shrink-0 transition-all duration-200",
                        isActive ? "text-blue-400 group-hover:text-blue-400" : "text-white/30 group-hover:text-white/70"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[0.95rem] tracking-[-0.015em] group-data-[collapsible=icon]:hidden transition-colors duration-200",
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
        {activeCampaigns && activeCampaigns.length > 0 && (
          <div className="mt-7 px-3.5 group-data-[collapsible=icon]:hidden">
            <span className="block text-[0.66rem] font-[800] text-white/20 uppercase tracking-widest mb-3 select-none">
              Campaign Aktif Diikuti
            </span>
            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto custom-sidebar-scrollbar pr-0.5">
              {activeCampaigns.slice(0, 5).map((campaign, idx) => (
                <Link
                  key={idx}
                  href="/dashboard/kreator/pekerjaan-aktif"
                  className="flex items-center gap-3 p-2.5 rounded-[16px] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.09] transition-all duration-200 cursor-pointer no-underline group"
                  style={{
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}
                >
                  <div className="relative w-8.5 h-8.5 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-3xs">
                    <img
                      src={campaign.logoUrl}
                      alt={campaign.businessName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-kreator-ink-deep animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[0.82rem] font-bold text-white/85 truncate group-hover:text-white transition-colors duration-150">
                      {campaign.campaignTitle}
                    </span>
                    <span className="block text-[0.64rem] font-semibold text-white/35 truncate mt-0.5">
                      {campaign.businessName}
                    </span>
                    <span className="block text-[0.6rem] font-[750] text-blue-400 mt-0.5">
                      {campaign.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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
            className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-white/45 hover:text-white/80 transition-all duration-150 text-[0.88rem] font-[650] no-underline group"
          >
            <MessageCircle size={19} className="text-white/30 group-hover:text-white/60 transition-colors" />
            <span>Hubungi Admin</span>
          </Link>
          <Link
            href="/dashboard/kreator/panduan"
            className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-white/45 hover:text-white/80 transition-all duration-150 text-[0.88rem] font-[650] no-underline group"
          >
            <HelpCircle size={19} className="text-white/30 group-hover:text-white/60 transition-colors" />
            <span>FAQ & Peraturan</span>
          </Link>
        </div>
      </div>
    </SidebarContent>

    {/* Sidebar Footer */}
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
            className="flex items-center gap-3 min-h-[46px] px-3.5 rounded-[14px] transition-all duration-200 cursor-pointer text-white/30 hover:text-white/80 group-data-[collapsible=icon]:min-h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl"
            style={{ border: "1px solid transparent" }}
          >
            <Link
              href="/dashboard/kreator/settings"
              onClick={onCloseSidebar}
              className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
            >
              <Settings size={20} className="shrink-0" />
              <span className="text-[0.9rem] font-[640] tracking-tight group-data-[collapsible=icon]:hidden">
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
            className="flex items-center gap-3 min-h-[46px] px-3.5 rounded-[14px] transition-all duration-200 cursor-pointer text-red-400/50 hover:text-red-300 hover:bg-red-500/8 group-data-[collapsible=icon]:min-h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-2xl"
            style={{ border: "1px solid transparent" }}
          >
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center bg-transparent border-none outline-none text-left"
            >
              <LogOut size={20} className="shrink-0" />
              <span className="text-[0.9rem] font-[640] tracking-tight group-data-[collapsible=icon]:hidden">
                Keluar
              </span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* User identity strip */}
      <div
        className="flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-[14px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:mt-1 transition-all duration-200 w-full"
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
              "radial-gradient(circle at 36% 28%, rgb(255 255 255 / 0.82) 0 12%, transparent 13%), linear-gradient(135deg, var(--color-kreator-gradient-muted-start), var(--color-kreator-gradient-start))",
            boxShadow: "var(--shadow-kreator-brand-sm)",
          }}
        >
          <span className="font-extrabold text-[.82rem] text-white/90 font-display leading-none group-data-[collapsible=icon]:text-[.88rem]">
            {creatorName.slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <strong
            className="block text-[0.84rem] text-white leading-[1.2] truncate"
            style={{ letterSpacing: "-.02em" }}
          >
            {creatorName}
          </strong>
          <span className="flex items-center gap-1 mt-[2px]">
            <BadgeCheck size={10.5} className="text-emerald-400 shrink-0" />
            <span className="text-[.66rem] font-[650] text-emerald-400/80">
              Kreator Terverifikasi
            </span>
          </span>
        </div>
      </div>
    </SidebarFooter>

      <LogoutConfirmDialog
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        accent="red"
      />
    </Sidebar>
  );
}
