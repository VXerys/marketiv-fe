import { Navbar } from "@/components/layouts/Navbar";
import { DashboardHero } from "@/components/features/dashboard/DashboardHero";
import { CampaignGrid } from "@/components/features/dashboard/CampaignGrid";
import { dummyCampaigns } from "@/data/campaigns";
import { UMKM_CONTENT } from "@/data/content";

export default function UmkmPage() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <DashboardHero
        title={UMKM_CONTENT.hero.title}
        subtitle={UMKM_CONTENT.hero.subtitle}
        searchPlaceholder={UMKM_CONTENT.hero.searchPlaceholder}
      />
      <CampaignGrid
        title={UMKM_CONTENT.grid.title}
        campaigns={dummyCampaigns}
      />
    </main>
  );
}
