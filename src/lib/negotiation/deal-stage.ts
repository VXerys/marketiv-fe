import type { NegotiationStage } from "@/types/domain";

const NEW_DEAL_STAGES: ReadonlySet<NegotiationStage> = new Set([
  "chatting",
  "offer_rejected",
  "completed",
  "cancelled",
]);

/** Stage yang tidak memiliki offer/order aktif dan boleh memulai offer baru. */
export function canStartNewDeal(stage?: NegotiationStage): boolean {
  return stage !== undefined && NEW_DEAL_STAGES.has(stage);
}
