import { UmkmDashboardView } from "@/components/features/dashboard/UmkmDashboardView";
import { UMKM_DASHBOARD_MOCK_DATA } from "@/data/umkmDashboard";

export default function UmkmDashboardPage() {
  const data = UMKM_DASHBOARD_MOCK_DATA;

  return <UmkmDashboardView data={data} />;
}
