import { Navbar } from "@/components/layouts/Navbar";
import { DashboardHero } from "@/components/features/dashboard/DashboardHero";
import { CampaignGrid } from "@/components/features/dashboard/CampaignGrid";
import { dummyCampaigns } from "@/data/campaigns";
import { CREATOR_CONTENT } from "@/data/content";

export default function CreatorPage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <DashboardHero
        title={CREATOR_CONTENT.hero.title}
        subtitle={CREATOR_CONTENT.hero.subtitle}
        searchPlaceholder={CREATOR_CONTENT.hero.searchPlaceholder}
      />
      <CampaignGrid
        title={CREATOR_CONTENT.grid.title}
        campaigns={dummyCampaigns}
      />
    </main>
  );
}
