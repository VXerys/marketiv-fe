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


  return (
    <div className="group rounded-2xl bg-white border border-border-soft hover:border-primary/25 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_12px_30px_-12px_rgba(235,94,40,0.06),_inset_0_1px_0_rgba(255,255,255,0.95)]">
      
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
            <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-extrabold uppercase tracking-wider", status.bgClass, status.textClass)}>
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
            className="px-4 py-2 rounded-xl bg-neutral-50 hover:bg-primary text-text-primary hover:text-white border border-border-subtle hover:border-primary text-xs font-bold transition-all duration-200 cursor-pointer select-none text-center shadow-3xs"
          >
            Buka Room Chat
          </Link>
        </div>
      </div>

    </div>
  );
}
