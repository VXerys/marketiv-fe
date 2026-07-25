import { z } from "zod";
import { requiredString, currencyAmountIDR, integerCount } from "./common";

/**
 * Input paket rate card kreator (boundary service, memakai nama kolom skema:
 * output/deliveryDays/revisionLimit — bukan nama view-model deliverable/
 * estimatedDays/revisionCount). Mirror validatePackage di
 * 00_BACKEND/src/services/creator.service.ts.
 */
export const rateCardPackageSchema = z.object({
  name: requiredString("Nama paket"),
  description: requiredString("Deskripsi paket"),
  output: requiredString("Output/deliverable"),
  deliveryDays: integerCount("Durasi pengerjaan (hari)", 1),
  price: currencyAmountIDR(1000),
  revisionLimit: integerCount("Jumlah revisi", 0),
});

export type RateCardPackageInput = z.infer<typeof rateCardPackageSchema>;
