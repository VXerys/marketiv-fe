import type { CampaignWizardInput } from "@/lib/validations/campaign.schema";

export type StepStatus = "idle" | "active" | "completed" | "invalid";

/**
 * State wizard = skema Zod sebagai sumber tunggal daftar field
 * (src/lib/validations/campaign.schema). Nama & file dipertahankan supaya
 * import 5 step tidak berubah.
 */
export type CampaignWizardState = CampaignWizardInput;

export type ValidationError = Record<string, string>;
