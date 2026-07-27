import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { NegotiationRoomPage } from "@/components/features/umkm-dashboard/negotiation/detail/NegotiationRoomPage";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

/**
 * Ruang negosiasi di-key oleh conversationId, bukan orderId — di Alur B
 * percakapan dan Custom Offer terjadi sebelum order ada.
 */
interface PageProps {
  params: Promise<{ id_conversation: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id_conversation } = await params;

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
      <NegotiationRoomPage conversationId={id_conversation} />
    </UmkmDashboardChrome>
  );
}
