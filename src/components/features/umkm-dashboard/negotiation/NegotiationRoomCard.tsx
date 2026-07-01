"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { cn } from "@/lib/utils";
import { getStatusDetails, formatTime, deadlineTime } from "./negotiation.utils";

interface NegotiationRoomCardProps {
  order: NegotiationOrder;
}

export function NegotiationRoomCard({ order }: NegotiationRoomCardProps) {
  const status = getStatusDetails(order.status);

  // Map status code to UI Kit badge class names
  const getBadgeClass = (s: string) => {
    switch (s) {
      case "negotiation":
        return "badge blue";
      case "waiting_payment":
        return "badge yellow";
      case "escrow":
        return "badge orange";
      case "revision":
        return "badge red";
      case "waiting_verification":
        return "badge yellow";
      case "completed":
        return "badge green";
      case "dispute":
        return "badge red";
      case "cancelled":
        return "badge gray";
      default:
        return "badge gray";
    }
  };

  return (
    <div className="panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      
      {/* Left side details */}
      <div className="flex gap-4 flex-1 min-w-0">
        <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-200/50 shrink-0 relative overflow-hidden shadow-2xs">
          <Image
            src={order.creatorAvatarUrl}
            alt={order.creatorName}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-text-primary group-hover:text-primary transition-colors">
              {order.creatorName}
            </span>
            <span className={cn(getBadgeClass(order.status))}>
              {status.label}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight truncate">
            {order.projectTitle}
          </h3>

          <p className="text-[10px] sm:text-xs text-text-secondary line-clamp-1 font-semibold leading-relaxed">
            {order.lastMessage}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold text-text-muted">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Deadline: {deadlineTime(order.deadline)}</span>
            </span>
            <span>&bull;</span>
            <span>Update: {formatTime(order.lastMessageAt)}</span>
          </div>
        </div>
      </div>

      {/* Right side pricing & CTAs */}
      <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-center w-full md:w-auto shrink-0 border-t md:border-t-0 border-dashed border-border-soft pt-4 md:pt-0 gap-4">
        {/* Price & Unread count */}
        <div className="flex items-center gap-2.5 md:text-right">
          <div className="space-y-0.5">
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider leading-none">
              Nilai Proyek
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-primary block">
              {formatCurrency(order.finalPrice)}
            </span>
          </div>
          {order.unreadCount > 0 && (
            <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center border border-white shadow-2xs shrink-0 animate-bounce">
              {order.unreadCount}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/umkm/negosiasi/${order.id}`}
            className="px-4 py-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold transition-all duration-200 cursor-pointer select-none text-center shadow-3xs"
          >
            Buka Room Chat
          </Link>
        </div>
      </div>

    </div>
  );
}
