import { Campaign } from "@/types/umkm-dashboard.types";
import { DashboardMetricCard } from "../../shared/DashboardMetricCard";

interface CampaignOverviewCardsProps {
  campaign: Campaign;
  pendingSubmissionsCount: number;
}

export function CampaignOverviewCards({
  campaign,
  pendingSubmissionsCount,
}: CampaignOverviewCardsProps) {
  const remainingBudget = campaign.totalBudgetEscrow - campaign.usedBudget;

  const cardData = [
    {
      label: "Total Views",
      value: campaign.totalViews,
      helperText: "Views saat ini",
      icon: (
        <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: "Budget Escrow",
      value: campaign.totalBudgetEscrow,
      isFullCurrency: true,
      helperText: "Dana diamankan",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      label: "Budget Terpakai",
      value: campaign.usedBudget,
      isFullCurrency: true,
      helperText: "Dana dicairkan",
      icon: (
        <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8L13 14l-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "Sisa Budget",
      value: remainingBudget,
      isFullCurrency: true,
      helperText: "Sisa di escrow",
      icon: (
        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Kreator Tergabung",
      value: `${campaign.usedQuota} / ${campaign.creatorQuota}`,
      helperText: "Klaim aktif",
      icon: (
        <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Submission Pending",
      value: pendingSubmissionsCount,
      helperText: "Perlu validasi",
      icon: (
        <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-8 shrink-0">
      {cardData.map((card, i) => (
        <DashboardMetricCard
          key={i}
          label={card.label}
          value={card.value}
          helperText={card.helperText}
          icon={card.icon}
          isFullCurrency={card.isFullCurrency}
          variant="elevated"
        />
      ))}
    </div>
  );
}
