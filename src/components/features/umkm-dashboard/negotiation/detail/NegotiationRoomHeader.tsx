"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { DashboardModal } from "@/components/features/dashboard/shared";
import { formatCurrency } from "@/lib/formatters";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { cn } from "@/lib/utils";

interface NegotiationRoomHeaderProps {
  order: NegotiationOrder;
  onSendOffer: () => void;
  onPay: () => void;
}

export function NegotiationRoomHeader({ order, onSendOffer, onPay }: NegotiationRoomHeaderProps) {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Status mapping
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "negotiation":
        return { label: "Negosiasi", textClass: "text-info-strong", bgClass: "bg-info-soft/30 border-info-soft" };
      case "waiting_payment":
        return { label: "Menunggu Pembayaran", textClass: "text-warning-strong", bgClass: "bg-warning-soft/30 border-warning-soft" };
      case "escrow":
        return { label: "Dalam Escrow", textClass: "text-primary-800", bgClass: "bg-primary-50/50 border-primary-200/50" };
      case "revision":
        return { label: "Revisi", textClass: "text-danger-strong", bgClass: "bg-danger-soft/30 border-danger-soft" };
      case "waiting_verification":
        return { label: "Menunggu Verifikasi", textClass: "text-warning-strong", bgClass: "bg-warning-soft/30 border-warning-soft" };
      case "completed":
        return { label: "Selesai", textClass: "text-success-strong", bgClass: "bg-success-soft/30 border-success-soft" };
      case "dispute":
        return { label: "Dispute / Sengketa", textClass: "text-danger-strong", bgClass: "bg-danger-soft/30 border-danger-soft" };
      case "cancelled":
        return { label: "Dibatalkan", textClass: "text-neutral-600", bgClass: "bg-neutral-100 border-neutral-200" };
      default:
        return { label: status, textClass: "text-neutral-600", bgClass: "bg-neutral-100 border-neutral-200" };
    }
  };

  const status = getStatusDetails(order.status);

  // Render header primary button based on status
  const renderHeaderAction = () => {
    if (order.status === "negotiation") {
      return (
        <button
          type="button"
          onClick={onSendOffer}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-primary hover:border-primary-600 select-none"
        >
          Kirim Custom Offer
        </button>
      );
    }
    if (order.status === "waiting_payment") {
      return (
        <button
          type="button"
          onClick={onPay}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-primary hover:border-primary-600 select-none"
        >
          Simulasi Pembayaran
        </button>
      );
    }
    if (order.status === "escrow" || order.status === "revision") {
      return (
        <div className="px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-text-secondary text-[10px] font-bold select-none cursor-default">
          Sedang Dikerjakan
        </div>
      );
    }
    if (order.status === "waiting_verification") {
      return (
        <button
          type="button"
          onClick={() => setIsVerificationModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-success hover:bg-success-strong text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-success hover:border-success-strong select-none"
        >
          Verifikasi Collab Post
        </button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Back link */}
      <div>
        <Link
          href="/dashboard/umkm/negosiasi"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors select-none"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Kembali ke Negosiasi</span>
        </Link>
      </div>

      {/* Header card info */}
      <div className="rounded-2xl border border-border-soft bg-white p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xs select-none">
        <div className="flex gap-3.5 min-w-0">
          {/* Avatar */}
          <div className="h-11 w-11 rounded-xl bg-neutral-100 border border-neutral-200/50 shrink-0 relative overflow-hidden shadow-3xs">
            <Image
              src={order.creatorAvatarUrl}
              alt={order.creatorName}
              fill
              className="object-cover"
              sizes="44px"
            />
          </div>
          
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-text-primary">
                {order.creatorName}
              </span>
              <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-extrabold uppercase tracking-wider", status.bgClass, status.textClass)}>
                {status.label}
              </span>
            </div>
            
            <h2 className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight truncate leading-none">
              {order.projectTitle}
            </h2>
            
            <span className="block text-[9px] text-text-muted font-bold leading-none">
              Harga disepakati: <strong className="text-primary">{formatCurrency(order.finalPrice)}</strong>
            </span>
          </div>
        </div>

        {/* Header CTA action */}
        <div className="shrink-0">
          {renderHeaderAction()}
        </div>
      </div>

      <DashboardModal
        isOpen={isVerificationModalOpen}
        title="Verifikasi Collab Post"
        description="Memvalidasi postingan Collab Post. Tautan postingan akan dianggap valid untuk simulasi dashboard ini."
        confirmLabel="Verifikasi"
        cancelLabel="Batal"
        onClose={() => setIsVerificationModalOpen(false)}
        onConfirm={() => {
          setIsVerificationModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
