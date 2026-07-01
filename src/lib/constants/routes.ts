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
} as const;
