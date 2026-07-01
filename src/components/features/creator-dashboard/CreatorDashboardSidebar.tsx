"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type CreatorSidebarIcon =
  | "dashboard"
  | "job-pool"
  | "active-work"
  | "chat"
  | "user"
  | "rate-card"
  | "wallet";

interface CreatorSidebarItem {
  label: string;
  href: string;
  icon: CreatorSidebarIcon;
}

const SIDEBAR_ITEMS: CreatorSidebarItem[] = [
  { label: "Overview", href: "/dashboard/kreator", icon: "dashboard" },
  { label: "Job Pool", href: "/dashboard/kreator/job-pool", icon: "job-pool" },
  { label: "Pekerjaan Aktif", href: "/dashboard/kreator/pekerjaan-aktif", icon: "active-work" },
  { label: "Negosiasi", href: "/dashboard/kreator/negosiasi", icon: "chat" },
  { label: "Profil Saya", href: "/dashboard/kreator/profil", icon: "user" },
  { label: "Rate Card", href: "/dashboard/kreator/rate-card", icon: "rate-card" },
  { label: "Keuangan", href: "/dashboard/kreator/keuangan", icon: "wallet" },
];

interface CreatorDashboardSidebarProps {
  creatorName: string;
  creatorHandle: string;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

function SidebarIcon({ icon }: { icon: CreatorSidebarIcon }) {
  switch (icon) {
    case "dashboard":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "job-pool":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h.01" />
        </svg>
      );
    case "active-work":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "user":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "rate-card":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      );
    case "wallet":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
  }
}

export function CreatorDashboardSidebar({
  creatorName,
  creatorHandle,
  isSidebarOpen,
  onCloseSidebar,
}: CreatorDashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen w-[280px] sidebar-premium flex flex-col py-8 z-50 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="px-6 mb-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)] shrink-0">
            <span className="font-extrabold text-lg text-white">M</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-white leading-none tracking-wide truncate">Marketiv</h1>
            <p className="text-[10px] text-white/40 mt-1.5 font-medium tracking-widest uppercase truncate">
              Kreator: {creatorName}
            </p>
          </div>
        </div>
        <button
          className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          onClick={onCloseSidebar}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-1.5">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard/kreator"
                ? pathname === "/dashboard/kreator"
                : pathname.startsWith(item.href);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onCloseSidebar}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 group transition-all duration-200",
                    isActive
                      ? "nav-item-active relative overflow-hidden font-bold"
                      : "nav-item-inactive rounded-xl text-sm font-semibold"
                  )}
                >
                  <span
                    className={cn(
                      "transition-transform duration-200",
                      isActive
                        ? "text-primary group-hover:scale-105"
                        : "icon-container group-hover:scale-110"
                    )}
                  >
                    <SidebarIcon icon={item.icon} />
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Settings Block */}
      <div className="mt-auto px-4 pb-4">
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] backdrop-blur-md mb-4">
          <div className="flex items-center gap-3 mb-3 border-b border-white/[0.06] pb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-extrabold text-xs text-primary shrink-0">
              {creatorName.substring(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{creatorName}</p>
              <p className="text-[9px] text-white/40 mt-1 truncate font-medium">@{creatorHandle}</p>
            </div>
          </div>
          
          <Link
            href="/dashboard/kreator/profil"
            className="flex items-center gap-3 text-white/60 hover:text-white py-1.5 transition-colors text-xs group font-semibold"
          >
            <span className="text-white/40 group-hover:text-white group-hover:rotate-45 transition-transform duration-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31 .826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span>Pengaturan</span>
          </Link>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 text-red-300 hover:text-white px-4 py-2 hover:bg-white/[0.04] rounded-xl transition-colors text-sm group font-semibold"
        >
          <span className="text-red-400/60 group-hover:text-white group-hover:-translate-x-1 transition-transform duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          <span>Keluar</span>
        </Link>
      </div>
    </aside>
  );
}
