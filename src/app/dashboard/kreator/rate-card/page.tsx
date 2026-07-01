import { getCreatorRateCardPackages } from "@/services/creator-dashboard.service";
import { RateCardView } from "@/components/features/creator-dashboard/RateCardView";

export default async function RateCardPage() {
  const res = await getCreatorRateCardPackages();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Rate Card</h2>
        <p className="text-sm text-neutral-500 mt-2">Terjadi masalah koneksi ke data layer.</p>
      </div>
    );
  }

  return <RateCardView initialPackages={res.data} />;
}
