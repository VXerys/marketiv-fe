import { StatusDetail, EscrowStepStatus } from "./negotiation.types";

/**
 * Calculates the platform escrow fee for Rate Card Mode (10%).
 */
export function calculatePlatformFee(finalPrice: number): number {
  return Math.round(finalPrice * 0.10);
}

/**
 * Calculates the total payment amount including platform escrow fee.
 */
export function calculateTotalPayment(finalPrice: number): number {
  return finalPrice + calculatePlatformFee(finalPrice);
}

/**
 * Maps the negotiation status string to labels and CSS classes.
 */
export function getStatusDetails(status: string): StatusDetail {
  switch (status) {
    case "negotiation":
      return {
        label: "Negosiasi",
        textClass: "text-info-strong",
        bgClass: "bg-info-soft/30 border-info-soft",
      };
    case "waiting_payment":
      return {
        label: "Menunggu Pembayaran",
        textClass: "text-warning-strong",
        bgClass: "bg-warning-soft/30 border-warning-soft",
      };
    case "escrow":
      return {
        label: "Dalam Escrow",
        textClass: "text-primary-800",
        bgClass: "bg-primary-50/50 border-primary-200/50",
      };
    case "revision":
      return {
        label: "Revisi",
        textClass: "text-danger-strong",
        bgClass: "bg-danger-soft/30 border-danger-soft",
      };
    case "waiting_verification":
      return {
        label: "Menunggu Verifikasi",
        textClass: "text-warning-strong",
        bgClass: "bg-warning-soft/30 border-warning-soft",
      };
    case "completed":
      return {
        label: "Selesai",
        textClass: "text-success-strong",
        bgClass: "bg-success-soft/30 border-success-soft",
      };
    case "dispute":
      return {
        label: "Dispute / Sengketa",
        textClass: "text-danger-strong",
        bgClass: "bg-danger-soft/30 border-danger-soft animate-pulse",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        textClass: "text-neutral-600",
        bgClass: "bg-neutral-100 border-neutral-200",
      };
    default:
      return {
        label: status,
        textClass: "text-neutral-600",
        bgClass: "bg-neutral-100 border-neutral-200",
      };
  }
}

/**
 * Formats dynamic step status in the escrow tracker.
 */
export function getStepStatus(stepIdx: number, orderStatus: string): EscrowStepStatus {
  if (orderStatus === "cancelled") {
    return "cancelled";
  }

  switch (stepIdx) {
    case 0:
      return "completed";
    case 1:
      if (orderStatus === "negotiation") return "active";
      return "completed";
    case 2:
      if (orderStatus === "negotiation" || orderStatus === "waiting_payment") return "pending";
      if (orderStatus === "escrow") return "active";
      return "completed";
    case 3:
      if (["negotiation", "waiting_payment", "escrow"].includes(orderStatus)) return "pending";
      if (orderStatus === "revision") return "active";
      return "completed";
    case 4:
      if (["negotiation", "waiting_payment", "escrow", "revision"].includes(orderStatus)) return "pending";
      if (orderStatus === "waiting_verification") return "active";
      return "completed";
    case 5:
      if (orderStatus === "completed") return "completed";
      if (orderStatus === "dispute") return "dispute";
      return "pending";
    default:
      return "pending";
  }
}

/**
 * Formats relative date or text representation for Indonesian local dates with time.
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/**
 * Formats full Indonesian date for deadlines.
 */
export function deadlineTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}
