import { ActiveCampaignCard } from "./ActiveCampaignCard";
import { EscrowSummaryCard } from "./EscrowSummaryCard";
import { ReviewSubmissionCard } from "./ReviewSubmissionCard";
import { UmkmDashboardChrome } from "./UmkmDashboardChrome";
import { UmkmViewsChartCard } from "./UmkmViewsChartCard";
import type { UmkmDashboardData } from "@/types/umkmDashboard";

interface UmkmDashboardViewProps {
  data: UmkmDashboardData;
}

export function UmkmDashboardView({ data }: UmkmDashboardViewProps) {
  const { campaign, escrow, submissions, chartData } = data;

  return (
    <UmkmDashboardChrome businessName={data.businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight leading-tight">{data.greeting}</h2>
          <p className="text-base lg:text-lg text-neutral-500 font-semibold">{data.subtitle}</p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          <ActiveCampaignCard campaign={campaign} />
          <EscrowSummaryCard escrow={escrow} />
          <ReviewSubmissionCard submissions={submissions} />
          <UmkmViewsChartCard chartData={chartData} />
        </div>
      </div>
    </UmkmDashboardChrome>
  );
}
