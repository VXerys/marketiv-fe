"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Clock, AlertCircle, Archive, ArchiveRestore } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { cn } from "@/lib/utils";
import { getStatusDetails, formatTime, deadlineTime } from "./negotiation.utils";

interface NegotiationRoomCardProps {
  order: NegotiationOrder;
  isArchived?: boolean;
  onToggleArchive?: () => void;
}

type StageStyle = {
  border: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dot: string;
};

/**
 * Key = `NegotiationStage` (src/types/domain.ts).
 *
 * Sebelumnya peta ini memakai kosakata lama — `negotiation`, `waiting_payment`,
 * `waiting_verification`, `dispute` — yang tidak pernah dihasilkan `deriveStage`
 * di Function negosiasi. Akibatnya hampir setiap kartu meleset ke fallback
 * `cancelled` dan SEMUA negosiasi aktif tampil abu-abu seperti dibatalkan.
 * Tidak pernah error, jadi tidak pernah ketahuan.
 */
const STATUS_STYLE: Record<string, StageStyle> = {
  chatting: {
    border: "border-l-neutral-300",
    badgeBg: "bg-neutral-50",
    badgeText: "text-neutral-600",
    badgeBorder: "border-neutral-200/60",
    dot: "bg-neutral-400",
  },
  offer_pending: {
    border: "border-l-blue-400",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200/60",
    dot: "bg-blue-400",
  },
  offer_rejected: {
    border: "border-l-rose-400",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200/60",
    dot: "bg-rose-400",
  },
  awaiting_order: {
    border: "border-l-indigo-400",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-200/60",
    dot: "bg-indigo-400",
  },
  pending_payment: {
    border: "border-l-amber-400",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200/60",
    dot: "bg-amber-400",
  },
  escrow: {
    border: "border-l-emerald-400",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200/60",
    dot: "bg-emerald-400",
  },
  revision: {
    border: "border-l-red-400",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200/60",
    dot: "bg-red-400",
  },
  in_progress: {
    border: "border-l-orange-400",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
    badgeBorder: "border-orange-200/60",
    dot: "bg-orange-400",
  },
  approved: {
    border: "border-l-violet-400",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    badgeBorder: "border-violet-200/60",
    dot: "bg-violet-400",
  },
  completed: {
    border: "border-l-blue-300",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
    badgeBorder: "border-blue-200/60",
    dot: "bg-blue-400",
  },
  cancelled: {
    border: "border-l-neutral-300",
    badgeBg: "bg-neutral-50",
    badgeText: "text-neutral-500",
    badgeBorder: "border-neutral-200/60",
    dot: "bg-neutral-300",
  },
};

/** Dipakai bila `stage` tidak dikenali. Fallback ke `cancelled` menandai
 *  negosiasi yang masih hidup sebagai dibatalkan — itu bohong ke pengguna. */
const UNKNOWN_STAGE_STYLE: StageStyle = STATUS_STYLE.chatting;

export function NegotiationRoomCard({
  order,
  isArchived = false,
  onToggleArchive,
}: NegotiationRoomCardProps) {
  const [imgError, setImgError] = useState(false);
  const statusDetail = getStatusDetails(order.stage);
  const style = STATUS_STYLE[order.stage] ?? UNKNOWN_STAGE_STYLE;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border-l-4 border border-neutral-200/80",
        "bg-gradient-to-b from-white to-neutral-50/30 shadow-3xs",
        "flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-4 sm:p-5",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300/80 cursor-default",
        style.border
      )}
    >
      {/* Left: Avatar + content */}
      <div className="flex gap-4 flex-1 min-w-0">
        {/* Avatar with unread badge */}
        <div className="relative shrink-0">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-orange-100 border border-neutral-200/60 relative overflow-hidden shadow-3xs transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
            {order.creatorAvatarUrl && !imgError ? (
              <Image
                src={order.creatorAvatarUrl}
                alt={order.creatorName}
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="font-black text-orange-600 text-base sm:text-lg select-none">
                {order.creatorName?.charAt(0) ?? "?"}
              </span>
            )}
          </div>
          {order.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-[18px] w-[18px] rounded-full bg-primary text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-3xs">
              {order.unreadCount > 9 ? "9+" : order.unreadCount}
            </span>
          )}
        </div>

        {/* Text content */}
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Creator name + status badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[.84rem] font-extrabold text-ink-900 group-hover:text-primary transition-colors duration-200">
              {order.creatorName}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full border text-[.72rem] font-[800]",
                style.badgeBg,
                style.badgeText,
                style.badgeBorder
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
              {statusDetail.label}
            </span>
          </div>

          {/* Project title */}
          <h3 className="text-[.84rem] sm:text-[.9rem] font-extrabold text-ink-950 tracking-tight truncate leading-tight">
            {order.projectTitle}
          </h3>

          {/* Last message preview */}
          <p className="text-[.76rem] text-ink-400 line-clamp-1 font-semibold leading-relaxed">
            {order.lastMessage}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-[.72rem] font-bold text-ink-400">
            <span className="flex items-center gap-1">
              <AlertCircle size={11} className="shrink-0" />
              Batas Waktu: {deadlineTime(order.deadline)}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
            <span className="flex items-center gap-1">
              <Clock size={11} className="shrink-0" />
              Pesan Terakhir: {formatTime(order.lastMessageAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Price + CTA */}
      <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-center w-full md:w-auto shrink-0 border-t md:border-t-0 border-dashed border-neutral-200 pt-3.5 md:pt-0 gap-4">
        {/* Price */}
        <div className="space-y-0.5 md:text-right">
          <span className="block text-[.66rem] font-extrabold text-ink-400 uppercase tracking-wider leading-none">
            Nilai Proyek
          </span>
          <span className="font-display text-[1.1rem] sm:text-[1.2rem] font-black text-primary tracking-tight leading-none">
            {formatCurrency(order.finalPrice)}
          </span>
        </div>

        {/* CTA button */}
        <div className="flex items-center gap-2">
          {onToggleArchive && (
            <button
              onClick={onToggleArchive}
              title={isArchived ? "Kembalikan ke daftar aktif" : "Arsipkan percakapan"}
              aria-label={isArchived ? "Kembalikan ke daftar aktif" : "Arsipkan percakapan"}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-200 text-ink-400 hover:text-primary hover:border-neutral-300 transition-colors cursor-pointer"
            >
              {isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
            </button>
          )}
          <Link
            href={`/dashboard/umkm/negosiasi/${order.id}`}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-4 rounded-xl bg-ink-950 text-white text-[.82rem] font-[800] transition-all duration-150 hover:bg-primary hover:shadow-[0_8px_20px_rgba(234,88,12,.22)] hover:-translate-y-px active:scale-[0.98] active:translate-y-0 cursor-pointer select-none no-underline"
          >
            <MessageSquare size={14} className="shrink-0" />
            Buka Percakapan
          </Link>
        </div>
      </div>
    </div>
  );
}
