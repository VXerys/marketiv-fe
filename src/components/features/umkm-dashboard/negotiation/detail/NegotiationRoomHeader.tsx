"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { DashboardModal } from "@/components/features/dashboard/shared";
import { formatCurrency } from "@/lib/formatters";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";

interface NegotiationRoomHeaderProps {
  order: NegotiationOrder;
  onSendOffer: () => void;
  onPay: () => void;
}

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  negotiation:          { label: "Negosiasi",            variant: "blue"   },
  waiting_payment:      { label: "Menunggu Pembayaran",  variant: "yellow" },
  escrow:               { label: "Dalam Escrow",         variant: "orange" },
  revision:             { label: "Revisi",               variant: "red"    },
  waiting_verification: { label: "Menunggu Verifikasi",  variant: "yellow" },
  completed:            { label: "Selesai",              variant: "green"  },
  dispute:              { label: "Dispute / Sengketa",   variant: "red"    },
  cancelled:            { label: "Dibatalkan",           variant: "gray"   },
};

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  blue:   { color: "#2d5bd1", background: "#f0f6ff", border: "1px solid rgba(96,165,250,.25)"  },
  yellow: { color: "#a15b0b", background: "#fffbeb", border: "1px solid rgba(245,158,11,.24)" },
  orange: { color: "#bd4b0b", background: "#fff7ed", border: "1px solid rgba(251,146,60,.24)" },
  green:  { color: "#177b42", background: "#f1fbf5", border: "1px solid rgba(74,222,128,.25)"  },
  red:    { color: "#b4232a", background: "#fff3f3", border: "1px solid rgba(248,113,113,.24)" },
  gray:   { color: "#687386", background: "#f8fafc", border: "1px solid rgba(148,163,184,.28)" },
};

export function NegotiationRoomHeader({ order, onSendOffer, onPay }: NegotiationRoomHeaderProps) {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const status = STATUS_MAP[order.status] ?? { label: order.status, variant: "gray" };
  const badgeStyle = BADGE_STYLES[status.variant] ?? BADGE_STYLES.gray;

  const btnPrimary = "px-5 py-2.5 rounded-[15px] text-white text-xs font-extrabold transition-all duration-200 select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shrink-0";

  const renderAction = () => {
    if (order.status === "negotiation") {
      return (
        <button
          type="button"
          onClick={onSendOffer}
          className={btnPrimary}
          style={{ background: "linear-gradient(180deg,#f97316,#ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,.35)" }}
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
          className={btnPrimary}
          style={{ background: "linear-gradient(180deg,#f97316,#ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,.35)" }}
        >
          Simulasi Pembayaran
        </button>
      );
    }
    if (order.status === "escrow" || order.status === "revision") {
      return (
        <div
          className="px-4 py-2.5 rounded-[15px] text-[10px] font-extrabold select-none cursor-default shrink-0"
          style={{ background: "#f3f5f8", border: "1px solid rgba(17,24,39,.1)", color: "#737f91" }}
        >
          Sedang Dikerjakan
        </div>
      );
    }
    if (order.status === "waiting_verification") {
      return (
        <button
          type="button"
          onClick={() => setIsVerificationModalOpen(true)}
          className={btnPrimary}
          style={{ background: "linear-gradient(180deg,#22c55e,#16a34a)", boxShadow: "0 4px 14px rgba(34,197,94,.30)" }}
        >
          Verifikasi Collab Post
        </button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3 select-none">
      {/* Back navigation */}
      <Link
        href="/dashboard/umkm/negosiasi"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737f91] hover:text-[#f97316] transition-colors"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Negosiasi
      </Link>

      {/* Premium header card */}
      <div
        className="rounded-[26px] p-5"
        style={{
          background: "linear-gradient(135deg,#ffffff 0%,#fffdf8 55%,rgba(255,247,237,.7) 100%)",
          border: "1px solid rgba(249,115,22,.12)",
          boxShadow: "0 8px 28px rgba(15,23,42,.07), inset 0 1px 0 rgba(255,255,255,.9)",
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

          {/* Creator identity */}
          <div className="flex items-center gap-4 min-w-0">

            {/* Avatar + online indicator */}
            <div className="relative shrink-0">
              <div
                className="h-[56px] w-[56px] rounded-2xl overflow-hidden bg-neutral-100"
                style={{ border: "2.5px solid white", boxShadow: "0 4px 18px rgba(15,23,42,.14)" }}
              >
                <Image
                  src={order.creatorAvatarUrl}
                  alt={order.creatorName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400"
                style={{ boxShadow: "0 0 0 2px rgba(74,222,128,.28)" }}
              />
            </div>

            {/* Name, status, title, price */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-[#182033] leading-none">
                  {order.creatorName}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
                  style={badgeStyle}
                >
                  {status.label}
                </span>
              </div>

              <h2
                className="text-sm font-extrabold text-[#182033] leading-snug"
                style={{ maxWidth: 420 }}
              >
                {order.projectTitle}
              </h2>

              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px]"
                style={{ background: "rgba(255,247,237,.9)", border: "1px solid rgba(251,146,60,.28)" }}
              >
                <svg className="w-3 h-3 text-[#f97316] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[9px] font-bold text-[#f97316]/70">Nilai Kerja Sama:</span>
                <span className="text-xs font-extrabold text-[#f97316]">{formatCurrency(order.finalPrice)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="self-start sm:self-center">
            {renderAction()}
          </div>
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
