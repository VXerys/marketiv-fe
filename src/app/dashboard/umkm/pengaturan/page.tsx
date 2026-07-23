import { PengaturanClient } from "@/components/features/umkm-dashboard/settings/PengaturanClient";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

export default async function PengaturanPageRoute() {
  const res = await getUmkmProfile();
  const businessName = res.data?.businessName ?? "";
  return <PengaturanClient businessName={businessName} />;
}
