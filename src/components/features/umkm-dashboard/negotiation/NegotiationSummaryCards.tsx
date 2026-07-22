"use client";

import { MessageSquare, CreditCard, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { formatCompactCurrency } from "@/lib/formatters";

interface SummaryCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  note: string;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
}

function SummaryCard({ icon: Icon, label, value, note, iconBg, iconColor, iconBorder }: SummaryCardProps) {
  return (
    <div className="relative min-w-0 p-3.5 sm:p-4.5 border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group">
      <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] grid place-items-center border shadow-3xs transition-transform duration-300 group-hover:scale-105"
          style={{ background: iconBg, borderColor: iconBorder, color: iconColor }}
        >
          <div className="block sm:hidden"><Icon size={14} /></div>
          <div className="hidden sm:block"><Icon size={18} /></div>
        </div>
      </div>

      <div className="text-[0.66rem] sm:text-[0.74rem] font-extrabold text-neutral-500 tracking-wide uppercase">
        {label}
      </div>
      <div className="font-display text-[1.2rem] sm:text-[1.4rem] lg:text-[1.55rem] font-black text-neutral-900 tracking-tight leading-none mt-1 sm:mt-1.5 break-all">
        {value}
      </div>
      <div className="text-[0.68rem] sm:text-[0.74rem] text-neutral-400 font-semibold mt-1 sm:mt-1.5 leading-none">
        {note}
      </div>
    </div>
  );
}

interface NegotiationSummaryCardsProps {
  negotiations: NegotiationOrder[];
}

export function NegotiationSummaryCards({ negotiations }: NegotiationSummaryCardsProps) {
  const activeCount = negotiations.filter((n) => n.status === "in_progress").length;
  const waitingPaymentCount = negotiations.filter((n) => n.status === "pending_payment").length;
  const escrowStatuses = ["escrow", "in_progress", "revision", "approved"];
  const escrowCount = negotiations.filter((n) => escrowStatuses.includes(n.status)).length;
  const completedCount = negotiations.filter((n) => n.status === "completed").length;
  const disputeCount = negotiations.filter((n) => n.status === "cancelled").length;
  const escrowLockedValue = negotiations
    .filter((n) => escrowStatuses.includes(n.status))
    .reduce((sum, n) => sum + n.finalPrice, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <SummaryCard
        icon={MessageSquare}
        label="Negosiasi Aktif"
        value={String(activeCount)}
        note="Perlu tanggapan"
        iconBg="#fff7ed"
        iconColor="#ea580c"
        iconBorder="rgba(234,88,12,.18)"
      />
      <SummaryCard
        icon={CreditCard}
        label="Menunggu Bayar"
        value={String(waitingPaymentCount)}
        note="Tawaran disetujui"
        iconBg="#fffbeb"
        iconColor="#d97706"
        iconBorder="rgba(217,119,6,.18)"
      />
      <SummaryCard
        icon={Lock}
        label="Dalam Escrow"
        value={formatCompactCurrency(escrowLockedValue)}
        note={`${escrowCount} Proyek Aktif`}
        iconBg="#f1fbf5"
        iconColor="#16a34a"
        iconBorder="rgba(22,163,74,.18)"
      />
      <SummaryCard
        icon={CheckCircle}
        label="Selesai"
        value={String(completedCount)}
        note="Kerja sama sukses"
        iconBg="#f0f6ff"
        iconColor="#2563eb"
        iconBorder="rgba(37,99,235,.18)"
      />
      <SummaryCard
        icon={AlertTriangle}
        label="Dispute"
        value={String(disputeCount)}
        note="Sengketa aktif"
        iconBg="#fff1f2"
        iconColor="#e11d48"
        iconBorder="rgba(225,29,72,.18)"
      />
    </div>
  );
}
