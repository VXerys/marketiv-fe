"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  BellOff,
  CheckCheck,
  Trash2,
  Megaphone,
  Wallet,
  MessageSquare,
  Settings2,
  Tag,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifType = "campaign" | "keuangan" | "negosiasi" | "sistem" | "rate_card";
type ThemeVariant = "kreator" | "umkm";
type FilterTab = "all" | "unread" | NotifType;

interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionHref?: string;
}

export interface NotificationViewProps {
  theme: ThemeVariant;
}

// ── Theme ─────────────────────────────────────────────────────────────────────

const THEME = {
  kreator: {
    accent: "#2563eb",
    tabActiveCls: "bg-blue-600 text-white border-blue-600/0",
    unreadBarCls: "bg-gradient-to-b from-blue-500 to-purple-500",
    unreadDotCls: "bg-blue-600",
    badgeCls: "bg-blue-50 text-blue-600 border-blue-200/70",
    markAllCls: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
    actionCls: "text-blue-600 hover:text-blue-800",
    eyebrow: "Dashboard Kreator",
    pageTitle: "Notifikasi Kreator",
  },
  umkm: {
    accent: "#ea580c",
    tabActiveCls: "bg-orange-500 text-white border-orange-500/0",
    unreadBarCls: "bg-gradient-to-b from-orange-400 to-orange-600",
    unreadDotCls: "bg-orange-500",
    badgeCls: "bg-orange-50 text-orange-600 border-orange-200/70",
    markAllCls: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200",
    actionCls: "text-orange-600 hover:text-orange-800",
    eyebrow: "Dashboard UMKM",
    pageTitle: "Notifikasi",
  },
} as const;

// ── Notif type config ─────────────────────────────────────────────────────────

const NOTIF_CFG: Record<
  NotifType,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    badgeCls: string;
  }
> = {
  campaign: {
    icon: Megaphone,
    label: "Campaign",
    iconBg: "#fff7ed",
    iconColor: "#ea580c",
    iconBorder: "rgba(234,88,12,.18)",
    badgeCls: "bg-orange-50 text-orange-600 border-orange-200/60",
  },
  keuangan: {
    icon: Wallet,
    label: "Keuangan",
    iconBg: "#f1fbf5",
    iconColor: "#16a34a",
    iconBorder: "rgba(22,163,74,.18)",
    badgeCls: "bg-green-50 text-green-700 border-green-200/60",
  },
  negosiasi: {
    icon: MessageSquare,
    label: "Negosiasi",
    iconBg: "#f0f6ff",
    iconColor: "#2563eb",
    iconBorder: "rgba(37,99,235,.18)",
    badgeCls: "bg-blue-50 text-blue-600 border-blue-200/60",
  },
  rate_card: {
    icon: Tag,
    label: "Rate Card",
    iconBg: "#f7f3ff",
    iconColor: "#7c3aed",
    iconBorder: "rgba(124,58,237,.18)",
    badgeCls: "bg-purple-50 text-purple-600 border-purple-200/60",
  },
  sistem: {
    icon: Settings2,
    label: "Sistem",
    iconBg: "#f8fafc",
    iconColor: "#687386",
    iconBorder: "rgba(148,163,184,.28)",
    badgeCls: "bg-neutral-50 text-neutral-500 border-neutral-200/60",
  },
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const KREATOR_NOTIFS: AppNotification[] = [
  { id: "k1", type: "campaign", title: "Campaign Baru Tersedia", message: "Dapur Sehat Sukabumi membuka campaign 'Rasa Nusantara Food Review' dengan budget Rp 500.000 per kreator.", timestamp: new Date(Date.now() - 5 * 60000).toISOString(), isRead: false, actionLabel: "Lihat Campaign", actionHref: "/dashboard/kreator/job-pool" },
  { id: "k2", type: "keuangan", title: "Pembayaran Diterima", message: "Dana Rp 350.000 dari campaign 'Kopi Nusantara Reels' berhasil masuk ke dompet Anda.", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), isRead: false, actionLabel: "Lihat Dompet", actionHref: "/dashboard/kreator/keuangan" },
  { id: "k3", type: "campaign", title: "Proof of Work Disetujui", message: "UMKM 'Sambal Bu Rudi' menyetujui konten Anda untuk campaign 'Glow & Beauty Care'. Saldo segera dicairkan.", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), isRead: false },
  { id: "k4", type: "negosiasi", title: "Penawaran Rate Card Baru", message: "UMKM 'Batik Tulis Nusantara' mengirim penawaran untuk paket Standard Instagram Anda senilai Rp 800.000.", timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), isRead: false, actionLabel: "Lihat Negosiasi", actionHref: "/dashboard/kreator/negosiasi" },
  { id: "k5", type: "rate_card", title: "Paket Rate Card Dilihat", message: "5 UMKM melihat paket Rate Card 'Premium TikTok Review' Anda hari ini. Pastikan deskripsi sudah menarik.", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), isRead: true },
  { id: "k6", type: "keuangan", title: "Penarikan Saldo Berhasil", message: "Penarikan Rp 250.000 ke rekening BCA ****4521 telah berhasil diproses.", timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
  { id: "k7", type: "sistem", title: "Verifikasi Akun Berhasil", message: "Akun kreator Anda telah terverifikasi. Kini Anda dapat menerima campaign berbayar.", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), isRead: true },
  { id: "k8", type: "campaign", title: "Campaign Hampir Berakhir", message: "Campaign 'Warung Digital Pak Budi' berakhir dalam 3 hari. Segera upload proof of work Anda.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), isRead: true, actionLabel: "Upload Sekarang", actionHref: "/dashboard/kreator/pekerjaan-aktif" },
  { id: "k9", type: "sistem", title: "Kebijakan Platform Diperbarui", message: "Marketiv memperbarui ketentuan penggunaan. Mohon baca dan setujui perubahan ini.", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), isRead: true, actionLabel: "Baca Perubahan", actionHref: "/dashboard/kreator/panduan" },
  { id: "k10", type: "negosiasi", title: "Counter Offer Diterima", message: "UMKM 'Madu Asli Flores' menerima counter offer Anda untuk paket YouTube Review. Negosiasi selesai!", timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), isRead: true },
];

