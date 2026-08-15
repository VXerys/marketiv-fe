import type { UserRole } from "@/types/domain";

/**
 * Central Route Constants
 *
 * Single source of truth for all application routes.
 * Use these constants in Link hrefs, router.push(), and redirect() calls
 * to prevent typo-driven 404s and to simplify future route refactors.
 */
/** Canonical external Admin Application URL. No environment fallback is allowed. */
export function getAdminAppUrl(rawValue = process.env.NEXT_PUBLIC_ADMIN_APP_URL): string {
  const value = rawValue?.trim();
  if (!value) {
    throw new Error(
      "Admin URL configuration error: NEXT_PUBLIC_ADMIN_APP_URL is required for cross-app navigation.",
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "Admin URL configuration error: NEXT_PUBLIC_ADMIN_APP_URL must be a valid absolute URL.",
    );
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(
      "Admin URL configuration error: NEXT_PUBLIC_ADMIN_APP_URL must use http or https.",
    );
  }

  if (url.username || url.password || (url.pathname !== "/" && url.pathname !== "") || url.search || url.hash) {
    throw new Error(
      "Admin URL configuration error: NEXT_PUBLIC_ADMIN_APP_URL must be an origin without credentials, path, query, or hash.",
    );
  }

  if (
    process.env.NEXT_PUBLIC_APP_ENV === "production" &&
    /(^|[.-])staging([.-]|$)/i.test(url.hostname)
  ) {
    throw new Error(
      "Admin URL configuration error: production cannot use a staging Admin origin.",
    );
  }

  return url.origin;
}

export const adminAppUrl = getAdminAppUrl();

export const routes = {
  // Public
  home: "/",
  login: "/login",
  register: "/register",
  registerUmkm: "/register?role=umkm",
  registerCreator: "/register?role=creator",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  onboarding: "/onboarding",
  panduan: "/panduan",
  tentangKami: "/tentang-kami",
  kebijakanPrivasi: "/kebijakan-privasi",
  syaratKetentuan: "/syarat-ketentuan",

  // UMKM Dashboard
  dashboardUmkm: "/dashboard/umkm",
  umkmCampaigns: "/dashboard/umkm/campaign",
  umkmCreateCampaign: "/dashboard/umkm/campaign/buat",
  umkmCampaignDetail: (campaignId: string) =>
    `/dashboard/umkm/campaign/${campaignId}`,
  umkmCreators: "/dashboard/umkm/kreator",
  umkmCreatorDetail: (creatorId: string) =>
    `/dashboard/umkm/kreator/${creatorId}`,
  umkmNegotiations: "/dashboard/umkm/negosiasi",
  umkmNegotiationDetail: (orderId: string) =>
    `/dashboard/umkm/negosiasi/${orderId}`,
  umkmFinance: "/dashboard/umkm/keuangan",
  umkmTransactionDetail: (transactionId: string) =>
    `/dashboard/umkm/keuangan/transaksi/${transactionId}`,
  umkmSettings: "/dashboard/umkm/settings",

  // Kreator Dashboard
  dashboardKreator: "/dashboard/kreator",
  kreatorJobPool: "/dashboard/kreator/job-pool",
  kreatorJobDetail: (campaignId: string) =>
    `/dashboard/kreator/job-pool/${campaignId}`,
  kreatorActiveJobs: "/dashboard/kreator/pekerjaan-aktif",
  kreatorActiveJobDetail: (claimId: string) =>
    `/dashboard/kreator/pekerjaan-aktif/${claimId}`,
  kreatorRateCard: "/dashboard/kreator/rate-card",
  kreatorNegotiations: "/dashboard/kreator/negosiasi",
  kreatorNegotiationDetail: (orderId: string) =>
    `/dashboard/kreator/negosiasi/${orderId}`,
  kreatorFinance: "/dashboard/kreator/keuangan",
  kreatorWithdrawal: "/dashboard/kreator/keuangan/withdrawal",
  kreatorSettings: "/dashboard/kreator/settings",

  // Admin App (External Standalone Application)
  admin: adminAppUrl,
  adminSubmissions: `${adminAppUrl}/submissions`,
  adminSubmissionDetail: (submissionId: string) =>
    `${adminAppUrl}/submissions?id=${submissionId}`,
  adminDisputes: `${adminAppUrl}/disputes`,
  adminDisputeDetail: (disputeId: string) => `${adminAppUrl}/disputes/${disputeId}`,
  adminUsers: `${adminAppUrl}/users`,
  adminReports: `${adminAppUrl}/reports`,

  /** Register dengan role sudah dipilih dari CTA landing/navbar. */
  registerWithRole: (role: "umkm" | "creator") => `/register?role=${role}`,
  /** Login dengan tujuan setelah berhasil (dipakai RoleGuard). */
  loginWithNext: (path: string) => `/login?next=${encodeURIComponent(path)}`,
} as const;

/**
 * Dashboard tujuan per role.
 *
 * Tinggal di sini, bukan di RoleGuard, karena RoleGuard, RedirectIfAuthenticated,
 * LoginForm, dan kedua form register semuanya membutuhkannya — empat salinan
 * dijamin drift.
 *
 * `admin` menunjuk ke origin eksternal standalone Admin application (`NEXT_PUBLIC_ADMIN_APP_URL`).
 */
export const dashboardByRole: Record<UserRole, string> = {
  umkm: routes.dashboardUmkm,
  creator: routes.dashboardKreator,
  admin: adminAppUrl,
};
