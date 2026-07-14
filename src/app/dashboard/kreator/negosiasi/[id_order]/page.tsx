import { getCreatorNegotiationById } from "@/services/creator-dashboard.service";
import { NegosiasiRoomView } from "@/components/features/creator-dashboard";

interface NegosiasiDetailPageProps {
  params: Promise<{ id_order: string }>;
}

export default async function NegosiasiDetailPage({ params }: NegosiasiDetailPageProps) {
  const { id_order } = await params;
  const res = await getCreatorNegotiationById(id_order);

  return <NegosiasiRoomView negotiation={res.data} />;
}
