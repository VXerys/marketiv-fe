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
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <NegotiationRoomPage orderId={id_order} />
      </div>
    </UmkmDashboardChrome>
  );
}
