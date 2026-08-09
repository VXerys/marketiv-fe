"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SearchToolbar, type SearchToolbarFilter } from "@/components/features/dashboard/shared";
import { CreatorNegotiation } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { formatCurrency } from "@/lib/formatters";
import { calculatePlatformFee } from "@/types/domain";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  ShieldCheck,
  ClipboardCheck,
  Tag,
  Hourglass,
  Clock3,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { setConversationArchived } from "@/services/shared/conversation.service";
import { getCreatorNegotiations } from "@/services/creator/creator-dashboard.service";
import { CreatorPageSkeleton } from "./CreatorPageSkeleton";
import { toast } from "sonner";

const CREATOR_ACTION_GRADIENT =
  "linear-gradient(135deg, var(--color-kreator-600), var(--color-kreator-action-end))";

/**
 * Tanpa props. Data diambil di klien, BUKAN di Server Component: DTO
 * `get-creator-negotiations` menegakkan kepemilikan lewat header
 * `x-appwrite-user-id` sesi aktif, dan sesi Appwrite hidup di browser — memanggil
 * dari server akan selalu balik 401 (pelajaran `s3-ssr-session`).
 */

// ─── MetricTile ───────────────────────────────────────────────────────────────

interface MetricTileProps {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  iconClass: string;
  cardClass?: string;
  badge?: string;
  badgeClass?: string;
}

function MetricTile({ label, value, helper, icon, iconClass, cardClass, badge, badgeClass }: MetricTileProps) {
  return (
    <div
      className={cn(
        "group relative p-4 sm:p-5 rounded-[22px] border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(15,23,42,.08)] select-none cursor-default",
        cardClass ?? "border-neutral-200/60 shadow-[0_2px_12px_rgba(15,23,42,.03)]"
      )}
    >
      {badge && (
        <div className="absolute top-3.5 right-3.5">
          <span className={cn("px-2.5 py-0.5 rounded-full text-[8px] font-extrabold border uppercase tracking-wider", badgeClass)}>
            {badge}
          </span>
        </div>
      )}
      <div className={cn("h-9 w-9 rounded-[12px] flex items-center justify-center mb-3.5 border transition-transform duration-300 group-hover:scale-105", iconClass)}>
        {icon}
      </div>
      <div className="text-[.67rem] font-extrabold text-neutral-400 uppercase tracking-widest leading-none">{label}</div>
      <div className="font-display text-[1.3rem] sm:text-[1.4rem] font-black text-kreator-ink tracking-tight leading-none mt-1.5">{value}</div>
      <div className="text-[.7rem] text-neutral-400 font-semibold mt-1 leading-none">{helper}</div>
    </div>
  );
}

// ─── NegotiationCard ─────────────────────────────────────────────────────────

type StageStyle = { dot: string; text: string; bg: string; border: string; label: string };

/**
 * Key = `NegotiationStage` (src/types/domain.ts), BUKAN `OrderStatus`.
 *
 * Empat tahap teratas terjadi SEBELUM order lahir, dan di Alur B order lahir
 * paling akhir — jadi justru di sanalah sebagian besar ruang negosiasi berada.
 * Versi sebelumnya hanya memetakan tujuh `OrderStatus` dan mem-fallback ke
 * `STATUS_STYLES.chatting` yang tidak pernah ada, sehingga percakapan baru
 * (stage `chatting`) membuat `s` bernilai undefined dan seluruh halaman
 * Negosiasi kreator crash ke error boundary.
 */
