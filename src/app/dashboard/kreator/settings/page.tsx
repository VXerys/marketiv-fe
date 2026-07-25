import {
  getCreatorPortfolio,
  getCreatorProfile,
} from "@/services/creator/creator-dashboard.service";
import { SettingsView } from "@/components/features/creator-dashboard/SettingsView";

export const metadata = {
  title: "Pengaturan — Dashboard Kreator | Marketiv",
};

export default async function SettingsPage() {
  const [res, portfolioRes] = await Promise.all([
    getCreatorProfile(),
    getCreatorPortfolio(),
  ]);

  // CreatorErrorState memasang onClick, jadi tidak bisa dirender dari Server
  // Component — pola markup di bawah sama dengan route Kreator lainnya.
  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Profil</h2>
        <p className="text-sm text-neutral-500 mt-2">
          {res.error ?? "Terjadi masalah koneksi ke data layer."}
        </p>
      </div>
    );
  }

  return (
    <SettingsView
      initialProfile={res.data}
      initialPortfolio={portfolioRes.data ?? []}
    />
  );
}
