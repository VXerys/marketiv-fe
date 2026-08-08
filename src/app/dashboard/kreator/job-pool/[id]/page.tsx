import { JobDetailPageClient } from "@/components/features/creator-dashboard/JobDetailPageClient";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobDetailPageClient jobId={id} />;
}
