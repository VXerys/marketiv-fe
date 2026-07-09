"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { cn } from "@/lib/utils";
import { getStatusDetails, formatTime, deadlineTime } from "./negotiation.utils";

interface NegotiationRoomCardProps {
  order: NegotiationOrder;
}

const STATUS_STYLE: Record<
  string,
  { border: string; badgeBg: string; badgeText: string; badgeBorder: string; dot: string }
> = {
  negotiation: {
    border: "border-l-blue-400",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200/60",
    dot: "bg-blue-400",
  },
  waiting_payment: {
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
  waiting_verification: {
    border: "border-l-orange-400",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
    badgeBorder: "border-orange-200/60",
    dot: "bg-orange-400",
  },
  completed: {
    border: "border-l-blue-300",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
    badgeBorder: "border-blue-200/60",
    dot: "bg-blue-400",
  },
  dispute: {
    border: "border-l-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200/60",
    dot: "bg-rose-500",
  },
  cancelled: {
    border: "border-l-neutral-300",
    badgeBg: "bg-neutral-50",
    badgeText: "text-neutral-500",
    badgeBorder: "border-neutral-200/60",
    dot: "bg-neutral-300",
  },
};

export function NegotiationRoomCard({ order }: NegotiationRoomCardProps) {
  const statusDetail = getStatusDetails(order.status);
  const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.cancelled;

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
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-neutral-100 border border-neutral-200/60 relative overflow-hidden shadow-3xs transition-transform duration-300 group-hover:scale-105">
            <Image
              src={order.creatorAvatarUrl}
              alt={order.creatorName}
              fill
              className="object-cover"
              sizes="48px"
            />
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
              Deadline: {deadlineTime(order.deadline)}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
            <span className="flex items-center gap-1">
              <Clock size={11} className="shrink-0" />
              Update: {formatTime(order.lastMessageAt)}
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
        <Link
          href={`/dashboard/umkm/negosiasi/${order.id}`}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-4 rounded-xl bg-ink-950 text-white text-[.82rem] font-[800] transition-all duration-200 hover:bg-primary hover:shadow-[0_8px_20px_rgba(234,88,12,.22)] hover:-translate-y-px cursor-pointer select-none no-underline"
        >
          <MessageSquare size={14} className="shrink-0" />
          Buka Room Chat
        </Link>
      </div>
    </div>
  );
}
