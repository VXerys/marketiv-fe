import { campaignStepSchemas } from "@/lib/validations/campaign.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { CampaignWizardState, ValidationError } from "./types";

/**
 * Adapter tipis di atas skema Zod per langkah (src/lib/validations/campaign.schema).
 * Signature dipertahankan byte-identik supaya 5 step + stepper + checklist yang
 * mengonsumsinya sebagai prop tidak berubah. Path issue Zod = nama field, jadi
 * errors.title dst. tetap cocok.
 */
export function validateStepFields(step: number, state: CampaignWizardState): ValidationError {
  const schema = campaignStepSchemas[step as 1 | 2 | 3 | 4 | 5];
  if (!schema) return {};
  const res = parseOrErrors(schema, state);
  return res.ok ? {} : res.errors;
}

// Check if a step is fully completed/valid without setting error state
export function isStepCompleted(step: number, state: CampaignWizardState): boolean {
  return Object.keys(validateStepFields(step, state)).length === 0;
}
