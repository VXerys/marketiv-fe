"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

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
    profil: "Profil Saya",
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

  return (
    <header
      className="sticky top-0 z-40 flex justify-between items-center px-4 sm:px-6 lg:px-8 h-[80px]"
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(17, 24, 39, 0.05)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.02), 0 1px 0 rgba(17, 24, 39, 0.03)",
      }}
    >
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

      {/* Mobile Title (visible on mobile only) */}
      <div className="flex md:hidden flex-col">
        <h1 className="font-extrabold text-[1rem] text-ink-900 leading-tight tracking-[-0.03em] truncate">
          {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Active job quick check button */}
        <Link
          href="/dashboard/kreator/job-pool"
          className="hidden md:inline-flex bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:shadow-[0_8px_20px_rgba(249,115,22,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all border border-white/20 shadow-sm"
        >
          Cari Pekerjaan Baru
        </Link>

        {/* Notifications Icon */}
        <button className="relative w-11 h-11 flex items-center justify-center rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50 transition-all bg-white shadow-3xs border border-neutral-200/60 group cursor-pointer active:scale-95">
          <span className="absolute top-[12px] right-[12px] w-[8px] h-[8px] bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          <Bell size={20} strokeWidth={2} />
        </button>

        {/* Creator profile photo */}
        <Link
          href="/dashboard/kreator/profil"
          className="w-11 h-11 rounded-xl border border-neutral-200/50 shadow-3xs overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-all relative block"
        >
          <Image
            alt={creatorName}
            className="w-full h-full object-cover"
            src={creatorAvatar}
            width={44}
            height={44}
            sizes="44px"
            quality={75}
          />
        </Link>
      </div>
    </header>
  );
}
