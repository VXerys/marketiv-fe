"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStickyToolbar } from "@/hooks/useStickyToolbar";
import { CreatorNegotiation } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  ShieldCheck,
  ClipboardCheck,
  Search,
  Tag,
  Hourglass,
  Clock3,
  SlidersHorizontal,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import {
  getMyConversations,
  setConversationArchived,
  type ConversationFlag,
} from "@/services/shared/conversation.service";
import { toast } from "sonner";

interface NegosiasiViewProps {
  initialNegotiations: CreatorNegotiation[];
}

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
      <div className="font-display text-[1.3rem] sm:text-[1.4rem] font-black text-[#1e1b4b] tracking-tight leading-none mt-1.5">{value}</div>
      <div className="text-[.7rem] text-neutral-400 font-semibold mt-1 leading-none">{helper}</div>
    </div>
  );
}

// ─── NegotiationCard ─────────────────────────────────────────────────────────

// Key = orders.status kanon (lihat src/types/domain.ts)
const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string; border: string; label: string }> = {
  pending_payment: { dot: "bg-blue-400",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200/50",   label: "Menunggu Bayar" },
  escrow:          { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/50", label: "Escrow Aktif" },
  in_progress:     { dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200/50",  label: "Dikerjakan" },
  revision:        { dot: "bg-orange-400",  text: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200/50",  label: "Revisi" },
  approved:        { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200/50",  label: "Disetujui" },
  completed:       { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200/50", label: "Selesai" },
  cancelled:       { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200/50", label: "Dibatalkan" },
};

function NegotiationCard({
  neg,
  isArchived,
  onToggleArchive,
}: {
  neg: CreatorNegotiation;
  isArchived: boolean;
  onToggleArchive: () => void;
}) {
  const s = STATUS_STYLES[neg.status] ?? STATUS_STYLES.pending_payment;
  const dateStr = new Date(neg.lastMessageAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const hasUrgent = neg.unreadCount > 0;

  return (
    <div
      className={cn(
        "group relative bg-white rounded-[20px] border-l-4 border overflow-hidden",
        "shadow-[0_2px_10px_rgba(15,23,42,.04)] hover:shadow-[0_10px_32px_rgba(109,40,217,.09)] hover:-translate-y-0.5",
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
          <span className="font-extrabold text-[#1e1b4b] text-sm group-hover:text-violet-700 transition-colors">
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

        <h4 className="font-extrabold text-sm text-[#1e1b4b] truncate leading-tight flex items-center gap-1.5">
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
          <span className="font-display text-xs font-black text-[#1e1b4b] tracking-tight">
            {formatCurrency(neg.finalPrice)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="self-end sm:self-center flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleArchive}
          title={isArchived ? "Kembalikan ke inbox" : "Arsipkan percakapan"}
          aria-label={isArchived ? "Kembalikan ke inbox" : "Arsipkan percakapan"}
          className="flex items-center justify-center h-9 w-9 rounded-[12px] border border-neutral-200 text-neutral-400 hover:text-[#7c3aed] hover:border-violet-200 transition-colors cursor-pointer"
        >
          {isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
        </button>
        <Link
          href={`/dashboard/kreator/negosiasi/${neg.id}`}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] text-[11px] font-extrabold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            boxShadow: "0 4px 14px rgba(124,58,237,.25)",
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

export function NegosiasiView({ initialNegotiations }: NegosiasiViewProps) {
  const [negotiations] = useState<CreatorNegotiation[]>(initialNegotiations);
  const [conversations, setConversations] = useState<ConversationFlag[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [filterOpen, setFilterOpen] = useState(false);
  const { toolbarRef, isSticky } = useStickyToolbar();

  /**
   * Status arsip tidak ikut di DTO `get-creator-negotiations` (Function-nya
   * belum memfilter `is_archived` sama sekali), jadi dibaca terpisah dan
   * dijodohkan di klien. Gagal memuat = semua percakapan dianggap belum
   * diarsipkan; daftar tetap tampil utuh.
   */
  useEffect(() => {
    let active = true;
    getMyConversations().then((res) => {
      if (active && res.success && res.data) setConversations(res.data);
    });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Cukup di-key umkmId: getMyConversations hanya mengembalikan percakapan
   * sesi ini, dan `umkm_id + creator_id` unik — jadi untuk satu kreator,
   * satu UMKM = satu percakapan.
   */
  const conversationByUmkm = new Map(conversations.map((c) => [c.umkmId, c]));

  const handleToggleArchive = async (neg: CreatorNegotiation) => {
    const conv = conversationByUmkm.get(neg.umkmId);
    if (!conv) {
      toast.error("Percakapan untuk negosiasi ini belum tersedia.");
      return;
    }
    const next = !conv.isArchived;
    const res = await setConversationArchived(conv.id, next);
    if (!res.success) {
      toast.error(res.error ?? "Gagal mengubah status arsip.");
      return;
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, isArchived: next } : c))
    );
    toast.success(next ? "Percakapan diarsipkan." : "Percakapan dikembalikan ke inbox.");
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
  };

  const countNegotiation        = negotiations.filter(n => n.status === "pending_payment").length;
  const countPendingPayment     = negotiations.filter(n => n.status === "pending_payment").length;
  const countEscrow             = negotiations.filter(n => ["escrow","in_progress","revision","approved"].includes(n.status)).length;
  const countCompleted          = negotiations.filter(n => n.status === "completed").length;
  const totalUnread             = negotiations.reduce((acc, n) => acc + (n.unreadCount || 0), 0);

  const filteredNegotiations = negotiations
    .filter((n) => {
      const matchesSearch =
        n.umkmName.toLowerCase().includes(search.toLowerCase()) ||
        n.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
        n.lastMessage.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "negosiasi" && n.status === "pending_payment") ||
        (selectedStatus === "menunggu-pembayaran" && n.status === "pending_payment") ||
        (selectedStatus === "escrow" && ["escrow","in_progress","revision","approved"].includes(n.status)) ||
        (selectedStatus === "selesai" && n.status === "completed");

      // Tanpa baris percakapan, anggap belum diarsipkan — baris tetap terlihat.
      const isArchived = conversationByUmkm.get(n.umkmId)?.isArchived ?? false;

      return matchesSearch && matchesStatus && isArchived === showArchived;
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const hasActiveFilters = search !== "" || selectedStatus !== "all";

  const archivedCount = negotiations.filter(
    (n) => conversationByUmkm.get(n.umkmId)?.isArchived ?? false
  ).length;


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
              badge={totalUnread > 0 ? `${totalUnread} unread` : undefined}
              badgeClass="bg-violet-50 border-violet-200/40 text-violet-600"
            />
            <MetricTile
              label="Menunggu Pembayaran"
              value={countPendingPayment}
              helper="Tawaran kamu disetujui"
              iconClass="text-blue-600 bg-blue-50 border-blue-200/50"
              icon={<Hourglass className="w-4 h-4" />}
              cardClass="border-blue-200/40 shadow-[0_4px_20px_rgba(37,99,235,.06)] bg-gradient-to-br from-blue-50/20 to-white"
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
              cardClass="border-violet-200/40 shadow-[0_4px_20px_rgba(124,58,237,.06)] bg-gradient-to-br from-violet-50/20 to-white"
            />
          </div>

          {/* Toolbar — sticky when scrolling */}
          <div ref={toolbarRef} className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ position: "sticky", top: 0, zIndex: 30 }}>
          <div
            className="flex flex-col gap-3"
            style={{
              padding: isSticky ? "10px 14px" : "14px",
              borderRadius: isSticky ? 18 : 20,
              border: "1px solid rgba(17,24,39,.08)",
              background: isSticky ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.8)",
              backdropFilter: isSticky ? "blur(24px)" : "none",
              WebkitBackdropFilter: isSticky ? "blur(24px)" : "none",
              boxShadow: isSticky ? "0 8px 30px rgba(15,23,42,.08), 0 1px 0 rgba(255,255,255,.8) inset" : "0 2px 8px rgba(15,23,42,.04)",
              transition: "all .28s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            {/* Row 1: Search + mobile filter toggle */}
            <div className="flex gap-2.5 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari UMKM / judul order..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all font-medium text-neutral-800 placeholder-neutral-400"
                />
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={cn(
                  "sm:hidden shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  filterOpen || hasActiveFilters
                    ? "bg-violet-50 text-violet-700 border-violet-200"
                    : "bg-neutral-50/50 text-neutral-700 border-neutral-200/60"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
              </button>
            </div>

            {/* Row 2: All filters — always on sm+, collapsible on mobile */}
            <div className={cn("items-center gap-3 flex-wrap", filterOpen ? "flex" : "hidden sm:flex")}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:block" />

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[170px]"
              >
                <option value="all">Semua Status</option>
                <option value="negosiasi">Negosiasi</option>
                <option value="menunggu-pembayaran">Menunggu Pembayaran</option>
                <option value="escrow">Escrow Aktif</option>
                <option value="selesai">Selesai</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[130px]"
              >
                <option value="latest">Terbaru</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors whitespace-nowrap ml-auto border border-neutral-200/60 rounded-xl hover:bg-neutral-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </div>
          </div>

          {/* Tab Inbox / Arsip */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer border",
                showArchived
                  ? "border-neutral-200/60 text-neutral-500 hover:bg-neutral-50"
                  : "border-transparent bg-[#7c3aed] text-white"
              )}
            >
              Inbox
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer border",
                showArchived
                  ? "border-transparent bg-[#7c3aed] text-white"
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
                  : "Kamu belum menerima chat negosiasi dari UMKM untuk penawaran paket Rate Card."
              }
              actionButton={
                hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow border border-transparent cursor-pointer"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 14px rgba(124,58,237,.28)" }}
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
                  isArchived={conversationByUmkm.get(neg.umkmId)?.isArchived ?? false}
                  onToggleArchive={() => handleToggleArchive(neg)}
                />
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
