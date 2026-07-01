import { getCreatorJobById } from "@/services/creator-dashboard.service";
import { JobDetailView } from "@/components/features/creator-dashboard";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const res = await getCreatorJobById(id);

  return <JobDetailView job={res.data} />;
}
