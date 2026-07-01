export type StepStatus = "idle" | "active" | "completed" | "invalid";

export interface CampaignWizardState {
  title: string;
  category: string;
  description: string;
  location: string;
  brief: string;
  videoStyle: string;
  requiredPoints: string;
  callToAction: string;
  hashtags: string;
  externalAssetUrl: string;
  assetNotes: string;
  pricePerThousandViews: number;
  totalBudgetEscrow: number;
  creatorQuota: number;
  termsAgreed: boolean;
}

export type ValidationError = Record<string, string>;
