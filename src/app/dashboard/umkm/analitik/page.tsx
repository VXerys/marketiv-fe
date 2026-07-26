import { AnalitikClient } from "@/components/features/umkm-dashboard/analytics/AnalitikClient";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

export default async function AnalitikPageRoute() {
  const res = await getUmkmProfile();
  const businessName = res.data?.businessName ?? "";
  return <AnalitikClient businessName={businessName} />;
}
