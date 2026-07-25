import { getCreatorJobById } from "@/services/creator/creator-dashboard.service";
import { JobDetailView } from "@/components/features/creator-dashboard";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const res = await getCreatorJobById(id);

  // Gagal memuat ≠ campaign tidak ada. Tanpa cabang ini, kegagalan sesi atau
  // jaringan tampil ke kreator sebagai "Kampanye tidak ditemukan".
  if (!res.success && res.code !== "not_found") {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Campaign</h2>
        <p className="text-sm text-neutral-500 mt-2">
          {res.error ?? "Terjadi masalah koneksi ke data layer."}
        </p>
      </div>
    );
  }

  return <JobDetailView job={res.data} />;
}
