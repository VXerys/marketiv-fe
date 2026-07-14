import { getCreatorRateCardPackages } from "@/services/creator-dashboard.service";
import { RateCardView } from "@/components/features/creator-dashboard/RateCardView";
import { CreatorErrorState } from "@/components/features/creator-dashboard/CreatorErrorState";

export const metadata = {
  title: "Rate Card — Dashboard Kreator | Marketiv",
};

export default async function RateCardPage() {
  const res = await getCreatorRateCardPackages();

  if (!res.success || !res.data) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[60vh]">
        <CreatorErrorState
          errorMsg="Gagal memuat daftar paket Rate Card. Periksa koneksi Anda dan coba lagi."
          onRetry={() => {
            // Server component — user must reload the page
            if (typeof window !== "undefined") window.location.reload();
          }}
        />
      </div>
    );
  }

  return <RateCardView initialPackages={res.data} />;
}
