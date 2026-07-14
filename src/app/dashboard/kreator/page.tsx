import {
  getCreatorProfile,
  getCreatorMetrics,
  getCreatorActiveWorks,
  getCreatorNegotiations,
  getCreatorActivities,
  getCreatorJobs,
} from "@/services/creator-dashboard.service";
import { CreatorDashboardView } from "@/components/features/creator-dashboard";

export default async function CreatorPage() {
  const [
    profileRes,
    metricsRes,
    activeWorksRes,
    negotiationsRes,
    activitiesRes,
    jobsRes,
  ] = await Promise.all([
    getCreatorProfile(),
    getCreatorMetrics(),
    getCreatorActiveWorks(),
    getCreatorNegotiations(),
    getCreatorActivities(),
    getCreatorJobs(),
  ]);

  if (!profileRes.success || !profileRes.data || !metricsRes.success || !metricsRes.data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-red-600">Gagal Memuat Dashboard</h2>
        <p className="text-sm text-neutral-500 mt-2">Silakan hubungi dukungan atau coba beberapa saat lagi.</p>
      </div>
    );
  }

  return (
    <CreatorDashboardView
      profile={profileRes.data}
      metrics={metricsRes.data}
      activeWorks={activeWorksRes.data || []}
      negotiations={negotiationsRes.data || []}
      activities={activitiesRes.data || []}
      recommendedJobs={jobsRes.data || []}
    />
  );
}
