import type { UmkmOnboardingStep } from "./umkm-driver";

/** T04 continuation only. Campaign creation, not Rate Card or marketplace. */
export const umkmCampaignTourSteps: UmkmOnboardingStep[] = [
  {
    id: "campaign-create-heading",
    anchor: "campaign-create-heading",
    title: "Informasi Campaign",
    description: "Isi informasi utama campaign agar kreator memahami kebutuhan promosi Anda.",
    side: "bottom",
    align: "start",
  },
];
