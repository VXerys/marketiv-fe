import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { NegotiationRoomPage } from "@/components/features/umkm-dashboard/negotiation/detail/NegotiationRoomPage";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

interface PageProps {
  params: Promise<{ id_order: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id_order } = await params;

  let businessName = "Dapur Sehat Sukabumi";
  try {
    const res = await getUmkmProfile();
    if (res.success && res.data) {
      businessName = res.data.businessName;
    }
  } catch (err) {
    console.warn("Failed to load profile on server", err);
  }

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <NegotiationRoomPage orderId={id_order} />
    </UmkmDashboardChrome>
  );
}
