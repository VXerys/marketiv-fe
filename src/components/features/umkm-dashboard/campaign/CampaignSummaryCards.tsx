import { Megaphone, TrendingUp, CheckCircle, Eye, Clock, Shield } from "lucide-react";
import type { UmkmDashboardSummary } from "@/types/umkm-dashboard.types";

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
    <div className="relative min-w-0 p-4 sm:p-5 border border-neutral-200/80 rounded-[22px] bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-[14px] grid place-items-center border shadow-3xs transition-transform duration-300 group-hover:scale-105"
          style={{ background: iconBg, borderColor: iconBorder, color: iconColor }}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="text-[0.74rem] font-extrabold text-neutral-500 tracking-wide uppercase">{label}</div>
      <div className="font-display text-xl sm:text-2xl lg:text-[1.75rem] font-black text-neutral-900 tracking-tight leading-none mt-1.5 break-all">
        {value}
      </div>
      <div className="text-[0.78rem] text-neutral-400 font-semibold mt-1.5">{note}</div>
    </div>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
}

interface CampaignSummaryCardsProps {
  summary: UmkmDashboardSummary;
}

export function CampaignSummaryCards({ summary }: CampaignSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      <SummaryCard
        icon={Megaphone}
        label="Total Campaign"
        value={String(summary.activeCampaigns + summary.completedCampaigns + (summary.pendingPayments ?? 0))}
        note="Semua status"
        iconBg="#fff7ed" iconColor="#ea580c" iconBorder="rgba(234,88,12,.18)"
      />
      <SummaryCard
        icon={TrendingUp}
        label="Campaign Aktif"
        value={String(summary.activeCampaigns)}
        note="Sedang berjalan"
        iconBg="#f1fbf5" iconColor="#16a34a" iconBorder="rgba(22,163,74,.18)"
      />
      <SummaryCard
        icon={CheckCircle}
        label="Campaign Selesai"
        value={String(summary.completedCampaigns)}
        note="Berhasil diselesaikan"
        iconBg="#f0f6ff" iconColor="#2563eb" iconBorder="rgba(37,99,235,.18)"
      />
      <SummaryCard
        icon={Eye}
        label="Total Views"
        value={formatViews(summary.totalViews)}
        note="Dari semua campaign"
        iconBg="#f7f3ff" iconColor="#7c3aed" iconBorder="rgba(124,58,237,.18)"
      />
      <SummaryCard
        icon={Clock}
        label="Submission Pending"
        value={String(summary.pendingSubmissions)}
        note="Perlu validasi"
        iconBg="#fffbeb" iconColor="#d97706" iconBorder="rgba(217,119,6,.18)"
      />
      <SummaryCard
        icon={Shield}
        label="Budget Escrow"
        value={`Rp ${(summary.escrowBalance / 1_000_000).toFixed(1)}jt`}
        note="Dana terjamin"
        iconBg="#f1fbf5" iconColor="#16a34a" iconBorder="rgba(22,163,74,.18)"
      />
    </div>
  );
}
