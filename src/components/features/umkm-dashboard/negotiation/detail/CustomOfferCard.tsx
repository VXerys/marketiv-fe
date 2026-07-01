"use client";

import { ChatMessage } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { deadlineTime } from "../negotiation.utils";

interface CustomOfferCardProps {
  message: ChatMessage;
  onPay: () => void;
  orderStatus: string;
}

export function CustomOfferCard({ message, onPay, orderStatus }: CustomOfferCardProps) {
  const offer = message.offerData;
  if (!offer) return null;

  const showPayAction = orderStatus === "negotiation" || orderStatus === "waiting_payment";


  return (
    <div className="flex justify-center my-6 w-full select-none">
      <div className="w-full max-w-lg rounded-2xl border border-primary-200/50 bg-primary-50/10 p-5 space-y-4 shadow-sm relative overflow-hidden">
        {/* Glow corner strip */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-600" />
        
        {/* Title & Badge */}
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-extrabold shadow-3xs" aria-hidden="true">
              ★
            </span>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
              Penawaran Resmi (Custom Offer)
            </span>
          </div>
          <span className={cn(
            "px-2.5 py-0.5 rounded-full border text-[8px] font-extrabold uppercase tracking-wider",
            showPayAction 
              ? "bg-warning-soft/30 border-warning-soft text-warning-strong" 
              : "bg-success-soft/30 border-success-soft text-success-strong"
          )}>
            {showPayAction ? "Menunggu Persetujuan" : "Tawaran Disetujui"}
          </span>
        </div>

        {/* Contract specs list */}
        <div className="space-y-3 text-xs font-semibold text-text-secondary">
          <div className="space-y-0.5">
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
              Judul Proyek
            </span>
            <h4 className="text-xs font-extrabold text-text-primary leading-tight">
              {message.content}
            </h4>
          </div>

          <div className="space-y-0.5">
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
              Lingkup Pekerjaan (Scope)
            </span>
            <p className="text-[10px] text-text-secondary leading-relaxed font-semibold">
              {offer.scope}
            </p>
          </div>

          {/* Pricing & Deadline parameters */}
          <div className="grid grid-cols-3 gap-3 border-y border-dashed border-border-soft py-3">
            <div>
              <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
                Harga Proyek
              </span>
              <span className="text-xs font-extrabold text-primary block mt-0.5">
                {formatCurrency(offer.finalPrice)}
              </span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
                Batas Waktu
              </span>
              <span className="text-xs font-extrabold text-text-primary block mt-0.5">
                {deadlineTime(offer.deadline)}
              </span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
                Batas Revisi
              </span>
              <span className="text-xs font-extrabold text-text-primary block mt-0.5">
                {offer.revisionCount}x Revisi
              </span>
            </div>
          </div>
        </div>

        {/* Escrow note */}
        <div className="text-[9px] text-text-muted leading-relaxed font-semibold">
          * Dana pembayaran Anda akan diamankan dengan aman di sistem rekening <strong>escrow Marketiv</strong>, dan hanya akan dilepaskan ke kreator setelah Collab Post Instagram/TikTok tayang dan terverifikasi admin.
        </div>

        {/* Action button */}
        {showPayAction && (
          <button
            type="button"
            onClick={onPay}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-primary hover:border-primary-600 text-center"
          >
            Lanjut ke Pembayaran Escrow
          </button>
        )}
      </div>
    </div>
  );
}
