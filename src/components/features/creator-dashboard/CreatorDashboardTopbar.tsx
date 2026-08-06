"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { logoMarketivPng } from "@/assets/icons";
import { useSidebar } from "@/components/ui/sidebar";
import { getNotifications } from "@/services/shared/notification.service";
import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { realtimeClient, tableChannels } from "@/lib/appwrite/realtime";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/dashboard/kreator" }];

  if (parts.length > 2) {
    const sub = parts[2];
    if (sub === "job-pool") items.push({ label: "Job Pool" });
    else if (sub === "pekerjaan-aktif") items.push({ label: "Pekerjaan Aktif" });
    else if (sub === "rate-card") items.push({ label: "Rate Card" });
    else if (sub === "negosiasi") items.push({ label: "Negosiasi" });
    else if (sub === "keuangan") items.push({ label: "Keuangan" });
    else if (sub === "pengaturan") items.push({ label: "Pengaturan" });
  }

  return items;
}

interface CreatorDashboardTopbarProps {
  creatorName?: string;
  creatorAvatar?: string;
  onOpenSidebar?: () => void;
}

export function CreatorDashboardTopbar({}: CreatorDashboardTopbarProps = {}) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const breadcrumbs = getBreadcrumbs(pathname);

  const activeTitle =
    breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].label : "Overview";

  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await getNotifications("creator");
      if (res.success && res.data) {
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      }
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    if (DATA_SOURCE_CONFIG.useMockData) return;
    const channels = tableChannels("notifications");
    if (channels.length === 0) return;

    return realtimeClient.subscribe(channels, () => loadUnreadCount());
  }, [loadUnreadCount]);

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
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile hamburger — hidden on md+ */}
        <button
          onClick={toggleSidebar}
          className="md:hidden w-10.5 h-10.5 flex items-center justify-center rounded-xl text-ink-600 hover:bg-neutral-100/80 active:scale-95 transition-all duration-150 cursor-pointer shrink-0 border border-neutral-200/60 bg-white/70 shadow-3xs"
          aria-label="Buka menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* Mobile: Marketiv brand mark */}
        <div className="flex items-center gap-2.5 md:hidden min-w-0">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-3xs border border-neutral-200/80">
            <Image
              src={logoMarketivPng}
              alt="Marketiv Logo"
              width={28}
              height={28}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <strong className="block text-[.92rem] font-extrabold text-ink-900 leading-none tracking-[-0.03em] font-display truncate">
              Marketiv
            </strong>
            <span className="block text-[.68rem] text-ink-400 font-semibold mt-px leading-none truncate">
              {activeTitle}
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

      {/* Right: actions */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard/kreator/job-pool"
          className="hidden md:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:shadow-kreator-brand hover:-translate-y-0.5 active:translate-y-0 transition-all border border-white/20 shadow-sm"
        >
          Cari Pekerjaan Baru
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/dashboard/kreator/notifikasi"
          className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-neutral-100/70 hover:bg-neutral-200/60 active:scale-95 transition-all text-neutral-600 hover:text-neutral-900"
          aria-label="Notifikasi"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600" />
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
