import { NegotiationOrder } from "@/types/umkm-dashboard.types";

/**
 * Tahap ruang negosiasi. Namanya tetap `OrderStatus` supaya import di seluruh
 * folder ini tidak berubah, tapi isinya kini `NegotiationStage` — mencakup
 * tahap sebelum order ada (`chatting`, `offer_pending`, …), bukan hanya
 * `orders.status`.
 */
export type OrderStatus = NegotiationOrder["stage"];

export interface StatusDetail {
  label: string;
  textClass: string;
  bgClass: string;
}

export type EscrowStepStatus = "completed" | "active" | "pending" | "dispute" | "cancelled";

export interface EscrowStep {
  label: string;
  desc: string;
}

export interface ToolbarStatusFilterOption {
  id: string;
  label: string;
}

export interface ToolbarSortOption {
  id: string;
  label: string;
}
