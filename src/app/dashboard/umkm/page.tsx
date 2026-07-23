import { UmkmOverviewClient } from "@/components/features/umkm-dashboard/overview/UmkmOverviewClient";
import { getOverview, getCampaigns } from "@/services/umkm/umkm-dashboard.service";

/**
 * Overview UMKM (s1-overview).
 *
 * Sumber data lewat facade service — bukan lagi bypass ke @/data/umkmDashboard.
 * Campaign list dari getCampaigns() (bukan fabrikasi inline), view-model kaya
 * dari getOverview().
 */
export default async function UmkmDashboardPage() {
  const [overviewRes, campaignsRes] = await Promise.all([getOverview(), getCampaigns()]);

  const overview = overviewRes.data;
  const campaigns = campaignsRes.data ?? [];

  if (!overviewRes.success || !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {overviewRes.error ?? "Gagal memuat ringkasan dashboard. Coba muat ulang halaman."}
        </p>
      </div>
    );
  }

  return <UmkmOverviewClient data={overview} mappedCampaigns={campaigns} />;
}
