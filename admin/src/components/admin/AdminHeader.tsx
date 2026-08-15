"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ExternalLink,
  Menu,
  User,
  LogOut,
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Server,
  X,
  Clock,
  ArrowRight,
  Lock,
  Trash2,
  CheckCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  NotificationDetailDialog,
  AdminNotification,
} from "./NotificationDetailDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "./AdminAuthBoundary";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAdminAuth();
  const envMode = process.env.NEXT_PUBLIC_APP_ENV || "staging";
  const userAppUrl = process.env.NEXT_PUBLIC_USER_APP_URL?.trim();
  const initials = session?.email.slice(0, 2).toUpperCase() || "AD";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  // Selected Notification for Detail Dialog Modal
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Tidak ada sumber notifikasi operasional tepercaya pada Admin runtime.
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K / '/' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getBreadcrumbTitle = () => {
    if (pathname.startsWith("/submissions")) {
      return { parent: "Operasional", title: "Submissions Validation" };
    }
    return { parent: "Dashboard", title: "Control Plane" };
  };

  const breadcrumb = getBreadcrumbTitle();

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("Semua notifikasi ditandai telah dibaca");
  };

  const handleDeleteAll = () => {
    setNotifications([]);
    toast.info("Semua notifikasi telah dihapus");
  };

  const handleDeleteSingle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Notifikasi berhasil dihapus");
  };

  const handleOpenDetailModal = (n: AdminNotification) => {
    // Mark as read when clicking to view detail
    if (n.unread) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
      );
    }
    setSelectedNotification(n);
    setIsDetailModalOpen(true);
  };

  const quickNavActions = [
    { title: "Periksa Pending Submissions", icon: Clock, path: "/submissions?status=pending" },
    { title: "Daftar Submission Disetujui", icon: CheckCircle2, path: "/submissions?status=approved" },
    { title: "Overview Operasional", icon: Activity, path: "/dashboard" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200/80 bg-[#fffdf8]/90 px-3 sm:px-5 lg:px-6 backdrop-blur-xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all gap-2">
        {/* Left: Mobile Menu Toggle & Context Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={onMenuClick}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="Buka Navigasi Sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              <span className="hidden sm:inline">Marketiv</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-[#f97316] truncate">{breadcrumb.parent}</span>
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0c172b] tracking-tight truncate max-w-[130px] sm:max-w-[220px] md:max-w-none">
              {breadcrumb.title}
            </h2>
          </div>
        </div>

        {/* Center: Full Search Bar */}
        <div className="hidden xl:flex items-center justify-center flex-1 max-w-sm mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="group relative flex h-9 w-full items-center justify-between rounded-xl border border-stone-200/90 bg-stone-50/70 px-3 text-xs text-stone-400 hover:border-orange-500/80 hover:bg-white transition-all shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <Search className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#f97316] transition-colors shrink-0" />
              <span className="group-hover:text-stone-700 transition-colors truncate">
                Cari Submission, Creator...
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-stone-400 group-hover:text-stone-600 shadow-2xs">
                ⌘K
              </span>
            </div>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {/* Compact Search Trigger Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex xl:hidden h-9 w-9 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all shadow-2xs cursor-pointer"
            title="Cari (⌘K / /)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Environment configuration popover */}
          <DropdownMenu open={isHealthOpen} onOpenChange={setIsHealthOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1 text-[11px] font-extrabold text-slate-700 hover:bg-slate-100 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                title="Environment terkonfigurasi"
              >
                <span className="flex h-2 w-2 shrink-0">
                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
                </span>
                <span className="uppercase tracking-wider font-mono text-[10px] sm:text-[11px]">{envMode}</span>
                <ChevronDown className="h-3 w-3 text-emerald-600 shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 p-3">
              <DropdownMenuLabel className="flex items-center justify-between pb-2">
                <span className="font-extrabold text-xs text-[#0c172b] flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-emerald-600" />
                  Environment
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Dikonfigurasi
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="space-y-2 py-1 text-xs">
                <div className="flex items-center justify-between text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                  <span className="font-medium text-[11px]">Endpoint:</span>
                  <span className="font-mono text-[10px] font-bold text-stone-900 truncate max-w-[150px]">
                    api.marketiv.id
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                  <span className="font-medium text-[11px]">Database ID:</span>
                  <span className="font-mono text-[10px] font-bold text-stone-900">
                    6a4c8598...
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                  <span className="font-medium text-[11px]">Otorisasi Role:</span>
                  <span className="font-bold text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    role === &apos;admin&apos;
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />
              <button
                onClick={() => {
                  toast.info("Label environment tidak melakukan pemeriksaan kesehatan sistem.");
                  setIsHealthOpen(false);
                }}
                className="w-full text-center text-[11px] font-bold text-orange-600 hover:bg-orange-50 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Operational Notifications Dropdown with Max Height & Scroll + Delete + Detail Trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title="Notifikasi Operasional"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 shrink-0"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-2 rounded-2xl shadow-xl bg-[#fffdf8]">
              {/* Dropdown Top Bar */}
              <DropdownMenuLabel className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-[#0c172b]">
                    Notifikasi Operasional
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-orange-500 text-white px-2 py-0.2 text-[10px] font-black">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-extrabold text-orange-600 hover:underline cursor-pointer flex items-center gap-1"
                      title="Tandai Semua Dibaca"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>Dibaca</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="text-[10px] font-extrabold text-stone-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
                      title="Hapus Semua Notifikasi"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Kosongkan</span>
                    </button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Scrollable Notification List (Max-height capped at ~350px for 5-6 items) */}
              <div className="space-y-1.5 py-1.5 max-h-[350px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-stone-400 space-y-1">
                    <Bell className="h-6 w-6 text-stone-300" />
                    <p className="text-xs font-bold text-stone-600">Tidak ada notifikasi</p>
                    <p className="text-[11px]">Semua notifikasi operasional telah dibaca atau dihapus.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleOpenDetailModal(n)}
                      className={cn(
                        "group relative flex items-start justify-between gap-2 rounded-xl p-3 text-xs transition-all cursor-pointer border",
                        n.unread
                          ? "bg-orange-50/60 border-orange-200/80 hover:bg-orange-50"
                          : "bg-white border-stone-200/60 hover:bg-stone-100/70"
                      )}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between font-extrabold text-stone-900 gap-1">
                          <span className="flex items-center gap-1.5 truncate">
                            <Sparkles
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                n.unread ? "text-[#f97316]" : "text-stone-400"
                              )}
                            />
                            <span className="truncate">{n.title}</span>
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 font-medium shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-snug line-clamp-2 pr-6">
                          {n.desc}
                        </p>
                      </div>

                      {/* Individual Delete Button */}
                      <button
                        onClick={(e) => handleDeleteSingle(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0 absolute right-2 top-2"
                        title="Hapus Notifikasi Ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/submissions")}
                className="justify-center text-[11px] text-orange-600 font-extrabold cursor-pointer py-2"
              >
                Lihat Semua Submissions di Auditing Queue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* External Marketiv Portal Link */}
          {userAppUrl && <a
            href={userAppUrl}
            className="hidden 2xl:flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all shadow-2xs"
          >
            <span>Marketiv Web</span>
            <ExternalLink className="h-3 w-3 text-stone-400" />
          </a>}

          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white p-1 xl:pr-2.5 hover:bg-stone-50 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 shrink-0">
                <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[#0c172b] font-extrabold text-white text-xs shadow-2xs shrink-0">
                  {initials}
                  <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-extrabold text-stone-900 leading-none truncate max-w-[90px]">
                    {session?.email}
                  </span>
                  <span className="text-[9px] font-extrabold text-[#f97316] leading-none mt-0.5">
                    Admin
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-extrabold text-stone-900 text-xs">
                    {session?.email}
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    Status: {session?.status}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => toast.info("Profil Admin Ops Marketiv v1.0")}
                className="cursor-pointer"
              >
                <User className="h-3.5 w-3.5 text-stone-500" />
                <span>Profil Admin</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  toast.info("Environment hanya menunjukkan konfigurasi, bukan kesehatan sistem.");
                  setIsHealthOpen(true);
                }}
                className="cursor-pointer"
              >
                <Activity className="h-3.5 w-3.5 text-stone-500" />
                <span>Environment</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => toast.info("Panduan Operasional: Buka /submissions untuk memvalidasi views.")}
                className="cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 text-stone-500" />
                <span>Dokumentasi Operasional</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void logout()}
                className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer font-bold"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Admin</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Interactive Command Palette Search Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-[#fffdf8] border-stone-200/90 rounded-2xl shadow-2xl">
          <DialogHeader className="p-4 border-b border-stone-200/70 bg-white">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-[#f97316] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Submission, Nama Kreator, atau Judul Campaign..."
                className="w-full bg-transparent text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </DialogHeader>

          <div className="p-3 space-y-4 max-h-[380px] overflow-y-auto">
            {/* Quick Actions Section */}
            <div>
              <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                Pintasan Navigasi Cepat
              </div>
              <div className="space-y-1">
                {quickNavActions.map((action, idx) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        router.push(action.path);
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100/80 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComponent className="h-4 w-4 text-[#f97316]" />
                        <span>{action.title}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Link to Submissions Filter */}
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
                <span className="text-stone-800 font-bold">
                  Ingin mencari submission spesifik?
                </span>
              </div>
              <button
                onClick={() => {
                  router.push("/submissions");
                  setIsSearchOpen(false);
                }}
                className="text-[11px] font-extrabold text-orange-600 hover:underline cursor-pointer"
              >
                Buka Halaman Submissions →
              </button>
            </div>
          </div>

          {/* Modal Footer Hints */}
          <div className="p-3 border-t border-stone-200/70 bg-stone-50/80 flex items-center justify-between text-[11px] text-stone-400 font-medium">
            <div className="flex items-center gap-3">
              <span><strong className="text-stone-600 font-extrabold">ESC</strong> untuk menutup</span>
              <span><strong className="text-stone-600 font-extrabold">/</strong> pintasan keyboard</span>
            </div>
            <span>Marketiv Operational Plane</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Detail Screen Modal */}
      <NotificationDetailDialog
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onDelete={handleDeleteSingle}
        onActionClick={(link) => {
          if (link) router.push(link);
        }}
      />
    </>
  );
}
