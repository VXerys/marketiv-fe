"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

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
      {/* Left: Page title & info */}
      <div className="flex flex-col min-w-0">
        <h1
          className="text-[1.05rem] font-[800] text-ink-900 leading-tight truncate"
          style={{ letterSpacing: "-.03em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <span className="hidden sm:block text-[.74rem] text-ink-500 font-[650] mt-[1.5px] leading-none">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification bell */}
        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100/85 active:scale-95 transition-all duration-200 cursor-pointer bg-white border border-neutral-200/50 shadow-2xs"
          aria-label="Notifikasi"
        >
          <Bell size={18} />
          {/* Unread dot */}
          <span
            className="absolute top-[10px] right-[10px] w-2 h-2 rounded-full border-2 border-white bg-primary"
            aria-hidden="true"
          />
        </button>

        {/* Avatar */}
        <Link
          href="/dashboard/umkm/pengaturan"
          className="w-10 h-10 rounded-full border border-neutral-200/50 shadow-sm overflow-hidden hover:scale-105 active:scale-95 transition-all relative block shrink-0"
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
