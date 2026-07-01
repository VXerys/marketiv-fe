import { UmkmOverviewClient } from "@/components/features/umkm-dashboard/overview/UmkmOverviewClient";
import { UMKM_DASHBOARD_MOCK_DATA } from "@/data/umkmDashboard";

export default function UmkmDashboardPage() {
  const data = UMKM_DASHBOARD_MOCK_DATA;

  return <UmkmOverviewClient data={data} />;
}
