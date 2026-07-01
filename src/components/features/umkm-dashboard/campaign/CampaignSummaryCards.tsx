import { UmkmDashboardSummary } from "@/types/umkm-dashboard.types";
import { DashboardMetricCard } from "../shared/DashboardMetricCard";

interface CampaignSummaryCardsProps {
  summary: UmkmDashboardSummary;
}

export function CampaignSummaryCards({ summary }: CampaignSummaryCardsProps) {
  const cards = [
    {
      label: "Campaign Aktif",
      value: summary.activeCampaigns,
      helperText: "Di Job Pool",
      icon: (
        <svg className="w-5 h-5 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      label: "Draft Campaign",
      value: summary.pendingPayments,
      helperText: "Belum terbit",
      icon: (
        <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Total Views",
      value: summary.totalViews, // numeric value to let metric card handle formatting or render direct
      helperText: "Ulasan konten",
      icon: (
        <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: "Budget Escrow",
      value: summary.escrowBalance,
      isCompactCurrency: true, // displays as compact currency like Rp 12,5 jt
      helperText: "Dana terjamin",
      icon: (
        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Submission Pending",
      value: summary.pendingSubmissions,
      helperText: "Perlu validasi",
      icon: (
        <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Campaign Selesai",
      value: summary.completedCampaigns,
      helperText: "Sukses dirilis",
      icon: (
        <svg className="w-5 h-5 text-success-strong" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-8 shrink-0">
      {cards.map((card, i) => (
        <DashboardMetricCard
          key={i}
          label={card.label}
          value={card.value}
          helperText={card.helperText}
          icon={card.icon}
          isCompactCurrency={card.isCompactCurrency}
          variant="elevated"
        />
      ))}
    </div>
  );
}
