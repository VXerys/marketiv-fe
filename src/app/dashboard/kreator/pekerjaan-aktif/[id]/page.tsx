import { getCreatorActiveWorkById } from "@/services/creator-dashboard.service";
import { ActiveWorkDetailView } from "@/components/features/creator-dashboard";

interface ActiveWorkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActiveWorkDetailPage({ params }: ActiveWorkDetailPageProps) {
  const { id } = await params;
  const res = await getCreatorActiveWorkById(id);

  return <ActiveWorkDetailView work={res.data} />;
}
