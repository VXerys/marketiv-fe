"use client";

import { TrendingUp, TrendingDown, CheckCircle, Users, Eye, Shield, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  note?: string;
  growth?: number;
  iconBg?: string;
  iconColor?: string;
  iconBorder?: string;
  isLoading?: boolean;
}

function KPICard({
  icon: Icon,
  label,
  value,
  note,
  growth,
  iconBg = "#fff7ed",
  iconColor = "#ea580c",
  iconBorder = "rgba(249,115,22,.18)",
  isLoading = false,
}: KPICardProps) {
  const isPositive = (growth ?? 0) >= 0;

  if (isLoading) {
    return (
      <div className="p-3.5 sm:p-4.5 rounded-2xl sm:rounded-[22px] border border-border bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs">
        <div className="flex justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] bg-ink-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
          </div>
          <div className="w-10 h-5 rounded-lg bg-ink-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="w-1/2 h-3 rounded-lg bg-ink-100 mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
        </div>
        <div className="w-4/5 h-6 rounded-lg bg-ink-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative p-3.5 sm:p-4.5 rounded-2xl sm:rounded-[22px] border border-border bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group select-none"
      style={{
        background: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.05), transparent 10rem), linear-gradient(180deg, #ffffff, #fffdf9)",
      }}
    >
      {/* Top row: icon + growth badge */}
      <div className="flex items-center justify-between gap-2.5 mb-2.5 sm:mb-3.5">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] grid place-items-center border shadow-3xs transition-transform duration-300 group-hover:scale-105"
          style={{ background: iconBg, borderColor: iconBorder, color: iconColor }}
        >
          <div className="block sm:hidden">
            <Icon size={14} />
          </div>
          <div className="hidden sm:block">
            <Icon size={18} />
          </div>
        </div>

        {growth !== undefined && (
          <div
            className={cn(
              "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[0.62rem] sm:text-[0.7rem] font-[800] leading-none shrink-0",
              isPositive
                ? "bg-emerald-50 border-emerald-200/50 text-emerald-700"
                : "bg-rose-50 border-rose-200/50 text-rose-700"
            )}
          >
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-[0.66rem] sm:text-[0.74rem] font-extrabold text-neutral-500 tracking-wide uppercase">
        {label}
      </div>

      {/* Value — Ukuran medium seimbang untuk 3 kolom (2 baris) */}
      <div className="font-display text-[1.2rem] sm:text-[1.4rem] lg:text-[1.55rem] font-black text-neutral-900 tracking-tight leading-none mt-1 sm:mt-1.5 break-all">
        {value}
      </div>

      {/* Note */}
      {note && (
        <div className="text-[0.68rem] sm:text-[0.74rem] text-neutral-400 font-semibold mt-1 sm:mt-1.5 leading-none">
          {note}
        </div>
      )}
    </div>
  );
}

interface KPISectionProps {
  isLoading?: boolean;
  kpisData?: {
    campaignActive: number;
    campaignCompleted?: number;
    creatorJoined: number;
    viewsValid: number;
    escrowBalance: number;
    totalSpend: number;
  };
}

export function KPISection({ isLoading = false, kpisData }: KPISectionProps) {
  const kpis: KPICardProps[] = [
    {
      icon: TrendingUp,
      label: "Campaign Aktif",
      value: String(kpisData?.campaignActive ?? 5),
      note: "2 akan berakhir minggu ini",
      growth: 25,
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      iconBorder: "rgba(234,88,12,.18)",
    },
    {
      icon: CheckCircle,
      label: "Campaign Selesai",
      value: String(kpisData?.campaignCompleted ?? 18),
      note: "Bulan ini: 3 selesai",
      growth: 12,
      iconBg: "#f1fbf5",
      iconColor: "#16a34a",
      iconBorder: "rgba(22,163,74,.18)",
    },
    {
      icon: Users,
      label: "Total Kreator",
      value: String(kpisData?.creatorJoined ?? 28),
      note: "4 kreator baru minggu ini",
      growth: 16,
      iconBg: "#f0f6ff",
      iconColor: "#2563eb",
      iconBorder: "rgba(37,99,235,.18)",
    },
    {
      icon: Eye,
      label: "Total Views",
      value:
        typeof kpisData?.viewsValid === "number"
          ? `${(kpisData.viewsValid / 1_000_000).toFixed(1)}jt`
          : "2.4jt",
      note: "Rata-rata 481rb/campaign",
      growth: 38,
      iconBg: "#f7f3ff",
      iconColor: "#7c3aed",
      iconBorder: "rgba(124,58,237,.18)",
    },
    {
      icon: Shield,
      label: "Dana Escrow",
      value:
        kpisData?.escrowBalance !== undefined
          ? `Rp ${(kpisData.escrowBalance / 1_000_000).toFixed(1)}jt`
          : "Rp 8.5jt",
      note: "Terkunci untuk 3 campaign",
      growth: -4,
      iconBg: "#fffbeb",
      iconColor: "#d97706",
      iconBorder: "rgba(217,119,6,.18)",
    },
    {
      icon: CreditCard,
      label: "Total Pengeluaran",
      value:
        kpisData?.totalSpend !== undefined
          ? `Rp ${(kpisData.totalSpend / 1_000_000).toFixed(1)}jt`
          : "Rp 42jt",
      note: "Bulan ini: Rp 12.5jt",
      growth: 8,
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      iconBorder: "rgba(234,88,12,.18)",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <div className="inline-flex items-center gap-2 text-orange-600 text-[.72rem] font-[900] tracking-[.12em] uppercase mb-1.5">
          <span className="block w-3.5 h-0.5 rounded-full bg-orange-500" />
          Metrik Utama
        </div>
        <h2 className="font-display text-[1.15rem] font-bold tracking-[-0.045em] text-ink-950 m-0">
          Ringkasan KPI Bisnis
        </h2>
      </div>

      {/* Grid: 2 kolom di mobile (2x3), 3 kolom di desktop/tablet (3x2) untuk keseimbangan ukuran card */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
}
