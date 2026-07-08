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
      className="sticky top-0 z-40 shrink-0 flex items-center justify-between gap-4 px-5 sm:px-7 h-[70px] transition-all"
      style={{
        background: "rgba(255, 253, 249, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(17, 24, 39, 0.08)",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
      }}
    >
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl text-ink-600 hover:bg-ink-100 hover:text-ink-900 border border-transparent hover:border-border-soft transition-all duration-200 cursor-pointer [&_svg]:size-[20px]"
          aria-label="Toggle sidebar"
        />

        {/* Divider */}
        <div className="w-px h-5 bg-border shrink-0" />

        {/* Page title */}
        <div className="flex flex-col min-w-0">
          <h1
            className="text-[1.02rem] font-[800] text-ink-900 leading-tight truncate"
            style={{ letterSpacing: "-.03em" }}
          >
            {title}
          </h1>
          {subtitle && (
            <span className="hidden sm:block text-[.74rem] text-ink-500 font-[650] mt-[1px] leading-none">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification bell */}
        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-2xl border text-ink-600 hover:bg-ink-50 hover:text-ink-900 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm bg-white"
          style={{ borderColor: "rgba(17, 24, 39, 0.10)" }}
          aria-label="Notifikasi"
        >
          <Bell size={18} />
          {/* Unread dot */}
          <span
            className="absolute top-[8px] right-[8px] w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "var(--orange-500, #f97316)" }}
            aria-hidden="true"
          />
        </button>

        {/* CTA — only on md+ */}
        <Link
          href="/dashboard/umkm/campaign/buat"
          className="hidden md:inline-flex items-center gap-1.5 h-10 px-4.5 rounded-2xl text-white text-[.84rem] font-[800] whitespace-nowrap transition-all duration-200 hover:shadow-lg active:scale-[.98] hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, var(--orange-500, #f97316), var(--orange-700, #c2410c))",
            boxShadow: "0 6px 18px rgba(234, 88, 12, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.20)",
            letterSpacing: "-.01em",
          }}
        >
          <Plus size={15} strokeWidth={2.8} />
          Buat Campaign
        </Link>

        {/* Avatar */}
        <Link
          href="/dashboard/umkm/pengaturan"
          className="w-10 h-10 rounded-2xl border-2 border-white overflow-hidden hover:ring-2 hover:ring-orange-500/30 hover:scale-[1.03] transition-all shrink-0 shadow-md"
        >
          <Image
            alt="Profil"
            src={PROFILE_AVATAR_IMAGE_URL}
            width={40}
            height={40}
            sizes="40px"
            quality={85}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
