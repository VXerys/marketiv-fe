import { z } from "zod";

/**
 * Skema wizard campaign UMKM.
 *
 * `campaignWizardSchema` sengaja permisif (mirror CampaignWizardState: semua
 * string/number/boolean apa adanya) supaya `z.infer` menjadi tipe state wizard
 * dan step bisa diinisialisasi dengan "". Aturan validasi sebenarnya ada di
 * `campaignStepSchemas` per langkah — dipanggil validator adapter.
 *
 * Pesan dijaga byte-identik dengan validator hand-rolled sebelumnya
 * (create-campaign.validation.ts) supaya UX tidak berubah.
 */
export const campaignWizardSchema = z.object({
  title: z.string(),
  category: z.string(),
  description: z.string(),
  location: z.string(),
  brief: z.string(),
  videoStyle: z.string(),
  requiredPoints: z.string(),
  callToAction: z.string(),
  hashtags: z.string(),
  externalAssetUrl: z.string(),
  assetNotes: z.string(),
  pricePerThousandViews: z.number(),
  totalBudgetEscrow: z.number(),
  creatorQuota: z.number(),
  termsAgreed: z.boolean(),
});

export type CampaignWizardInput = z.infer<typeof campaignWizardSchema>;

/** Aturan per langkah. Object non-strict → key ekstra dari state di-strip, bukan error. */
export const campaignStepSchemas: Record<1 | 2 | 3 | 4 | 5, z.ZodType> = {
  1: z.object({
    title: z.string().trim().min(1, "Judul campaign wajib diisi."),
    category: z.string().min(1, "Kategori Niche wajib dipilih."),
    description: z.string().trim().min(30, "Deskripsi produk minimal 30 karakter."),
  }),
  2: z.object({
    brief: z.string().trim().min(50, "Brief utama minimal 50 karakter."),
    videoStyle: z.string().min(1, "Gaya/tone video wajib dipilih."),
    callToAction: z.string().min(1, "Call to Action (CTA) wajib dipilih."),
  }),
  3: z.object({
    externalAssetUrl: z
      .string()
      .trim()
      .min(1, "Tautan aset eksternal wajib diisi.")
      .refine((v) => v.startsWith("https://"), {
        message: "Format tautan salah. Harus menggunakan HTTPS link (https://).",
      }),
  }),
  4: z.object({
    pricePerThousandViews: z
      .number()
      .positive("Bayaran per 1.000 views harus lebih besar dari Rp 0."),
    creatorQuota: z.number().min(1, "Kuota rekrutmen kreator minimal 1 slot."),
    totalBudgetEscrow: z
      .number()
      .min(100000, "Nominal anggaran campaign minimal Rp 100.000."),
  }),
  5: z.object({
    termsAgreed: z.literal(true, {
      error: "Anda wajib menyetujui rincian escrow dan brief sebelum lanjut.",
    }),
  }),
};