const UMKM_NOTIFS: AppNotification[] = [
  { id: "u1", type: "campaign", title: "3 Kreator Baru Mendaftar", message: "3 kreator baru mendaftar ke campaign 'Rasa Nusantara Food Review'. Review dan setujui segera.", timestamp: new Date(Date.now() - 10 * 60000).toISOString(), isRead: false, actionLabel: "Review Kreator", actionHref: "/dashboard/umkm/campaign" },
  { id: "u2", type: "keuangan", title: "Escrow Berhasil Dikunci", message: "Dana escrow Rp 1.500.000 untuk campaign 'Glow & Beauty Care' berhasil dikunci. Campaign siap dimulai.", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), isRead: false, actionLabel: "Lihat Keuangan", actionHref: "/dashboard/umkm/keuangan" },
  { id: "u3", type: "campaign", title: "Konten Kreator Perlu Direview", message: "Sulianto Indria Putra mengunggah proof of work untuk campaign 'Kopi Nusantara'. Segera review.", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), isRead: false, actionLabel: "Review Konten", actionHref: "/dashboard/umkm/campaign" },
  { id: "u4", type: "negosiasi", title: "Counter Offer dari Kreator", message: "Kreator 'Rina Dewi' mengajukan counter offer Rp 750.000 untuk paket Rate Card Instagram.", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), isRead: false, actionLabel: "Lihat Negosiasi", actionHref: "/dashboard/umkm/negosiasi" },
  { id: "u5", type: "sistem", title: "Campaign Disetujui Admin", message: "Campaign 'Warung Digital Pak Budi' telah diverifikasi dan mulai tampil di marketplace kreator.", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), isRead: true },
  { id: "u6", type: "keuangan", title: "Pembayaran Kreator Berhasil", message: "Pembayaran Rp 350.000 ke kreator 'Andi Wijaya' untuk campaign 'Sambal Nusantara' berhasil diproses.", timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
  { id: "u7", type: "campaign", title: "Campaign Mendekati Kuota", message: "Campaign 'Glow & Beauty Care' mencapai 85% kuota kreator. Pertimbangkan untuk menambah budget.", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), isRead: true, actionLabel: "Kelola Campaign", actionHref: "/dashboard/umkm/campaign" },
  { id: "u8", type: "negosiasi", title: "Negosiasi Rate Card Selesai", message: "Negosiasi dengan kreator 'Budi Santoso' untuk paket TikTok Review berhasil mencapai kesepakatan.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), isRead: true },
  { id: "u9", type: "sistem", title: "Laporan Bulanan Tersedia", message: "Laporan performa campaign bulan Desember 2024 siap diunduh. Total views: 125.430.", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), isRead: true, actionLabel: "Lihat Laporan", actionHref: "/dashboard/umkm/analitik" },
  { id: "u10", type: "sistem", title: "Verifikasi Bisnis Berhasil", message: "Profil bisnis Anda telah terverifikasi. Badge 'UMKM Terverifikasi' kini tampil di profil.", timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), isRead: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(diff / 86400000);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div className="flex gap-3 p-4 sm:p-5 animate-pulse">
      <div className="w-10 h-10 rounded-[14px] bg-neutral-200 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-2.5 pt-0.5">
        <div className="h-3.5 w-2/5 bg-neutral-200 rounded" />
        <div className="h-3 w-full bg-neutral-100 rounded" />
        <div className="h-3 w-3/4 bg-neutral-100 rounded" />
        <div className="flex gap-2 pt-1">
          <div className="h-[18px] w-14 bg-neutral-100 rounded-full" />
          <div className="h-[18px] w-16 bg-neutral-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 7;

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationView({ theme }: NotificationViewProps) {
  const t = THEME[theme];
  const baseData = theme === "kreator" ? KREATOR_NOTIFS : UMKM_NOTIFS;

  const [notifs, setNotifs] = useState<AppNotification[]>(baseData);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(baseData.length);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.isRead && !deletingIds.has(n.id)).length;

  const filtered = notifs.filter(n => {
    if (deletingIds.has(n.id)) return false;
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type === activeTab;
  });

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length || totalLoaded < 30;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !canLoadMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      if (visibleCount < filtered.length) {
        setVisibleCount(c => c + PAGE_SIZE);
      } else {
        // Simulate server page: cycle through base data with new IDs
        const extra: AppNotification[] = Array.from({ length: 5 }, (_, i) => {
          const src = baseData[i % baseData.length];
          return {
            ...src,
            id: `ext_${totalLoaded + i}`,
            isRead: true,
            timestamp: new Date(Date.now() - (totalLoaded + i) * 43200000).toISOString(),
          };
        });
        setNotifs(prev => [...prev, ...extra]);
        setTotalLoaded(c => c + extra.length);
        setVisibleCount(c => c + PAGE_SIZE);
      }
      setIsLoadingMore(false);
    }, 800);
  }, [isLoadingMore, canLoadMore, visibleCount, filtered.length, totalLoaded, baseData]);

  // Auto-load on scroll via intersection observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1, rootMargin: "60px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Reset page on tab switch
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTab]);

  const markAsRead = (id: string) =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

  const markAllAsRead = () =>
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));

  const deleteOne = (id: string) => {
    setDeletingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id));
      setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 280);
  };

  const deleteAllRead = () => {
    const readIds = notifs.filter(n => n.isRead && !deletingIds.has(n.id)).map(n => n.id);
    if (!readIds.length) return;
    setDeletingIds(prev => new Set([...prev, ...readIds]));
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => !readIds.includes(n.id)));
      setDeletingIds(new Set());
    }, 280);
  };

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "unread", label: "Belum Dibaca" },
    { id: "campaign", label: "Campaign" },
    { id: "negosiasi", label: "Negosiasi" },
    ...(theme === "kreator" ? [{ id: "rate_card" as FilterTab, label: "Rate Card" }] : []),
    { id: "keuangan", label: "Keuangan" },
    { id: "sistem", label: "Sistem" },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div
              className="inline-flex items-center gap-2 text-[.74rem] font-[900] tracking-[.12em] uppercase mb-1.5"
              style={{ color: t.accent }}
            >
              <span className="block w-[18px] h-0.5 rounded-full" style={{ background: t.accent }} />
              {t.eyebrow}
            </div>
            <h2 className="font-display text-[clamp(1.35rem,2.5vw,1.9rem)] font-bold tracking-[-0.065em] text-ink-950 leading-none mb-1.5">
              {t.pageTitle}
            </h2>
            <p className="text-ink-500 text-[.88rem]">
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : "Semua notifikasi sudah dibaca"}
            </p>
          </div>

          {/* Bulk action buttons */}
          <div className="flex gap-2 flex-wrap items-start">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={cn(
                  "inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer",
                  t.markAllCls
                )}
              >
                <CheckCheck size={14} />
                Tandai Semua Dibaca
              </button>
            )}
            <button
              onClick={deleteAllRead}
              disabled={!notifs.some(n => n.isRead)}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl text-xs font-bold border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              Hapus Sudah Dibaca
            </button>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer select-none",
                activeTab === tab.id
                  ? cn(t.tabActiveCls, "shadow-sm")
                  : "bg-white text-neutral-500 border-neutral-200/70 hover:border-neutral-300 hover:text-neutral-700"
              )}
            >
              {tab.label}
              {tab.id === "unread" && unreadCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[17px] h-[17px] rounded-full px-1 text-[9px] font-black border",
                    activeTab === "unread" ? "bg-white/25 text-white border-white/20" : t.badgeCls
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notification list or Empty state ── */}
        {visible.length === 0 && !isLoadingMore ? (
          <div className="bg-white border border-neutral-200/80 rounded-[26px] shadow-[0_4px_16px_rgba(15,23,42,.05)] p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 grid place-items-center mx-auto mb-4 text-neutral-300">
              <BellOff size={26} />
            </div>
            <h3 className="font-display font-black text-neutral-800 text-base mb-1.5 tracking-tight">
              {activeTab === "unread" ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"}
            </h3>
            <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
              {activeTab === "unread"
                ? "Semua notifikasi sudah Anda baca."
                : "Notifikasi baru akan muncul di sini."}
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-4 text-xs font-bold underline underline-offset-2 cursor-pointer"
                style={{ color: t.accent }}
              >
                Lihat semua notifikasi
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200/80 rounded-[26px] shadow-[0_4px_16px_rgba(15,23,42,.05)] overflow-hidden divide-y divide-neutral-100/80">
            {visible.map(notif => {
              const cfg = NOTIF_CFG[notif.type];
              const Icon = cfg.icon;
              const isDeleting = deletingIds.has(notif.id);

              return (
                <div
                  key={notif.id}
                  className={cn(
                    "relative flex gap-3 p-4 sm:p-5 transition-all duration-[280ms] group",
                    isDeleting
                      ? "opacity-0 scale-[0.98] pointer-events-none"
                      : "opacity-100 scale-100",
                    !notif.isRead ? "bg-neutral-50/70" : "bg-white hover:bg-neutral-50/40"
                  )}
                >
                  {/* Unread accent left bar */}
                  {!notif.isRead && (
                    <span
                      className={cn(
                        "absolute left-0 top-[16%] bottom-[16%] w-[3px] rounded-r-full",
                        t.unreadBarCls
                      )}
                      aria-hidden="true"
                    />
                  )}

                  {/* Type icon */}
                  <div
                    className="w-10 h-10 rounded-[14px] grid place-items-center shrink-0 border shadow-[0_2px_8px_rgba(0,0,0,.05)] transition-transform duration-200 group-hover:scale-[1.07] mt-0.5"
                    style={{ background: cfg.iconBg, borderColor: cfg.iconBorder, color: cfg.iconColor }}
                  >
                    <Icon size={17} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        className={cn(
                          "text-[.875rem] leading-snug tracking-tight",
                          notif.isRead
                            ? "font-semibold text-neutral-600"
                            : "font-extrabold text-neutral-900"
                        )}
                      >
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span
                          className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", t.unreadDotCls)}
                          aria-label="Belum dibaca"
                        />
                      )}
                    </div>

                    <p className="text-[.8rem] text-neutral-500 font-medium leading-relaxed line-clamp-2 mb-2.5">
                      {notif.message}
                    </p>

                    {/* Type badge + timestamp row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-[3px] rounded-full text-[9px] font-[800] uppercase tracking-wider border",
                          cfg.badgeCls
                        )}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[.72rem] text-neutral-400 font-semibold">
                        {relativeTime(notif.timestamp)}
                      </span>
                    </div>

                    {/* Inline action links */}
                    {(notif.actionLabel || !notif.isRead) && (
                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        {notif.actionLabel && notif.actionHref && (
                          <Link
                            href={notif.actionHref}
                            onClick={() => markAsRead(notif.id)}
                            className={cn(
                              "inline-flex items-center gap-1 text-[.78rem] font-bold hover:underline underline-offset-2 transition-colors cursor-pointer",
                              t.actionCls
                            )}
                          >
                            {notif.actionLabel}
                            <ChevronRight size={12} />
                          </Link>
                        )}
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-[.78rem] font-bold text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete button (appears on hover) */}
                  <button
                    onClick={() => deleteOne(notif.id)}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
                    aria-label="Hapus notifikasi"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            {/* Loading skeletons */}
            {isLoadingMore && (
              <>
                <SkeletonItem />
                <SkeletonItem />
              </>
            )}

            {/* Intersection observer sentinel (triggers auto-load) */}
            {canLoadMore && (
              <div ref={sentinelRef} className="h-1" aria-hidden="true" />
            )}

            {/* End of list indicator */}
            {!canLoadMore && !isLoadingMore && (
              <div className="py-5 text-center text-[11px] font-semibold text-neutral-400">
                Semua notifikasi telah dimuat
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
