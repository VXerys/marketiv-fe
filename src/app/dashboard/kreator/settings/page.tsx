import { getCreatorProfile } from "@/services/creator/creator-dashboard.service";
import { SettingsView } from "@/components/features/creator-dashboard/SettingsView";
import { CreatorErrorState } from "@/components/features/creator-dashboard/CreatorErrorState";

export const metadata = {
  title: "Pengaturan — Dashboard Kreator | Marketiv",
};

export default async function SettingsPage() {
  const res = await getCreatorProfile();

  if (!res.success || !res.data) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[60vh]">
        <CreatorErrorState
          errorMsg="Gagal memuat data profil. Periksa koneksi Anda dan coba lagi."
          onRetry={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
        />
      </div>
    );
  }

  return <SettingsView initialProfile={res.data} />;
}
