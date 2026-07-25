import {
  getCreatorMetrics,
  getCreatorRateCardPackages,
} from "@/services/creator/creator-dashboard.service";
import { RateCardView } from "@/components/features/creator-dashboard/RateCardView";

export const metadata = {
  title: "Rate Card — Dashboard Kreator | Marketiv",
};

export default async function RateCardPage() {
  const [packagesRes, metricsRes] = await Promise.all([
    getCreatorRateCardPackages(),
    getCreatorMetrics(),
  ]);

  // CreatorErrorState memasang onClick, jadi tidak bisa dirender dari Server
  // Component — pola markup di bawah sama dengan route Kreator lainnya.
  if (!packagesRes.success || !packagesRes.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Rate Card</h2>
        <p className="text-sm text-neutral-500 mt-2">
          {packagesRes.error ?? "Terjadi masalah koneksi ke data layer."}
        </p>
      </div>
    );
  }

  return (
    <RateCardView
      initialPackages={packagesRes.data}
      ordersCount={metricsRes.data?.negotiationOrdersCount ?? 0}
    />
  );
}
