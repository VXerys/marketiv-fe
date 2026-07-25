import { z } from "zod";
import { requiredString, digitsOnly } from "./common";
import { MINIMUM_WITHDRAW } from "@/types/domain";

/**
 * Penarikan saldo kreator. Bound `<= balance` adalah data runtime, jadi skema
 * berupa factory. payoutMethod diturunkan dari provider yang dipilih.
 */
export const PAYOUT_PROVIDERS = [
  { id: "mandiri", label: "Bank Mandiri", method: "bank" },
  { id: "bca", label: "Bank BCA", method: "bank" },
  { id: "bni", label: "Bank BNI", method: "bank" },
  { id: "bri", label: "Bank BRI", method: "bank" },
  { id: "gopay", label: "GoPay", method: "ewallet" },
  { id: "ovo", label: "OVO", method: "ewallet" },
] as const;

export type PayoutMethod = "bank" | "ewallet";

export const withdrawalRequestSchema = (balance: number) =>
  z.object({
    amount: z
      .number({ error: "Nominal penarikan wajib diisi." })
      .int("Nominal harus bilangan bulat.")
      .min(MINIMUM_WITHDRAW, `Minimum penarikan Rp ${MINIMUM_WITHDRAW.toLocaleString("id-ID")}.`)
      .max(balance, "Nominal melebihi saldo yang tersedia."),
    payoutMethod: z.enum(["bank", "ewallet"], { error: "Metode penarikan tidak valid." }),
    providerName: requiredString("Nama bank/e-wallet"),
    accountNumber: digitsOnly("Nomor rekening/HP", 6, 20),
    accountName: requiredString("Nama pemilik rekening"),
  });

export type WithdrawalRequestInput = z.infer<ReturnType<typeof withdrawalRequestSchema>>;
