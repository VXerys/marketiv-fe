import type { NegotiationStage } from "@/types/domain";

export const PAYMENT_RETURN_TIMEOUT_MS = 60_000;
export const AWAITING_ORDER_POLL_TIMEOUT_MS = 20_000;

/** Tahap akhir tidak perlu polling. State tetap dibaca ulang saat halaman dibuka lagi. */
export function isTerminalNegotiationStage(stage?: NegotiationStage): boolean {
  return stage === "completed" || stage === "cancelled";
}

/** Poll ringan, hanya untuk state yang memang bisa berubah asinkron lintas peran. */
export function getNegotiationPollDelay(
  stage?: NegotiationStage,
  paymentVerification = false
): number | null {
  if (!stage || isTerminalNegotiationStage(stage)) return null;
  if (paymentVerification || stage === "awaiting_order" || stage === "pending_payment") return 2_000;
  if (stage === "in_progress" || stage === "revision" || stage === "escrow") return 5_000;
  return 5_000;
}

/** Browser return bukan bukti bayar. Hanya stage server ini yang menandakan escrow siap kerja. */
export function isPaymentConfirmedStage(stage?: NegotiationStage): boolean {
  return stage === "in_progress" || stage === "revision" || stage === "approved" || stage === "completed";
}

export function buildPaymentReturnUrl(currentUrl: string): string {
  const url = new URL(currentUrl);
  url.searchParams.set("payment_return", "1");
  return url.toString();
}
