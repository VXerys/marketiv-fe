"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Plus, ChevronRight } from "lucide-react";

const PROFILE_AVATAR_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDJh8BEYVCLcj-BjHUl0GKUwUU0yp9_SB65sdKYxzbuAY-yJMGqbV0NTcoy03pdf7Gq7G3fCt8XLHyNCLfcN3ONcIaSvcJia5eLMQI8_5P9bt9bLx1k-PYinTGRB5RY7ZoL6AzYLgTXS8P7LumfH-nfAwAtWUF5bDgFn5Kio2Vk1NthhmuSRHYqV_bhFB2-KxjJxJ716MpYQqTL5KX76AFPKsUXks7Q-BM5PlUYMSUDzj_2_y1uGXTXvL4yRg4NHCy_Pj6j6rZSIzX";

const BASE = "/dashboard/umkm";

interface PageMeta {
  title: string;
  subtitle: string;
}

function getPageMeta(pathname: string): PageMeta {
  const map: Record<string, PageMeta> = {
    [BASE]: { title: "Dashboard", subtitle: "Ringkasan bisnis Anda" },
    [`${BASE}/campaign`]: { title: "Campaign", subtitle: "Kelola semua campaign" },
    [`${BASE}/campaign/buat`]: { title: "Buat Campaign", subtitle: "Wizard pembuatan campaign" },
    [`${BASE}/kreator`]: { title: "Kreator", subtitle: "Temukan & kelola kreator" },
    [`${BASE}/negosiasi`]: { title: "Negosiasi", subtitle: "Kelola penawaran & negosiasi" },
    [`${BASE}/keuangan`]: { title: "Keuangan", subtitle: "Transaksi & escrow" },
    [`${BASE}/analitik`]: { title: "Analitik", subtitle: "Performa & insight" },
    [`${BASE}/pengaturan`]: { title: "Pengaturan", subtitle: "Profil & konfigurasi akun" },
  };
  if (map[pathname]) return map[pathname];
  if (new RegExp(`^${BASE}/campaign/[^/]+$`).test(pathname))
    return { title: "Detail Campaign", subtitle: "Informasi lengkap campaign" };
  if (new RegExp(`^${BASE}/kreator/[^/]+$`).test(pathname))
    return { title: "Profil Kreator", subtitle: "Detail informasi kreator" };
  if (new RegExp(`^${BASE}/negosiasi/[^/]+$`).test(pathname))
    return { title: "Ruang Negosiasi", subtitle: "Detail sesi negosiasi" };
  return { title: "Marketiv", subtitle: "" };
}

interface DashboardTopbarProps {
  onOpenSidebar?: () => void;
}

export function DashboardTopbar({}: DashboardTopbarProps) {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <header
      className="sticky top-0 z-40 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 h-[60px]"
      style={{
        background: "rgba(255,250,243,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(17,24,39,0.07)",
        boxShadow: "0 1px 0 rgba(17,24,39,0.04)",
      }}
    >
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[#556174] hover:bg-[rgba(17,24,39,0.06)] hover:text-[#182033] transition-colors cursor-pointer [&_svg]:size-[18px]"
          aria-label="Toggle sidebar"
        />

        {/* Divider */}
        <div className="w-px h-5 bg-[rgba(17,24,39,0.10)] shrink-0" />

        {/* Page title */}
        <div className="flex flex-col min-w-0">
          <h1
            className="text-[.95rem] font-[740] text-[#182033] leading-none truncate"
            style={{ letterSpacing: "-.028em" }}
          >
            {title}
          </h1>
          {subtitle && (
            <span className="hidden sm:block text-[.7rem] text-[#a0aaba] font-[600] mt-[2px] leading-none">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-xl border text-[#556174] hover:bg-[rgba(17,24,39,0.06)] hover:text-[#182033] transition-colors cursor-pointer"
          style={{ borderColor: "rgba(17,24,39,0.09)", background: "rgba(255,255,255,0.6)" }}
          aria-label="Notifikasi"
        >
          <Bell size={16} />
          {/* Unread dot */}
          <span
            className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full border border-[#fffaf3]"
            style={{ background: "#f97316" }}
            aria-hidden="true"
          />
        </button>

        {/* CTA — only on md+ */}
        <Link
          href="/dashboard/umkm/campaign/buat"
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-white text-[.82rem] font-[760] whitespace-nowrap transition-all hover:brightness-110 active:scale-[.98]"
          style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            boxShadow: "0 4px 14px rgba(234,88,12,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
            letterSpacing: "-.01em",
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Buat Campaign
        </Link>

        {/* Avatar */}
        <Link
          href="/dashboard/umkm/pengaturan"
          className="w-8 h-8 rounded-full border-2 border-white overflow-hidden hover:ring-2 hover:ring-orange-400/40 transition-all shrink-0"
          style={{ boxShadow: "0 2px 8px rgba(16,32,51,0.12)" }}
        >
          <Image
            alt="Profil"
            src={PROFILE_AVATAR_IMAGE_URL}
            width={32}
            height={32}
            sizes="32px"
            quality={80}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
