"use client";

import Link from "next/link";
import Image from "next/image";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";

interface CreatorMiniProfileCardProps {
  order: NegotiationOrder;
}

export function CreatorMiniProfileCard({ order }: CreatorMiniProfileCardProps) {
  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 select-none shadow-2xs">
      {/* Card header */}
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <div className="h-7 w-7 rounded-lg bg-info/10 border border-info/15 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Profil Kreator
        </span>
      </div>

      <div className="flex gap-3 items-center">
        <div className="h-11 w-11 rounded-xl bg-neutral-100 border border-neutral-200/50 shrink-0 relative overflow-hidden shadow-2xs">
          {order.creatorAvatarUrl ? (
            <Image
              src={order.creatorAvatarUrl}
              alt={order.creatorName}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-black text-neutral-300 text-base">
              {order.creatorName.charAt(0)}
            </span>
          )}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="text-xs font-extrabold text-text-primary truncate leading-tight">
            {order.creatorName}
          </h4>
        </div>
      </div>

      <Link
        href={`/dashboard/umkm/kreator/${order.creatorId}`}
        className="w-full py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-text-primary border border-border-subtle hover:border-neutral-300 text-[10px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 select-none shadow-3xs hover:shadow-2xs"
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Lihat Profil Lengkap
      </Link>
    </div>
  );
}
