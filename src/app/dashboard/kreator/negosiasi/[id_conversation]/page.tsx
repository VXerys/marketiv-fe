import { NegosiasiRoomView } from "@/components/features/creator-dashboard";

/**
 * Ruang negosiasi di-key oleh conversationId, bukan orderId — di Alur B
 * percakapan dan Custom Offer terjadi sebelum order ada.
 *
 * Data TIDAK diambil di sini. Function DTO menegakkan kepemilikan lewat header
 * `x-appwrite-user-id` sesi aktif, dan sesi Appwrite hidup di klien — memanggil
 * dari Server Component akan selalu balik 401 (pelajaran `s3-ssr-session`).
 */
interface NegosiasiDetailPageProps {
  params: Promise<{ id_conversation: string }>;
}

export default async function NegosiasiDetailPage({ params }: NegosiasiDetailPageProps) {
  const { id_conversation } = await params;

  return <NegosiasiRoomView conversationId={id_conversation} />;
}
