import { CampaignCard } from "./CampaignCard";
import type { Campaign } from "@/types/campaign";

interface CampaignGridProps {
  title: string;
  campaigns: Campaign[];
}

export function CampaignGrid({ title, campaigns }: CampaignGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-text-main mb-4 md:mb-6">{title}</h2>
      <div className="responsive-card-grid">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}
