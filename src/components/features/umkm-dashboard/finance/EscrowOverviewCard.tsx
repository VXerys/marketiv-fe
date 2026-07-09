import { Shield, Megaphone, MessageSquare } from "lucide-react";
import { EscrowOverview } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";

interface EscrowOverviewCardProps {
  overview: EscrowOverview;
}

const ESCROW_FLOW_STEPS = [
  { number: "1", title: "Deposit Pembayaran", desc: "UMKM bayar lunas di depan" },
  { number: "2", title: "Sistem Escrow", desc: "Dana dikunci aman platform" },
  { number: "3", title: "Validasi Post / Deal", desc: "Kreator submit posting/collab" },
  { number: "4", title: "Dana Rilis / Refund", desc: "Pecah saldo ke dompet kreator" },
];

export function EscrowOverviewCard({ overview }: EscrowOverviewCardProps) {
  return (
    <div className="border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-gradient-to-b from-white to-neutral-50/30 shadow-3xs p-5 sm:p-6 space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[14px] grid place-items-center bg-emerald-50 border border-emerald-200/60 text-emerald-600 shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="font-display text-[.95rem] font-black text-ink-950 tracking-tight leading-tight">
              Sistem Perlindungan Escrow
            </h2>
            <p className="text-[.78rem] text-ink-400 font-semibold mt-0.5">
              Bagaimana platform mengamankan dana kolaborasi Anda hingga pekerjaan selesai.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[.72rem] font-[800] border border-emerald-200/60 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          Escrow Terlindungi
        </span>
      </div>

      {/* Mobile stacked steps */}
      <div className="grid grid-cols-1 gap-2.5 sm:hidden">
        {ESCROW_FLOW_STEPS.map((step) => (
          <div key={step.number} className="flex min-w-0 items-start gap-3 rounded-2xl border border-neutral-200/60 bg-neutral-50/60 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-white text-xs font-extrabold text-primary shadow-3xs">
              {step.number}
            </div>
            <div className="min-w-0 space-y-0.5">
              <h4 className="text-[11px] font-extrabold leading-snug text-ink-700">{step.title}</h4>
              <p className="text-[9.5px] leading-relaxed text-ink-400">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop stepper diagram */}
      <div className="relative hidden select-none rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-5 sm:block">
        <div className="grid grid-cols-4 items-start gap-4">
          {ESCROW_FLOW_STEPS.map((step, idx) => (
            <div key={step.number} className="relative flex min-w-0 flex-col items-center text-center">
              {/* Connector line */}
              {idx < ESCROW_FLOW_STEPS.length - 1 && (
                <div className="absolute top-4.5 left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
              )}

              {/* Step Circle */}
              <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/25 text-primary flex items-center justify-center font-extrabold text-xs shadow-3xs shrink-0 z-10 transition-all hover:border-primary hover:scale-110 duration-300">
                {step.number}
              </div>

              {/* Step Label */}
              <div className="mt-2.5 space-y-0.5 max-w-[150px]">
                <h4 className="text-[11px] font-extrabold text-ink-700 leading-snug">{step.title}</h4>
                <p className="text-[9.5px] text-ink-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail breakdown — Campaign vs Rate Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Campaign Mode */}
        <div className="flex items-start gap-4 rounded-2xl border border-neutral-200/60 bg-gradient-to-b from-white to-orange-50/20 p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="w-10 h-10 rounded-[14px] bg-orange-50 border border-orange-200/60 grid place-items-center shrink-0 text-orange-600">
            <Megaphone size={18} />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
              <h4 className="text-[.84rem] font-black text-ink-900 tracking-tight">Campaign Mode</h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[10px] font-extrabold text-orange-700">Fee 15%</span>
            </div>
            <p className="text-[.74rem] text-ink-400 leading-relaxed font-medium">
              Pay-per-view. Budget campaign didepositkan di awal dan dipotong platform fee 15%. Dana dirilis ke dompet kreator sebanding dengan tayangan (views) postingan yang valid.
            </p>
            <div className="flex flex-col gap-1 pt-1 text-xs sm:flex-row sm:items-center sm:justify-between border-t border-dashed border-neutral-200/60 mt-1">
              <span className="text-ink-400 font-semibold">Dana Escrow Campaign</span>
              <strong className="font-display font-black text-ink-900 tracking-tight">{formatCurrency(overview.campaignEscrow)}</strong>
            </div>
          </div>
        </div>

        {/* Rate Card Mode */}
        <div className="flex items-start gap-4 rounded-2xl border border-neutral-200/60 bg-gradient-to-b from-white to-blue-50/20 p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="w-10 h-10 rounded-[14px] bg-blue-50 border border-blue-200/60 grid place-items-center shrink-0 text-blue-600">
            <MessageSquare size={18} />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
              <h4 className="text-[.84rem] font-black text-ink-900 tracking-tight">Rate Card Mode</h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[10px] font-extrabold text-blue-700">Fee 10%</span>
            </div>
            <p className="text-[.74rem] text-ink-400 leading-relaxed font-medium">
              Harga tetap &amp; negosiasi langsung. Dana pesanan dikunci di escrow (dipotong platform fee 10%). Rilis dana dilakukan setelah kreator mengunggah tautan Collab Post.
            </p>
            <div className="flex flex-col gap-1 pt-1 text-xs sm:flex-row sm:items-center sm:justify-between border-t border-dashed border-neutral-200/60 mt-1">
              <span className="text-ink-400 font-semibold">Dana Escrow Rate Card</span>
              <strong className="font-display font-black text-ink-900 tracking-tight">{formatCurrency(overview.rateCardEscrow)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow summary numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 bg-gradient-to-b from-orange-50/60 to-white rounded-2xl border border-orange-200/40 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[9px] font-extrabold text-ink-400 uppercase tracking-wider block">Total Aktif Escrow</span>
          <strong className="mt-1.5 block break-words font-display text-sm font-black text-primary tracking-tight">{formatCurrency(overview.activeEscrow)}</strong>
        </div>
        <div className="p-3.5 bg-gradient-to-b from-neutral-50 to-white rounded-2xl border border-neutral-200/60 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[9px] font-extrabold text-ink-400 uppercase tracking-wider block">Menunggu Rilis</span>
          <strong className="mt-1.5 block break-words font-display text-sm font-black text-ink-900 tracking-tight">{formatCurrency(overview.pendingRelease)}</strong>
        </div>
        <div className="p-3.5 bg-gradient-to-b from-neutral-50 to-white rounded-2xl border border-neutral-200/60 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[9px] font-extrabold text-ink-400 uppercase tracking-wider block">Bisa Di-refund</span>
          <strong className="mt-1.5 block break-words font-display text-sm font-black text-ink-900 tracking-tight">{formatCurrency(overview.refundEligible)}</strong>
        </div>
      </div>
    </div>
  );
}
