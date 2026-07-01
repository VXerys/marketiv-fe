import { getCreatorProfile } from "@/services/creator-dashboard.service";
import { ProfilView } from "@/components/features/creator-dashboard/ProfilView";

export default async function ProfilPage() {
  const res = await getCreatorProfile();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Profil</h2>
        <p className="text-sm text-neutral-500 mt-2">Terjadi masalah koneksi ke data layer.</p>
      </div>
    );
  }

  return <ProfilView initialProfile={res.data} />;
}