const STATUS_STYLES: Record<string, StageStyle> = {
  chatting:        { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200/50", label: "Diskusi" },
  offer_pending:   { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200/50",  label: "Penawaran Masuk" },
  offer_rejected:  { dot: "bg-rose-400",    text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200/50",    label: "Penawaran Ditolak" },
  awaiting_order:  { dot: "bg-indigo-400",  text: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200/50",  label: "Menyiapkan Pesanan" },
  pending_payment: { dot: "bg-blue-400",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200/50",   label: "Menunggu Bayar" },
  escrow:          { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/50", label: "Escrow Aktif" },
  in_progress:     { dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200/50",  label: "Dikerjakan" },
  revision:        { dot: "bg-orange-400",  text: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200/50",  label: "Revisi" },
  approved:        { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200/50",  label: "Disetujui" },
  completed:       { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200/50", label: "Selesai" },
  cancelled:       { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200/50", label: "Dibatalkan" },
};

/** Dipakai bila `stage` tidak dikenali — selalu ada, jadi tidak pernah undefined. */
const UNKNOWN_STAGE_STYLE: StageStyle = {
  dot: "bg-neutral-300",
  text: "text-neutral-500",
  bg: "bg-neutral-50",
  border: "border-neutral-200/50",
  label: "Negosiasi",
};

function NegotiationCard({
  neg,
  isArchived,
  isToggling,
  onToggleArchive,
}: {
  neg: CreatorNegotiation;
  isArchived: boolean;
  isToggling: boolean;
  onToggleArchive: () => void;
}) {
  // Fallback ke konstanta, bukan ke entri lain di peta — kalau kuncinya salah
  // ketik, `s` diam-diam jadi undefined dan seluruh daftar ikut mati.
  const s = STATUS_STYLES[neg.stage] ?? UNKNOWN_STAGE_STYLE;
  const dateStr = new Date(neg.lastMessageAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const hasUrgent = neg.unreadCount > 0;

  return (
    <div
      className={cn(
        "group relative bg-white rounded-[20px] border-l-4 border overflow-hidden",
        "shadow-1 hover:shadow-kreator-avatar hover:-translate-y-0.5",
        "transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4",
        hasUrgent
          ? "border-l-violet-500 border-violet-200/50"
          : "border-l-neutral-200 border-neutral-200/60 hover:border-violet-200/40"
      )}
    >
      {/* Unread top strip */}
      {hasUrgent && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-400 to-violet-500" />
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-[13px] border border-neutral-200/40 overflow-hidden bg-neutral-50 flex items-center justify-center font-black text-neutral-300 text-lg">
          {neg.umkmAvatarUrl ? (
            <img src={neg.umkmAvatarUrl} alt={neg.umkmName} className="w-full h-full object-cover" />
          ) : (
            <span>{neg.umkmName.charAt(0)}</span>
          )}
        </div>
        {neg.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 bg-violet-600 rounded-full text-white font-extrabold text-[9px] flex items-center justify-center border-2 border-white">
            {neg.unreadCount > 9 ? "9+" : neg.unreadCount}
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-kreator-ink text-sm group-hover:text-violet-700 transition-colors">
            {neg.umkmName}
          </span>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[9px] font-extrabold border",
            s.text, s.bg, s.border
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
            {s.label}
          </span>
        </div>

        <h4 className="font-extrabold text-sm text-kreator-ink truncate leading-tight flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-neutral-400 shrink-0" />
          {neg.projectTitle}
        </h4>

        <p className="text-[10px] text-neutral-500 font-semibold line-clamp-1 leading-relaxed">
          &ldquo;{neg.lastMessage}&rdquo;
        </p>

        <div className="flex items-center gap-3 pt-0.5">
          <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400">
            <Clock3 className="w-2.5 h-2.5 shrink-0" />
            {dateStr}
          </span>
          <div className="flex flex-col gap-0">
            <span className="font-display text-xs font-black text-kreator-ink tracking-tight leading-none">
              {formatCurrency(neg.totalAmount ?? (neg.finalPrice - calculatePlatformFee(neg.finalPrice)))}
            </span>
            <span className="text-[8px] font-semibold text-neutral-400 leading-none">kamu terima</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="self-end sm:self-center flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleArchive}
          disabled={isToggling}
          title={isArchived ? "Kembalikan ke inbox" : "Arsipkan percakapan"}
          aria-label={isArchived ? "Kembalikan ke inbox" : "Arsipkan percakapan"}
          className="flex items-center justify-center h-9 w-9 rounded-[12px] border border-neutral-200 text-neutral-400 hover:text-kreator-600 hover:border-violet-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          {isToggling
            ? <span className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-violet-500 rounded-full animate-spin" />
            : isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />
          }
        </button>
        <Link
          href={`/dashboard/kreator/negosiasi/${neg.id}`}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] text-[11px] font-extrabold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: CREATOR_ACTION_GRADIENT,
            boxShadow: "var(--shadow-kreator)",
          }}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Buka Room
        </Link>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function NegosiasiView() {
  const [negotiations, setNegotiations] = useState<CreatorNegotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  /**
   * Status arsip kini ikut di DTO `get-creator-negotiations` (`isArchived`
   * dibaca langsung dari `conversations.is_archived`), jadi query terpisah dan
   * penjodohan per-umkmId yang dulu ada di sini tidak diperlukan lagi.
   */
  const handleToggleArchive = async (neg: CreatorNegotiation) => {
    if (togglingId === neg.conversationId) return;
    const next = !neg.isArchived;
    setTogglingId(neg.conversationId);
    const res = await setConversationArchived(neg.conversationId, next);
    setTogglingId(null);
    if (!res.success) {
      toast.error(res.error ?? "Gagal mengubah status arsip.");
      return;
    }
    setNegotiations((prev) =>
      prev.map((n) => (n.conversationId === neg.conversationId ? { ...n, isArchived: next } : n))
    );
    toast.success(next ? "Percakapan diarsipkan." : "Percakapan dikembalikan ke inbox.");
  };

  const loadNegotiations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getCreatorNegotiations();
    if (res.success && res.data) {
      setNegotiations(res.data);
    } else {
      setError(res.error ?? "Gagal memuat daftar negosiasi.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadNegotiations();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadNegotiations]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSortBy("latest");
  };

  // "Negosiasi" dan "Menunggu pembayaran" dulu menghitung hal yang PERSIS SAMA
  // (`pending_payment`) karena tahap sebelum order belum punya nilai status.
  // Sekarang keduanya benar-benar berbeda.
  const NEGOTIATING_STAGES = ["chatting", "offer_pending", "offer_rejected", "awaiting_order"];
  const ESCROW_STAGES = ["escrow", "in_progress", "revision", "approved"];

  const countNegotiation        = negotiations.filter(n => NEGOTIATING_STAGES.includes(n.stage)).length;
  const countPendingPayment     = negotiations.filter(n => n.stage === "pending_payment").length;
  const countEscrow             = negotiations.filter(n => ESCROW_STAGES.includes(n.stage)).length;
  const countCompleted          = negotiations.filter(n => n.stage === "completed").length;
  const totalUnread             = negotiations.reduce((acc, n) => acc + (n.unreadCount || 0), 0);

  const filteredNegotiations = negotiations
    .filter((n) => {
      const matchesSearch =
        n.umkmName.toLowerCase().includes(search.toLowerCase()) ||
        n.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
        n.lastMessage.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "negosiasi" && NEGOTIATING_STAGES.includes(n.stage)) ||
        (selectedStatus === "menunggu-pembayaran" && n.stage === "pending_payment") ||
        (selectedStatus === "escrow" && ESCROW_STAGES.includes(n.stage)) ||
        (selectedStatus === "selesai" && n.stage === "completed");

      const isArchived = n.isArchived;

      return matchesSearch && matchesStatus && isArchived === showArchived;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === "price_desc") return (b.totalAmount ?? b.finalPrice) - (a.totalAmount ?? a.finalPrice);
      if (sortBy === "unread") return b.unreadCount - a.unreadCount;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

  const hasActiveFilters = search !== "" || selectedStatus !== "all";
  const toolbarFilters: SearchToolbarFilter[] = [
    {
      label: "Status",
      value: selectedStatus,
      onChange: setSelectedStatus,
      options: [
        { value: "all", label: "Semua Status" },
        { value: "negosiasi", label: "Negosiasi" },
        { value: "menunggu-pembayaran", label: "Menunggu Pembayaran" },
        { value: "escrow", label: "Escrow Aktif" },
        { value: "selesai", label: "Selesai" },
      ],
    },
    {
      label: "Urutan",
      value: sortBy,
      onChange: setSortBy,
      options: [
        { value: "latest", label: "Terbaru" },
        { value: "deadline", label: "Deadline Terdekat" },
        { value: "price_desc", label: "Harga Tertinggi" },
        { value: "unread", label: "Belum Dibaca" },
      ],
      prefix: "Urut",
    },
  ];

  const archivedCount = negotiations.filter((n) => n.isArchived).length;

  if (loading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <CreatorPageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[50vh]">
        <CreatorEmptyState
          title="Gagal memuat negosiasi"
          description={error}
          actionButton={
            <button
              onClick={() => void loadNegotiations()}
              className="text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow cursor-pointer"
              style={{ background: CREATOR_ACTION_GRADIENT }}
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 relative">
        <div>
          <CreatorPageHeader
            title="Negosiasi Rate Card"
            description="Kelola order Rate Card dari UMKM."
          />

          {/* Metric tiles — 4 cards max, 1 row on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
            <MetricTile
              label="Negosiasi Aktif"
              value={countNegotiation}
              helper="Perlu respons kamu"
              iconClass="text-amber-600 bg-amber-50 border-amber-200/50"
              icon={<MessageSquare className="w-4 h-4" />}
              cardClass="border-amber-200/40 shadow-[0_4px_20px_rgba(217,119,6,.06)] bg-gradient-to-br from-amber-50/20 to-white"
              badge={totalUnread > 0 ? `${totalUnread} belum dibaca` : undefined}
              badgeClass="bg-violet-50 border-violet-200/40 text-violet-600"
            />
            <MetricTile
              label="Menunggu Pembayaran"
              value={countPendingPayment}
              helper="Tawaran kamu disetujui"
              iconClass="text-blue-600 bg-blue-50 border-blue-200/50"
              icon={<Hourglass className="w-4 h-4" />}
              cardClass="border-blue-200/40 shadow-kreator-brand-sm bg-gradient-to-br from-blue-50/20 to-white"
            />
            <MetricTile
              label="Escrow Aktif"
              value={countEscrow}
              helper="Kamu sedang mengerjakan"
              iconClass="text-emerald-600 bg-emerald-50 border-emerald-200/50"
              icon={<ShieldCheck className="w-4 h-4" />}
              cardClass="border-emerald-200/40 shadow-[0_4px_20px_rgba(22,163,74,.06)] bg-gradient-to-br from-emerald-50/20 to-white"
            />
            <MetricTile
              label="Order Selesai"
              value={countCompleted}
              helper="Reward siap dicairkan"
              iconClass="text-violet-600 bg-violet-50 border-violet-200/50"
              icon={<ClipboardCheck className="w-4 h-4" />}
              cardClass="border-violet-200/40 shadow-kreator-brand-sm bg-gradient-to-br from-violet-50/20 to-white"
            />
          </div>

          {/* Toolbar — sticky when scrolling */}
          <div className="mb-6">
            <SearchToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Cari UMKM / judul order..."
              filters={toolbarFilters}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
          {/* Tab Inbox / Arsip */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer border",
                showArchived
                  ? "border-neutral-200/60 text-neutral-500 hover:bg-neutral-50"
                  : "border-transparent bg-kreator-600 text-white"
              )}
            >
              Inbox
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer border",
                showArchived
                  ? "border-transparent bg-kreator-600 text-white"
                  : "border-neutral-200/60 text-neutral-500 hover:bg-neutral-50"
              )}
            >
              Arsip{archivedCount > 0 ? ` (${archivedCount})` : ""}
            </button>
          </div>

          {/* Negotiation cards */}
          {filteredNegotiations.length === 0 ? (
            <CreatorEmptyState
              title={showArchived ? "Tidak ada percakapan diarsipkan" : "Belum ada negosiasi Rate Card"}
              description={
                showArchived
                  ? "Percakapan yang kamu arsipkan akan muncul di sini."
                  : hasActiveFilters
                  ? "Tidak ada negosiasi yang cocok dengan filter pencarian Anda."
                  : "Belum ada chat negosiasi masuk dari UMKM buat paket Rate Card kamu."
              }
              actionButton={
                hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow border border-transparent cursor-pointer"
                    style={{ background: CREATOR_ACTION_GRADIENT, boxShadow: "var(--shadow-kreator)" }}
                  >
                    Reset Filter
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
              {filteredNegotiations.map((neg) => (
                <NegotiationCard
                  key={neg.id}
                  neg={neg}
                  isArchived={neg.isArchived}
                  isToggling={togglingId === neg.conversationId}
                  onToggleArchive={() => handleToggleArchive(neg)}
                />
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
