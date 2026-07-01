"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarNavIcon = "dashboard" | "campaign" | "plus" | "users" | "chat" | "wallet";

interface SidebarNavItem {
  label: string;
  href: string;
  icon: SidebarNavIcon;
}

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard/umkm", icon: "dashboard" },
  { label: "Campaign Saya", href: "/dashboard/umkm/campaign", icon: "campaign" },
  { label: "Buat Campaign", href: "/dashboard/umkm/campaign/buat", icon: "plus" },
  { label: "Kreator", href: "/dashboard/umkm/kreator", icon: "users" },
  { label: "Negosiasi", href: "/dashboard/umkm/negosiasi", icon: "chat" },
  { label: "Keuangan", href: "/dashboard/umkm/keuangan", icon: "wallet" },
];

interface DashboardSidebarProps {
  businessName: string;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

interface SidebarIconProps {
  icon: SidebarNavIcon;
}

function SidebarIcon({ icon }: SidebarIconProps) {
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
    case "campaign":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      );
    case "plus":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
        </svg>
      );
    case "users":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

export function DashboardSidebar({
  businessName,
  isSidebarOpen,
  onCloseSidebar,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-[280px] sidebar-premium flex flex-col py-8 z-50 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Header / Brand Logo */}
      <div className="px-6 mb-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
            <span className="font-extrabold text-lg text-white">M</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white leading-none tracking-wide">Marketiv</h1>
            <p className="text-[10px] text-white/40 mt-1.5 font-medium tracking-widest uppercase">{businessName}</p>
          </div>
        </div>
        <button
          className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          onClick={onCloseSidebar}
        >
          {/* Close Icon SVG */}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-1.5">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard/umkm"
                ? pathname === "/dashboard/umkm"
                : item.href === "/dashboard/umkm/campaign"
                ? pathname.startsWith(item.href) && !pathname.startsWith("/dashboard/umkm/campaign/buat")
                : pathname.startsWith(item.href);
            return (
              <li key={item.label}>
                <Link
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 group",
                    isActive
                      ? "nav-item-active relative overflow-hidden"
                      : "nav-item-inactive rounded-xl text-sm"
                  )}
                  href={item.href}
                >
                  <span
                    className={
                      isActive
                        ? "text-primary group-hover:scale-105 transition-transform duration-200"
                        : "icon-container group-hover:scale-110 transition-all duration-200"
                    }
                  >
                    <SidebarIcon icon={item.icon} />
                  </span>
                  <span className={isActive ? "text-sm font-bold tracking-wide" : "font-semibold"}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer Section */}
      <div className="mt-auto px-4 pb-4">
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] backdrop-blur-md mb-4">
          <Link className="flex items-center gap-3 text-white/60 hover:text-white py-2 transition-colors text-sm group font-semibold" href="#">
            <span className="text-white/40 group-hover:text-white group-hover:rotate-12 transition-transform duration-200">
              {/* Question Mark SVG */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.286 7.008c.531-.692 1.41-1.008 2.314-1.008 1.833 0 3.32 1.343 3.32 3 0 1.258-.87 2.062-1.92 2.656-.632.357-.999.85-.999 1.48v.86M12 17h.01" />
              </svg>
            </span>
            <span>Bantuan</span>
          </Link>

          <Link className="flex items-center gap-3 text-white/60 hover:text-white py-2 transition-colors text-sm group font-semibold" href="#">
            <span className="text-white/40 group-hover:text-white group-hover:rotate-90 transition-transform duration-500">
              {/* Gear SVG */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31 .826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span>Pengaturan</span>
          </Link>
        </div>

        <Link className="flex items-center gap-3 text-red-300 hover:text-white px-4 py-2 hover:bg-white/[0.04] rounded-xl transition-colors text-sm group font-semibold" href="/">
          <span className="text-red-400/60 group-hover:text-white group-hover:-translate-x-1 transition-transform duration-200">
            {/* Log Out SVG */}
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
