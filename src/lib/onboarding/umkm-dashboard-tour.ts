import type { UmkmOnboardingStep } from "./umkm-driver";

/** T03 only. T04 owns any route continuation after this final step. */
export const umkmDashboardTourSteps: UmkmOnboardingStep[] = [
  {
    id: "dashboard-overview",
    anchor: "dashboard-overview",
    title: "Dashboard UMKM",
    description: "Pantau ringkasan campaign, kreator, dan dana berjalan.",
    side: "bottom",
    align: "start",
  },
  {
    id: "campaign-nav",
    anchor: "campaign-nav",
    title: "Campaign",
    description: "Buka menu Campaign untuk melihat dan mengelola campaign Anda.",
    side: "right",
    align: "start",
  },
  {
    id: "create-campaign",
    anchor: "create-campaign",
    title: "Buat Campaign",
    description: "Pilih Buat Campaign untuk memulai promosi produk. Panduan berikutnya ada di halaman Campaign.",
    side: "top",
    align: "start",
  },
];
