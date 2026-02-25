import { CampaignCard } from "./CampaignCard";
import type { Campaign } from "@/types/campaign";

interface CampaignGridProps {
  title: string;
  campaigns: Campaign[];
}

export function CampaignGrid({ title, campaigns }: CampaignGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 md:px-10">
      <h2 className="text-heading-2 text-text-main mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}
