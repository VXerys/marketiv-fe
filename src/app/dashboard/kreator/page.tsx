import { CreatorOverviewPageClient } from "@/components/features/creator-dashboard/CreatorOverviewPageClient";

/**
 * Overview Kreator.
 *
 * Route ini TIDAK mengambil data — sesi Appwrite hidup di klien, jadi baca dari
 * Server Component selalu 401 (`s5-ssr-to-client`).
 */
export default function CreatorPage() {
  return <CreatorOverviewPageClient />;
}
