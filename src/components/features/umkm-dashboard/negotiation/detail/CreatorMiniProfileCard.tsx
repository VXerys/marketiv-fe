"use client";

import Link from "next/link";
import Image from "next/image";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";

interface CreatorMiniProfileCardProps {
  order: NegotiationOrder;
}

export function CreatorMiniProfileCard({ order }: CreatorMiniProfileCardProps) {
  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 shadow-2xs select-none">
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Profil Kreator
        </span>
      </div>

      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-lg bg-neutral-100 border border-neutral-200/50 shrink-0 relative overflow-hidden shadow-3xs">
          <Image
            src={order.creatorAvatarUrl}
            alt={order.creatorName}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>

        <div className="space-y-1 min-w-0">
          <h4 className="text-xs font-extrabold text-text-primary truncate leading-tight">
            {order.creatorName}
          </h4>
          
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-warning shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] font-extrabold text-text-primary">
              4.9
            </span>
            <span className="text-[9px] text-text-muted font-bold">
              (30+ Kerja Sama)
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/dashboard/umkm/kreator/${order.creatorId}`}
        className="w-full py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-text-primary border border-border-subtle hover:border-neutral-300 text-[10px] font-extrabold transition-all duration-200 cursor-pointer block text-center select-none shadow-3xs"
      >
        Lihat Profil Lengkap
      </Link>
    </div>
  );
}
