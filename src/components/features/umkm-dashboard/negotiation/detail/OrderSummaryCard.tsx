"use client";

import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";

interface OrderSummaryCardProps {
  order: NegotiationOrder;
  onCancelOrder?: () => void;
}

export function OrderSummaryCard({ order, onCancelOrder }: OrderSummaryCardProps) {
  // Sejalan dengan guard service: begitu dana masuk escrow, pembatalan harus
  // lewat pengembalian dana — bukan lagi urusan tombol ini.
  const canCancel = order.stage === "pending_payment";

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
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 select-none shadow-2xs">
      {/* Card header */}
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Ringkasan Proyek
        </span>
      </div>

      <div className="space-y-3 text-xs font-semibold text-text-secondary">
        {/* Creator */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider shrink-0">Kreator</span>
          <span className="text-xs font-extrabold text-text-primary text-right truncate">{order.creatorName}</span>
        </div>

        {/* Project Title */}
        <div className="space-y-0.5">
          <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider">Judul Pekerjaan</span>
          <span className="text-xs font-bold text-text-primary block leading-relaxed">{order.projectTitle}</span>
        </div>

        {/* Price highlight */}
        <div className="rounded-xl bg-primary-50/60 border border-primary/10 p-3 flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider shrink-0">Harga Kerja Sama</span>
          <span className="text-sm font-extrabold text-primary block">{formatCurrency(order.finalPrice)}</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider shrink-0">Batas Waktu</span>
          <span className="text-xs font-extrabold text-text-primary">{deadlineDate(order.deadline)}</span>
        </div>

        {/* Scope */}
        <div className="border-t border-dashed border-border-soft pt-3 space-y-1">
          <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider">Lingkup Deliverable</span>
          <p className="text-[10px] text-text-secondary leading-relaxed font-semibold">{order.scope}</p>
        </div>

        {canCancel && onCancelOrder && (
          <div className="border-t border-dashed border-border-soft pt-3">
            <button
              onClick={onCancelOrder}
              className="w-full text-center py-2 rounded-xl border border-danger/20 text-[10px] font-extrabold text-danger hover:bg-danger-soft/30 transition-colors cursor-pointer"
            >
              Batalkan Pesanan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
