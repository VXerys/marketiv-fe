import { getCreatorNegotiations } from "@/services/creator-dashboard.service";
import { NegosiasiView } from "@/components/features/creator-dashboard/NegosiasiView";

export default async function NegosiasiPage() {
  const res = await getCreatorNegotiations();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Halaman Negosiasi</h2>
        <p className="text-sm text-neutral-500 mt-2">Terjadi masalah koneksi ke data layer.</p>
      </div>
    );
  }

  return <NegosiasiView initialNegotiations={res.data} />;
}
