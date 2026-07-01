import { NegotiationOrder } from "@/types/umkm-dashboard.types";

export type OrderStatus = NegotiationOrder["status"];

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
