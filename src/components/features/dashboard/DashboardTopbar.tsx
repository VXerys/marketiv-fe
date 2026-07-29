"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { getNotifications } from "@/services/shared/notification.service";
import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { realtimeClient } from "@/lib/appwrite/realtime";

const PROFILE_AVATAR_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDJh8BEYVCLcj-BjHUl0GKUwUU0yp9_SB65sdKYxzbuAY-yJMGqbV0NTcoy03pdf7Gq7G3fCt8XLHyNCLfcN3ONcIaSvcJia5eLMQI8_5P9bt9bLx1k-PYinTGRB5RY7ZoL6AzYLgTXS8P7LumfH-nfAwAtWUF5bDgFn5Kio2Vk1NthhmuSRHYqV_bhFB2-KxjJxJ716MpYQqTL5KX76AFPKsUXks7Q-BM5PlUYMSUDzj_2_y1uGXTXvL4yRg4NHCy_Pj6j6rZSIzX";

const BASE = "/dashboard/umkm";

interface PageMeta {
  title: string;
  subtitle: string;
}

function getPageMeta(pathname: string): PageMeta {
  const map: Record<string, PageMeta> = {
    [BASE]:                      { title: "Dashboard",   subtitle: "Ringkasan bisnis Anda" },
    [`${BASE}/campaign`]:        { title: "Campaign",    subtitle: "Kelola semua campaign" },
    [`${BASE}/campaign/buat`]:   { title: "Buat Campaign", subtitle: "Wizard pembuatan campaign" },
    [`${BASE}/kreator`]:         { title: "Kreator",     subtitle: "Temukan & kelola kreator" },
    [`${BASE}/negosiasi`]:       { title: "Negosiasi",   subtitle: "Kelola penawaran & negosiasi" },
    [`${BASE}/keuangan`]:        { title: "Keuangan",    subtitle: "Transaksi & escrow" },
    [`${BASE}/analitik`]:        { title: "Analitik",    subtitle: "Performa & insight" },
    [`${BASE}/pengaturan`]:      { title: "Pengaturan",  subtitle: "Profil & konfigurasi akun" },
    [`${BASE}/panduan`]:         { title: "FAQ & Rules", subtitle: "Kebijakan & bantuan platform" },
    [`${BASE}/notifikasi`]:      { title: "Notifikasi",  subtitle: "Pusat notifikasi akun" },
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

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/dashboard/umkm" }];
  
  if (parts.length <= 2) {
    return items;
  }
  
  const mainModule = parts[2];
  const labelMap: Record<string, string> = {
    campaign: "Campaign",
    kreator: "Direktori Kreator",
    negosiasi: "Negosiasi",
    keuangan: "Keuangan",
    analitik: "Analitik",
    pengaturan: "Pengaturan",
    panduan: "FAQ & Rules",
    notifikasi: "Notifikasi",
  };
  
  if (labelMap[mainModule]) {
    items.push({ 
      label: labelMap[mainModule], 
      href: `/dashboard/umkm/${mainModule}` 
    });
  } else {
    items.push({ 
      label: mainModule.charAt(0).toUpperCase() + mainModule.slice(1)
    });
  }
  
  if (parts.length > 3) {
    const subModule = parts[3];
    if (subModule === "buat") {
      items.push({ label: "Buat Baru" });
    } else {
      if (mainModule === "campaign") {
        items.push({ label: "Detail" });
      } else if (mainModule === "kreator") {
        items.push({ label: "Profil" });
      } else if (mainModule === "negosiasi") {
        items.push({ label: "Detail" });
      } else {
        items.push({ label: "Detail" });
      }
    }
  }
  
  return items;
}

interface DashboardTopbarProps {
  onOpenSidebar?: () => void;
}

export function DashboardTopbar({}: DashboardTopbarProps) {
  const pathname = usePathname();
  const { title } = getPageMeta(pathname);
  const { toggleSidebar } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(() => {
    void getNotifications("umkm").then((result) => {
      if (result.success && result.data) {
        setUnreadCount(result.data.filter((notification) => !notification.isRead).length);
      }
    });
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    if (DATA_SOURCE_CONFIG.useMockData) return;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    if (!databaseId) return;

    return realtimeClient.subscribe(
      `databases.${databaseId}.collections.notifications.documents`,
      () => loadUnreadCount()
    );
  }, [loadUnreadCount]);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header
      className="sticky top-0 z-40 shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-[80px]"
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(17, 24, 39, 0.05)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.02), 0 1px 0 rgba(17, 24, 39, 0.03)",
      }}
    >
      {/* ── Left side ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">

        {/* Mobile hamburger — hidden on md+ (sidebar always visible there) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden w-10.5 h-10.5 flex items-center justify-center rounded-xl text-ink-600 hover:bg-neutral-100/80 active:scale-95 transition-all duration-150 cursor-pointer shrink-0 border border-neutral-200/60 bg-white/70 shadow-3xs"
          aria-label="Buka menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* Mobile: Marketiv brand mark */}
        <div className="flex items-center gap-2.5 md:hidden min-w-0">
          <div
            className="w-9 h-9 rounded-[11px] shrink-0 flex items-center justify-center shadow-[0_6px_16px_rgba(249,115,22,.24)]"
            style={{
              background:
                "radial-gradient(circle at 35% 25%, rgba(255,255,255,.9) 0 9%, transparent 10%), linear-gradient(135deg, #f97316, #c2410c)",
            }}
          >
            <span className="font-extrabold text-[.85rem] text-white font-display">M</span>
          </div>
          <div className="min-w-0">
            <strong className="block text-[.92rem] font-extrabold text-ink-900 leading-none tracking-[-0.03em] font-display truncate">
              Marketiv
            </strong>
            <span className="block text-[.68rem] text-ink-400 font-semibold mt-px leading-none truncate">
              {title}
            </span>
          </div>
        </div>

        {/* Desktop: Breadcrumbs navigation */}
        <nav className="hidden md:flex items-center gap-2 text-[0.84rem] font-bold text-neutral-400 select-none">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-neutral-300 font-medium">/</span>}
                {isLast ? (
                  <span className="text-ink-900 font-extrabold tracking-tight">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="hover:text-ink-900 transition-colors duration-150 no-underline"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Right: actions ────────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification bell */}
        <Link
          href="/dashboard/umkm/notifikasi"
          className="relative w-11 h-11 flex items-center justify-center rounded-xl text-ink-500 hover:bg-neutral-100 hover:text-ink-800 active:scale-95 transition-all duration-150 cursor-pointer border border-neutral-200/60 bg-white/70 shadow-3xs hover:shadow-2xs"
          aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
        >
          <Bell size={20} strokeWidth={2} />
          {/* Unread dot */}
          {unreadCount > 0 && (
            <span
              className="absolute top-[12px] right-[12px] w-[8px] h-[8px] rounded-full border-[1.5px] border-white bg-primary shadow-[0_0_0_1px_rgba(249,115,22,.25)]"
              aria-hidden="true"
            />
          )}
        </Link>

        {/* Avatar */}
        <Link
          href="/dashboard/umkm/pengaturan"
          className="w-11 h-11 rounded-xl border border-neutral-200/70 shadow-3xs overflow-hidden hover:scale-105 hover:shadow-[0_4px_12px_rgba(249,115,22,.18)] active:scale-95 transition-all duration-200 relative block shrink-0 cursor-pointer"
          aria-label="Profil akun"
        >
          <Image
            alt="Profil"
            src={PROFILE_AVATAR_IMAGE_URL}
            width={44}
            height={44}
            sizes="44px"
            quality={85}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
