import type { UserRole } from "@/types/domain";

/**
 * Central Route Constants
 *
 * Single source of truth for all application routes.
 * Use these constants in Link hrefs, router.push(), and redirect() calls
 * to prevent typo-driven 404s and to simplify future route refactors.
 */
export const routes = {
  // Public
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  /**
   * Wizard lengkapi profil. Butuh sesi aktif, jadi sengaja DI LUAR route group
   * (auth) yang justru memantulkan pengguna yang sudah punya sesi.
   */
  onboarding: "/onboarding",

  // Legal & Informational
  panduan: "/panduan",
  tentangKami: "/tentang-kami",
  kebijakanPrivasi: "/kebijakan-privasi",
  syaratKetentuan: "/syarat-ketentuan",

  // UMKM Dashboard
  dashboardUmkm: "/dashboard/umkm",
  umkmCampaign: "/dashboard/umkm/campaign",
  umkmCreateCampaign: "/dashboard/umkm/campaign/buat",
  umkmCampaignDetail: (campaignId: string) =>
    `/dashboard/umkm/campaign/${campaignId}`,
  umkmCreators: "/dashboard/umkm/kreator",
  umkmCreatorDetail: (creatorId: string) =>
    `/dashboard/umkm/kreator/${creatorId}`,
  umkmNegotiation: "/dashboard/umkm/negosiasi",
  umkmNegotiationDetail: (orderId: string) =>
    `/dashboard/umkm/negosiasi/${orderId}`,
  umkmFinance: "/dashboard/umkm/keuangan",
  umkmTransactionDetail: (transactionId: string) =>
    `/dashboard/umkm/keuangan/transaksi/${transactionId}`,

  // Kreator Dashboard
  dashboardKreator: "/dashboard/kreator",
  kreatorJobPool: "/dashboard/kreator/job-pool",
  kreatorJobPoolDetail: (campaignId: string) =>
    `/dashboard/kreator/job-pool/${campaignId}`,
  kreatorActiveWorks: "/dashboard/kreator/pekerjaan-aktif",
  kreatorActiveWorkDetail: (claimId: string) =>
    `/dashboard/kreator/pekerjaan-aktif/${claimId}`,
  kreatorRateCard: "/dashboard/kreator/rate-card",
  kreatorNegotiation: "/dashboard/kreator/negosiasi",
  kreatorNegotiationDetail: (orderId: string) =>
    `/dashboard/kreator/negosiasi/${orderId}`,
  kreatorFinance: "/dashboard/kreator/keuangan",
  kreatorWithdrawal: "/dashboard/kreator/keuangan/withdrawal",

  // Admin
  admin: "/admin",
  adminSubmissions: "/admin/submissions",
  adminSubmissionDetail: (submissionId: string) =>
    `/admin/submissions/${submissionId}`,
  adminDisputes: "/admin/disputes",
  adminDisputeDetail: (disputeId: string) => `/admin/disputes/${disputeId}`,
  adminUsers: "/admin/users",
  adminReports: "/admin/reports",

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
 * `admin` menunjuk /admin yang BELUM ada route-nya (celah diketahui, di luar
 * Sprint 6). Sebelumnya "/" — memantulkan admin ke landing publik secara diam-diam;
 * 404 yang jujur lebih baik daripada pantulan yang salah tanpa jejak.
 */
export const dashboardByRole: Record<UserRole, string> = {
  umkm: routes.dashboardUmkm,
  creator: routes.dashboardKreator,
  admin: routes.admin,
};
