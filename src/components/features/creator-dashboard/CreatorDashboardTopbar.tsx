"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/dashboard/kreator" }];
  
  if (parts.length <= 2) {
    return items;
  }
  
  const mainModule = parts[2];
  const labelMap: Record<string, string> = {
    "job-pool": "Job Pool",
    "pekerjaan-aktif": "Pekerjaan Aktif",
    "rate-card": "Rate Card",
    negosiasi: "Negosiasi",
    keuangan: "Keuangan",
    settings: "Pengaturan",
    panduan: "FAQ & Peraturan",
    notifikasi: "Notifikasi",
  };
  
  if (labelMap[mainModule]) {
    items.push({
      label: labelMap[mainModule],
      href: `/dashboard/kreator/${mainModule}`
    });
  } else {
    items.push({
      label: mainModule.charAt(0).toUpperCase() + mainModule.slice(1)
    });
  }
  
  if (parts.length > 3) {
    items.push({ label: "Detail" });
  }
  
  return items;
}

interface CreatorDashboardTopbarProps {
  creatorName: string;
  creatorAvatar: string;
  onOpenSidebar?: () => void;
}

export function CreatorDashboardTopbar({
  creatorName,
  creatorAvatar,
}: CreatorDashboardTopbarProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { toggleSidebar } = useSidebar();
  const activeTitle = breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

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
        {/* Mobile hamburger — hidden on md+ */}
        <button
          onClick={toggleSidebar}
          className="md:hidden w-10.5 h-10.5 flex items-center justify-center rounded-xl text-ink-600 hover:bg-neutral-100/80 active:scale-95 transition-all duration-150 cursor-pointer shrink-0 border border-neutral-200/60 bg-white/70 shadow-3xs"
          aria-label="Buka menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* Mobile: Marketiv brand mark (blue/purple) */}
        <div className="flex items-center gap-2.5 md:hidden min-w-0">
          <div
            className="w-9 h-9 rounded-[11px] shrink-0 flex items-center justify-center shadow-[0_6px_16px_rgba(37,99,235,.24)]"
            style={{
              background:
                "radial-gradient(circle at 35% 25%, rgba(255,255,255,.9) 0 9%, transparent 10%), linear-gradient(135deg, #2563eb, #7c3aed)",
            }}
          >
            <span className="font-extrabold text-[.85rem] text-white font-display">M</span>
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

      {/* ── Right: actions ────────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active job quick check button */}
        <Link
          href="/dashboard/kreator/job-pool"
          className="hidden md:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all border border-white/20 shadow-sm"
        >
          Cari Pekerjaan Baru
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/dashboard/kreator/notifikasi"
          className="relative w-11 h-11 flex items-center justify-center rounded-xl text-ink-500 hover:bg-neutral-100 hover:text-ink-800 active:scale-95 transition-all duration-150 cursor-pointer border border-neutral-200/60 bg-white/70 shadow-3xs hover:shadow-2xs"
          aria-label="Notifikasi"
        >
          <Bell size={20} strokeWidth={2} />
          {/* Unread dot */}
          <span
            className="absolute top-[12px] right-[12px] w-[8px] h-[8px] rounded-full border-[1.5px] border-white bg-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,.25)]"
            aria-hidden="true"
          />
        </Link>

        {/* Creator profile photo */}
        <Link
          href="/dashboard/kreator/settings"
          className="w-11 h-11 rounded-xl border border-neutral-200/70 shadow-3xs overflow-hidden hover:scale-105 hover:shadow-[0_4px_12px_rgba(37,99,235,.18)] active:scale-95 transition-all duration-200 relative block shrink-0 cursor-pointer"
          aria-label="Pengaturan akun"
        >
          <Image
            alt={creatorName}
            className="w-full h-full object-cover"
            src={creatorAvatar}
            width={44}
            height={44}
            sizes="44px"
            quality={85}
          />
        </Link>
      </div>
    </header>
  );
}
