import { getCreatorJobs } from "@/services/creator-dashboard.service";
import { JobPoolView } from "@/components/features/creator-dashboard/JobPoolView";

export default async function JobPoolPage() {
  const res = await getCreatorJobs();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Job Pool</h2>
        <p className="text-sm text-neutral-500 mt-2">Terjadi masalah koneksi ke data layer.</p>
      </div>
    );
  }

  return <JobPoolView initialJobs={res.data} />;
}
