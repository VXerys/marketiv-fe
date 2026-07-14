import { CampaignWizardState, ValidationError } from "./types";

export function validateStepFields(step: number, state: CampaignWizardState): ValidationError {
  const errors: ValidationError = {};

  if (step === 1) {
    if (!state.title.trim()) {
      errors.title = "Judul campaign wajib diisi.";
    }
    if (!state.category) {
      errors.category = "Kategori Niche wajib dipilih.";
    }
    if (state.description.trim().length < 30) {
      errors.description = "Deskripsi produk minimal 30 karakter.";
    }
  }

  if (step === 2) {
    if (state.brief.trim().length < 50) {
      errors.brief = "Brief utama minimal 50 karakter.";
    }
    if (!state.videoStyle) {
      errors.videoStyle = "Gaya/tone video wajib dipilih.";
    }
    if (!state.callToAction) {
      errors.callToAction = "Call to Action (CTA) wajib dipilih.";
    }
  }

  if (step === 3) {
    if (!state.externalAssetUrl.trim()) {
      errors.externalAssetUrl = "Tautan aset eksternal wajib diisi.";
    } else if (!state.externalAssetUrl.trim().startsWith("https://")) {
      errors.externalAssetUrl = "Format tautan salah. Harus menggunakan HTTPS link (https://).";
    }
  }

  if (step === 4) {
    if (state.pricePerThousandViews <= 0) {
      errors.pricePerThousandViews = "Bayaran per 1.000 views harus lebih besar dari Rp 0.";
    }
    if (state.creatorQuota <= 0) {
      errors.creatorQuota = "Kuota rekrutmen kreator minimal 1 slot.";
    }
    if (state.totalBudgetEscrow < 100000) {
      errors.totalBudgetEscrow = "Nominal anggaran campaign minimal Rp 100.000.";
    }
  }

  if (step === 5) {
    if (!state.termsAgreed) {
      errors.termsAgreed = "Anda wajib menyetujui rincian escrow dan brief sebelum lanjut.";
    }
  }

  return errors;
}

// Check if a step is fully completed/valid without setting error state
export function isStepCompleted(step: number, state: CampaignWizardState): boolean {
  const errors = validateStepFields(step, state);
  return Object.keys(errors).length === 0;
}
