"use client";

import { useState } from "react";
import Link from "next/link";
import { CreatorNegotiation } from "@/types/creator-dashboard";
import { toast } from "sonner";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { CreatorCardSkeleton, CreatorMetricSkeleton } from "./CreatorSkeleton";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  ShieldCheck,
  ClipboardCheck,
  Search,
  Tag,
  ChevronRight,
  Hourglass,
  Sparkles,
  Clock3,
} from "lucide-react";

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

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string; border: string; label: string }> = {
  Negosiasi:          { dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200/50",  label: "Negosiasi" },
  MenungguPembayaran: { dot: "bg-blue-400",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200/50",   label: "Menunggu Bayar" },
  Escrow:             { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/50", label: "Escrow Aktif" },
  Revisi:             { dot: "bg-orange-400",  text: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200/50",  label: "Revisi" },
  MenungguVerifikasi: { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200/50",  label: "Verifikasi" },
  Selesai:            { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200/50", label: "Selesai" },
};

function NegotiationCard({ neg }: { neg: CreatorNegotiation }) {
  const s = STATUS_STYLES[neg.status] ?? STATUS_STYLES.Negosiasi;
  const dateStr = new Date(neg.lastMessageAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const isActive = neg.status === "Negosiasi";
  const hasUrgent = neg.unreadCount > 0;

  return (
    <div
      className={cn(
        "group bg-white rounded-[22px] border overflow-hidden shadow-[0_2px_16px_rgba(15,23,42,.04)] hover:shadow-[0_16px_48px_rgba(109,40,217,.10)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col",
        hasUrgent
          ? "border-violet-300/40 ring-1 ring-violet-200/50"
          : "border-neutral-200/60 hover:border-violet-300/30"
      )}
    >
      {/* Top accent bar for active/unread */}
      {hasUrgent && (
        <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-400" />
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-[14px] border border-neutral-200/40 overflow-hidden bg-neutral-50 flex items-center justify-center font-black text-neutral-300 text-lg">
              {neg.umkmAvatarUrl ? (
                <img src={neg.umkmAvatarUrl} alt={neg.umkmName} className="w-full h-full object-cover" />
              ) : (
                <span>{neg.umkmName.charAt(0)}</span>
              )}
            </div>
            {isActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white" />
            )}
          </div>

          {/* Name + project */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-extrabold text-[#1e1b4b] text-sm truncate leading-tight group-hover:text-violet-700 transition-colors">
                {neg.umkmName}
              </h4>
              <span className="text-[10px] text-neutral-400 font-bold shrink-0 flex items-center gap-1">
                <Clock3 className="w-3 h-3" />
                {dateStr}
              </span>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider truncate flex items-center gap-1.5">
              <Tag className="w-3 h-3 shrink-0" />
              <span>{neg.projectTitle}</span>
            </p>
          </div>
        </div>

        {/* Last message bubble */}
        <div className="relative bg-neutral-50/80 border border-neutral-100 rounded-[16px] px-4 py-3">
          <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Pesan Terakhir</span>
          <p className="text-xs text-neutral-600 font-semibold line-clamp-2 leading-relaxed">
            &ldquo;{neg.lastMessage}&rdquo;
          </p>
          {neg.unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 bg-violet-600 rounded-full text-white font-extrabold text-[9px] flex items-center justify-center shadow-md">
              {neg.unreadCount}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-50 rounded-[14px] px-3.5 py-3 border border-neutral-100">
            <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Harga Deal</span>
            <span className="font-display text-sm font-black text-[#1e1b4b] tracking-tight">
              {formatCurrency(neg.finalPrice)}
            </span>
          </div>
          <div className="bg-neutral-50 rounded-[14px] px-3.5 py-3 border border-neutral-100">
            <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Status</span>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold border",
              s.text, s.bg, s.border
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
              {s.label}
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          href={`/dashboard/kreator/negosiasi/${neg.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group/btn"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow: "0 4px 16px rgba(124,58,237,.28)",
          }}
        >
          <MessageSquare className="w-3.5 h-3.5 opacity-80 group-hover/btn:opacity-100" />
          Buka Room Negosiasi
          <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function NegosiasiView({ initialNegotiations }: NegosiasiViewProps) {
  const [negotiations] = useState<CreatorNegotiation[]>(initialNegotiations);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [isLoadingSimulated] = useState(false);
  const [isEmptySimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
  };

  const countNegotiation        = negotiations.filter(n => n.status === "Negosiasi").length;
  const countPendingPayment     = negotiations.filter(n => n.status === "MenungguPembayaran").length;
  const countEscrow             = negotiations.filter(n => ["Escrow","Revisi","MenungguVerifikasi"].includes(n.status)).length;
  const countCompleted          = negotiations.filter(n => n.status === "Selesai").length;
  const totalUnread             = negotiations.reduce((acc, n) => acc + (n.unreadCount || 0), 0);

  const filteredNegotiations = negotiations
    .filter((n) => {
      const matchesSearch =
        n.umkmName.toLowerCase().includes(search.toLowerCase()) ||
        n.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
        n.lastMessage.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "negosiasi" && n.status === "Negosiasi") ||
        (selectedStatus === "menunggu-pembayaran" && n.status === "MenungguPembayaran") ||
        (selectedStatus === "escrow" && ["Escrow","Revisi","MenungguVerifikasi"].includes(n.status)) ||
        (selectedStatus === "selesai" && n.status === "Selesai");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const hasActiveFilters = search !== "" || selectedStatus !== "all";

  if (isErrorSimulated) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[80vh]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4.5 mb-8 max-w-md w-full flex items-center justify-between shadow-sm text-xs font-semibold text-red-800">
          <span>Mode Uji Coba Error Aktif.</span>
          <button
            onClick={() => setIsErrorSimulated(false)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer font-bold"
          >
            Matikan Mode Error
          </button>
        </div>
        <CreatorErrorState
          errorMsg="Gagal memuat daftar negosiasi Rate Card. Silakan periksa jaringan Anda."
          onRetry={() => setIsErrorSimulated(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      {isLoadingSimulated ? (
        <div>
          <CreatorMetricSkeleton />
          <div className="h-10 bg-white border border-neutral-200/50 rounded-xl animate-pulse w-full mb-6" />
          <CreatorCardSkeleton count={4} />
        </div>
      ) : (
        <div>
          <CreatorPageHeader
            title="Negosiasi Rate Card"
            description="Kelola order Rate Card dari UMKM."
          />

          {/* Metric tiles — 2/3/4 Dashboard Rule */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-7">
            <MetricTile
              label="Negosiasi Aktif"
              value={countNegotiation}
              helper="Dalam chat negosiasi"
              iconClass="text-amber-600 bg-amber-50 border-amber-200/50"
              icon={<MessageSquare className="w-4 h-4" />}
              cardClass="border-amber-200/40 shadow-[0_4px_20px_rgba(217,119,6,.06)] bg-gradient-to-br from-amber-50/20 to-white"
              badge={totalUnread > 0 ? `${totalUnread} unread` : undefined}
              badgeClass="bg-violet-50 border-violet-200/40 text-violet-600"
            />
            <MetricTile
              label="Menunggu Pembayaran"
              value={countPendingPayment}
              helper="UMKM bayar invoice"
              iconClass="text-blue-600 bg-blue-50 border-blue-200/50"
              icon={<Hourglass className="w-4 h-4" />}
              cardClass="border-blue-200/40 shadow-[0_4px_20px_rgba(37,99,235,.06)] bg-gradient-to-br from-blue-50/20 to-white"
            />
            <MetricTile
              label="Escrow Aktif"
              value={countEscrow}
              helper="Dana aman ter-escrow"
              iconClass="text-emerald-600 bg-emerald-50 border-emerald-200/50"
              icon={<ShieldCheck className="w-4 h-4" />}
              cardClass="border-emerald-200/40 shadow-[0_4px_20px_rgba(22,163,74,.06)] bg-gradient-to-br from-emerald-50/20 to-white"
            />
            <MetricTile
              label="Order Selesai"
              value={countCompleted}
              helper="Negosiasi selesai"
              iconClass="text-neutral-500 bg-neutral-100 border-neutral-200/50"
              icon={<ClipboardCheck className="w-4 h-4" />}
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6 bg-white/80 border border-neutral-200/50 p-3.5 rounded-[20px]">
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

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[170px]"
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
              className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[130px]"
            >
              <option value="latest">Terbaru</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset
              </button>
            )}
          </div>

          {/* Negotiation cards */}
          {isEmptySimulated || filteredNegotiations.length === 0 ? (
            <CreatorEmptyState
              title="Belum ada negosiasi Rate Card"
              description={
                hasActiveFilters
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              {filteredNegotiations.map((neg) => (
                <NegotiationCard key={neg.id} neg={neg} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
