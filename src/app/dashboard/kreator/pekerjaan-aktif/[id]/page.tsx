import { ActiveWorkDetailPageClient } from "@/components/features/creator-dashboard/ActiveWorkDetailPageClient";

interface ActiveWorkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActiveWorkDetailPage({ params }: ActiveWorkDetailPageProps) {
  const { id } = await params;
  return <ActiveWorkDetailPageClient workId={id} />;
}
