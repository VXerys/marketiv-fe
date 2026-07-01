"use client";

import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";

interface OrderSummaryCardProps {
  order: NegotiationOrder;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const deadlineDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 shadow-2xs select-none">
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Ringkasan Proyek
        </span>
      </div>

      <div className="space-y-3.5 text-xs font-semibold text-text-secondary">
        <div>
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
            Nama Kreator
          </span>
          <span className="text-xs font-extrabold text-text-primary block">
            {order.creatorName}
          </span>
        </div>

        <div>
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
            Judul Pekerjaan
          </span>
          <span className="text-xs font-bold text-text-primary block leading-relaxed">
            {order.projectTitle}
          </span>
        </div>

        <div>
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
            Harga Kerja Sama
          </span>
          <span className="text-sm font-extrabold text-primary block">
            {formatCurrency(order.finalPrice)}
          </span>
        </div>

        <div>
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
            Batas Waktu Kirim
          </span>
          <span className="text-xs font-extrabold text-text-primary block">
            {deadlineDate(order.deadline)}
          </span>
        </div>

        <div className="border-t border-dashed border-border-soft pt-3">
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">
            Lingkup Deliverable
          </span>
          <p className="text-[10px] text-text-secondary leading-relaxed font-semibold">
            {order.scope}
          </p>
        </div>
      </div>
    </div>
  );
}
