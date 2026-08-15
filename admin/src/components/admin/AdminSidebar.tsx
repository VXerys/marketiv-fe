"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle2,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  Server,
  Zap,
  Activity,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { MarketivLogo } from "@/components/ui/MarketivLogo";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  pendingCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  pendingCount = 12,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderContent = (isRail = false) => (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-stone-200/90 bg-[#fffdf8] py-4 justify-between shrink-0 shadow-[4px_0_24px_rgba(15,23,42,0.03)] select-none overflow-y-auto transition-all duration-300",
        isRail ? "w-20 px-2.5 items-center" : "w-full px-4"
      )}
    >
      {/* Top Header & Navigation Group */}
      <div className={cn("space-y-4 w-full", isRail && "flex flex-col items-center")}>
        {/* Brand Header */}
        <div
          className={cn(
            "flex items-center justify-between pt-1 w-full",
            isRail ? "px-0 justify-center flex-col gap-2.5" : "px-0.5"
          )}
        >
          <div className={cn("min-w-0 flex items-center gap-2", !isRail && "flex-1")}>
            <MarketivLogo showText={!isRail} />
            {!isRail && (
              <span className="rounded-md bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase text-white shadow-2xs">
                ADMIN
              </span>
            )}
          </div>

          {!isRail && (
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {/* Desktop Collapse Toggle Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-500 hover:bg-orange-50 hover:text-[#f97316] hover:border-orange-200 transition-all shadow-2xs cursor-pointer"
                title="Kecilkan Sidebar (Ctrl+B)"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>

              {/* Close button for Mobile Drawer */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  title="Tutup Navigasi"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rail Mode Expand Toggle Button */}
        {isRail && (
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all shadow-2xs cursor-pointer"
            title="Perluas Sidebar (Ctrl+B)"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {/* Compact Operational Status Bar */}
        {!isRail ? (
          <div className="rounded-xl border border-orange-200/80 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent px-3 py-2 text-xs text-stone-900 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-orange-950 text-[11px] truncate">
              <ShieldCheck className="h-4 w-4 text-[#f97316] shrink-0" />
              <span className="truncate">Control Plane Active</span>
            </div>
            <span className="flex h-2 w-2 shrink-0 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-2xs relative cursor-pointer hover:bg-orange-100 transition-colors"
            title="Control Plane Active (Validasi Manual PPV)"
          >
            <ShieldCheck className="h-4.5 w-4.5 text-[#f97316]" />
          </div>
        )}

        {/* Sidebar Navigation Links */}
        <nav className="space-y-4 w-full">
          {/* Main Navigation Group */}
          <div className="space-y-1.5 w-full">
            {!isRail && (
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-stone-400">
                Menu Utama
              </div>
            )}

            {/* Overview Link */}
            <Link
              href="/dashboard"
              onClick={onClose}
              title={isRail ? "Overview" : undefined}
              className={cn(
                "group flex items-center rounded-xl transition-all relative overflow-hidden font-bold text-xs",
                isRail ? "h-11 w-11 justify-center mx-auto" : "px-3.5 py-2.5 gap-3 w-full",
                pathname === "/dashboard" || pathname === "/"
                  ? "bg-[#0c172b] text-white shadow-md shadow-[#0c172b]/15"
                  : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              {(pathname === "/dashboard" || pathname === "/") && !isRail && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#f97316]" />
              )}
              <LayoutDashboard
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  pathname === "/dashboard" || pathname === "/"
                    ? "text-[#f97316]"
                    : "text-stone-400 group-hover:text-stone-700"
                )}
              />
              {!isRail && <span>Overview</span>}
            </Link>
          </div>

          {/* Operational Group */}
          <div className="space-y-1.5 w-full">
            {!isRail && (
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  Operasional
                </span>
                <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                  LIVE
                </span>
              </div>
            )}

            {/* Submissions Link */}
            <Link
              href="/submissions"
              onClick={onClose}
              title={isRail ? `Campaign Submissions (${pendingCount} Pending)` : undefined}
              className={cn(
                "group flex items-center rounded-xl transition-all relative overflow-hidden font-bold text-xs",
                isRail ? "h-11 w-11 justify-center mx-auto" : "px-3.5 py-2.5 justify-between w-full",
                pathname.startsWith("/submissions")
                  ? "bg-[#0c172b] text-white shadow-md shadow-[#0c172b]/15"
                  : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              {pathname.startsWith("/submissions") && !isRail && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#f97316]" />
              )}
              <div className={cn("flex items-center", isRail ? "justify-center" : "gap-3 min-w-0")}>
                <CheckCircle2
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                    pathname.startsWith("/submissions")
                      ? "text-[#f97316]"
                      : "text-stone-400 group-hover:text-stone-700"
                  )}
                />
                {!isRail && <span className="truncate">Campaign Submissions</span>}
              </div>

              {/* Pending Count Badge */}
              {pendingCount > 0 && !isRail && (
                <span className="rounded-full bg-[#f97316] text-white px-2 py-0.5 text-[10px] font-black shadow-2xs shrink-0 ml-1.5">
                  {pendingCount}
                </span>
              )}
              {pendingCount > 0 && isRail && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[9px] font-black text-white shadow-xs">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>

          {/* Settings & System Group */}
          <div className="space-y-1.5 w-full">
            {!isRail && (
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-stone-400">
                System
              </div>
            )}

            <div
              className={cn(
                "flex items-center rounded-xl py-2.5 text-xs font-semibold text-stone-400 cursor-not-allowed opacity-50 bg-stone-50/60",
                isRail ? "h-11 w-11 justify-center mx-auto" : "px-3.5 justify-between w-full"
              )}
              title="Settings (Mendatang)"
            >
              <div className={cn("flex items-center", isRail ? "justify-center" : "gap-3")}>
                <Settings className="h-4 w-4 shrink-0 text-stone-400" />
                {!isRail && <span>Settings</span>}
              </div>
              {!isRail && (
                <span className="text-[9px] font-bold text-stone-400 bg-stone-200/60 px-1.5 py-0.5 rounded">
                  SOON
                </span>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Footer Section: Appwrite Server Health & Admin Profile */}
      <div className="border-t border-stone-200/90 pt-3.5 space-y-2 pb-1 w-full">
        {/* Appwrite Server Status Badge */}
        {!isRail ? (
          <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-emerald-50/70 border border-emerald-200/70 text-[11px]">
            <div className="flex items-center gap-2 text-stone-700 font-bold min-w-0">
              <Server className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Appwrite Staging</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md shrink-0 border border-emerald-200">
              <Activity className="h-2.5 w-2.5 text-emerald-600 animate-pulse" />
              Online
            </span>
          </div>
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs mx-auto"
            title="Appwrite Staging — Connected"
          >
            <Server className="h-4 w-4" />
          </div>
        )}

        {/* Admin User Profile Card */}
        <div
          className={cn(
            "flex items-center rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-all",
            isRail ? "p-1.5 justify-center mx-auto h-10 w-10 cursor-pointer" : "p-2.5 justify-between w-full"
          )}
          title={isRail ? "Admin Marketiv (ops@marketiv.id)" : undefined}
        >
          <div className={cn("flex items-center min-w-0", isRail ? "justify-center" : "gap-2.5 flex-1")}>
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0c172b] text-xs font-black text-white shadow-xs">
              AD
              <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            {!isRail && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-extrabold text-stone-900 truncate leading-none">
                  Admin Marketiv
                </span>
                <span className="text-[10px] font-medium text-stone-500 truncate leading-none mt-1">
                  ops@marketiv.id
                </span>
              </div>
            )}
          </div>
          {!isRail && (
            <button
              title="Keluar Admin"
              className="text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all p-1.5 rounded-lg cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (Supports Collapsed Rail Mode) */}
      <div
        className={cn(
          "hidden lg:flex h-screen sticky top-0 z-40 shrink-0 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64 xl:w-68"
        )}
      >
        {renderContent(isCollapsed)}
      </div>

      {/* Mobile & Tablet Off-canvas Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
          />
          {/* Off-canvas Drawer Container */}
          <div className="fixed inset-y-0 left-0 w-[285px] max-w-[85vw] bg-[#fffdf8] shadow-2xl animate-in slide-in-from-left duration-200 z-50">
            {renderContent(false)}
          </div>
        </div>
      )}
    </>
  );
}
