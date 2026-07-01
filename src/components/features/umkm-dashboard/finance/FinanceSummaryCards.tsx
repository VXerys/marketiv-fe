"use client";

import { UmkmFinanceSummary } from "@/types/umkm-dashboard.types";
import { formatCompactCurrency, formatCurrency } from "@/lib/formatters";

interface FinanceSummaryCardsProps {
  summary: UmkmFinanceSummary;
}

interface FinanceMetricItem {
  id: string;
  label: string;
  sublabel: string;
  value: string;
  valueExact: string;
  iconBg: string;
  iconColor: string;
  accentBar: string;
  icon: React.ReactNode;
}

export function FinanceSummaryCards({ summary }: FinanceSummaryCardsProps) {
  const metrics: FinanceMetricItem[] = [
    {
      id: "total-pengeluaran",
      label: "Total Pengeluaran",
      sublabel: "Deposit + platform fee lunas",
      value: formatCompactCurrency(summary.totalExpenses),
      valueExact: formatCurrency(summary.totalExpenses),
      iconBg: "bg-brand-coral/10",
      iconColor: "text-primary",
      accentBar: "bg-primary",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "dana-escrow",
      label: "Dana di Escrow",
      sublabel: "Terkunci — menunggu validasi",
      value: formatCompactCurrency(summary.escrowBalance),
      valueExact: formatCurrency(summary.escrowBalance),
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentBar: "bg-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "pembayaran-pending",
      label: "Perlu Dibayar",
      sublabel: "Menunggu konfirmasi transfer",
      value: formatCompactCurrency(summary.pendingPayments),
      valueExact: formatCurrency(summary.pendingPayments),
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accentBar: "bg-amber-400",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "refund",
      label: "Refund Diterima",
      sublabel: "Pengembalian proyek batal",
      value: formatCompactCurrency(summary.refundsReceived),
      valueExact: formatCurrency(summary.refundsReceived),
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accentBar: "bg-emerald-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      ),
    },
    {
      id: "platform-fee",
      label: "Biaya Platform",
      sublabel: "Fee admin Campaign & Rate Card",
      value: formatCompactCurrency(summary.platformFees),
      valueExact: formatCurrency(summary.platformFees),
      iconBg: "bg-neutral-100",
      iconColor: "text-neutral-500",
      accentBar: "bg-neutral-400",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: "transaksi-sukses",
      label: "Transaksi Sukses",
      sublabel: "Total invoice berhasil diproses",
      value: String(summary.successfulTransactionsCount),
      valueExact: `${summary.successfulTransactionsCount} transaksi`,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      accentBar: "bg-green-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      {metrics.map((m) => (
        <div
          key={m.id}
          className="group relative bg-white/75 backdrop-blur-md border border-neutral-200/50 rounded-2xl overflow-hidden shadow-[0_8px_24px_-8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] hover:-translate-y-0.5 transition-all duration-300"
        >
          {/* Accent top bar */}
          <div className={`h-0.5 w-full ${m.accentBar} opacity-60`} />

          <div className="p-4 sm:p-5 flex flex-col gap-3.5">
            {/* Icon + Label row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider leading-tight">
                  {m.label}
                </p>
                <p className="text-[10px] text-text-muted leading-snug hidden sm:block">
                  {m.sublabel}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${m.iconBg} ${m.iconColor} flex items-center justify-center shrink-0 border border-white/70`}>
                {m.icon}
              </div>
            </div>

            {/* Value */}
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-none">
                {m.value}
              </p>
              <p className="text-[10px] text-text-muted font-medium leading-tight hidden sm:block">
                {m.valueExact}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
