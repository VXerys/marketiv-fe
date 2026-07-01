import { EscrowOverview } from "@/types/umkm-dashboard.types";
import { DashboardCard } from "@/components/features/dashboard/shared";
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
    <DashboardCard variant="default" padding="none" className="space-y-6 p-5 sm:p-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-text-primary tracking-tight">
            Sistem Perlindungan Escrow (Rekening Bersama)
          </h2>
          <p className="text-xs text-text-muted">
            Bagaimana platform mengamankan dana kolaborasi Anda hingga pekerjaan selesai.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-soft text-success-strong text-[11px] font-bold border border-success-soft shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Escrow Terlindungi
        </span>
      </div>

      {/* Mobile stacked steps */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {ESCROW_FLOW_STEPS.map((step) => (
          <div key={step.number} className="flex min-w-0 items-start gap-3 rounded-2xl border border-neutral-200/40 bg-neutral-50/50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-white text-xs font-extrabold text-primary shadow-2xs">
              {step.number}
            </div>
            <div className="min-w-0 space-y-0.5">
              <h4 className="text-[11px] font-extrabold leading-snug text-text-secondary">{step.title}</h4>
              <p className="text-[9.5px] leading-relaxed text-text-muted">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop stepper diagram */}
      <div className="relative hidden select-none rounded-2xl border border-neutral-200/40 bg-neutral-50/50 p-4 py-4 sm:block">
        <div className="grid grid-cols-4 items-start gap-4">
          {ESCROW_FLOW_STEPS.map((step, idx) => (
            <div key={step.number} className="relative flex min-w-0 flex-col items-center text-center">
              {/* Connector line */}
              {idx < ESCROW_FLOW_STEPS.length - 1 && (
                <div className="absolute top-4.5 left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] h-0.5 bg-neutral-200" />
              )}
              
              {/* Step Circle */}
              <div className="w-9 h-9 rounded-full bg-white border-2 border-primary/20 text-primary flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0 z-10 transition-all hover:border-primary">
                {step.number}
              </div>

              {/* Step Label */}
              <div className="mt-2.5 space-y-0.5 max-w-[150px]">
                <h4 className="text-[11px] font-extrabold text-text-secondary leading-snug">{step.title}</h4>
                <p className="text-[9.5px] text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campaign Mode Escrow Info */}
        <div className="flex items-start gap-4 rounded-xl border border-neutral-200/30 bg-neutral-50/60 p-4">
          <div className="w-10 h-10 rounded-xl bg-brand-coral/5 border border-brand-coral/10 flex items-center justify-center shrink-0 text-primary">
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
              <h4 className="text-xs font-black text-text-primary">Campaign Mode</h4>
              <span className="text-[10px] font-extrabold text-text-muted">Fee Platform 15%</span>
            </div>
            <p className="text-[10.5px] text-text-muted leading-normal">
              Pay-per-view. Budget campaign didepositkan di awal dan dipotong platform fee 15%. Dana dirilis ke dompet kreator sebanding dengan tayangan (views) postingan yang valid diakumulasikan.
            </p>
            <div className="flex flex-col gap-1 pt-1 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span className="text-text-secondary font-medium">Dana Escrow Campaign:</span>
              <strong className="break-words text-text-primary font-extrabold">{formatCurrency(overview.campaignEscrow)}</strong>
            </div>
          </div>
        </div>

        {/* Rate Card Mode Escrow Info */}
        <div className="flex items-start gap-4 rounded-xl border border-neutral-200/30 bg-neutral-50/60 p-4">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center shrink-0 text-brand-navy">
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
              <h4 className="text-xs font-black text-text-primary">Rate Card Mode</h4>
              <span className="text-[10px] font-extrabold text-text-muted">Fee Platform 10%</span>
            </div>
            <p className="text-[10.5px] text-text-muted leading-normal">
              Harga tetap & negosiasi langsung. Dana pesanan dikunci di escrow (dipotong platform fee 10%). Rilis dana dilakukan setelah kreator mengunggah tautan Instagram/TikTok Collab Post.
            </p>
            <div className="flex flex-col gap-1 pt-1 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span className="text-text-secondary font-medium">Dana Escrow Rate Card:</span>
              <strong className="break-words text-text-primary font-extrabold">{formatCurrency(overview.rateCardEscrow)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow summary numbers */}
      <div className="grid grid-cols-1 gap-2 pt-1.5 text-center text-xs sm:grid-cols-3 sm:gap-4.5">
        <div className="p-3 bg-brand-coral/5 rounded-xl border border-brand-coral/10">
          <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider block">Total Aktif Escrow</span>
          <strong className="mt-1 block break-words text-sm font-black text-primary">{formatCurrency(overview.activeEscrow)}</strong>
        </div>
        <div className="p-3 bg-neutral-100/60 rounded-xl border border-neutral-200/30">
          <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider block">Menunggu Rilis</span>
          <strong className="mt-1 block break-words text-sm font-black text-text-primary">{formatCurrency(overview.pendingRelease)}</strong>
        </div>
        <div className="p-3 bg-neutral-100/60 rounded-xl border border-neutral-200/30">
          <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider block">Bisa Di-refund</span>
          <strong className="mt-1 block break-words text-sm font-black text-text-primary">{formatCurrency(overview.refundEligible)}</strong>
        </div>
      </div>
    </DashboardCard>
  );
}
