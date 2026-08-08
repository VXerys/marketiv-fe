import { UmkmOverviewClient } from "@/components/features/umkm-dashboard/overview/UmkmOverviewClient";

/**
 * Overview UMKM.
 *
 * Route ini TIDAK mengambil data. Sesi Appwrite hidup di klien, jadi baca dari
 * Server Component selalu 401 saat mock dimatikan — lihat `s5-ssr-to-client`.
 */
export default function UmkmDashboardPage() {
  return <UmkmOverviewClient />;
}
