import { getCreatorMetrics, getCreatorTransactions } from "@/services/creator-dashboard.service";
import { KeuanganView } from "@/components/features/creator-dashboard/KeuanganView";

export default async function KeuanganPage() {
  const [metricsRes, txRes] = await Promise.all([
    getCreatorMetrics(),
    getCreatorTransactions(),
  ]);

  if (!metricsRes.success || !metricsRes.data || !txRes.success || !txRes.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Keuangan</h2>
        <p className="text-sm text-neutral-500 mt-2">Terjadi masalah koneksi ke data layer.</p>
      </div>
    );
  }

  return (
    <KeuanganView
      metrics={metricsRes.data}
      initialTransactions={txRes.data}
    />
  );
}
