import { getCreatorActiveWorks } from "@/services/creator-dashboard.service";
import { PekerjaanAktifView } from "@/components/features/creator-dashboard/PekerjaanAktifView";

export default async function PekerjaanAktifPage() {
  const res = await getCreatorActiveWorks();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Pekerjaan Aktif</h2>
        <p className="text-sm text-neutral-500 mt-2">Terjadi masalah koneksi ke data layer.</p>
      </div>
    );
  }

  return <PekerjaanAktifView initialWorks={res.data} />;
}
