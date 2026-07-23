import { StatusDetail, EscrowStepStatus } from "./negotiation.types";

/**
 * Maps the negotiation status string to labels and CSS classes.
 */
export function getStatusDetails(status: string): StatusDetail {
  switch (status) {
    case "pending_payment":
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
    case "in_progress":
      return {
        label: "Sedang Dikerjakan",
        textClass: "text-info-strong",
        bgClass: "bg-info-soft/30 border-info-soft",
      };
    case "revision":
      return {
        label: "Revisi",
        textClass: "text-danger-strong",
        bgClass: "bg-danger-soft/30 border-danger-soft",
      };
    case "approved":
      return {
        label: "Disetujui",
        textClass: "text-success-strong",
        bgClass: "bg-success-soft/30 border-success-soft",
      };
    case "completed":
      return {
        label: "Selesai",
        textClass: "text-success-strong",
        bgClass: "bg-success-soft/30 border-success-soft",
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
      if (orderStatus === "pending_payment") return "active";
      return "completed";
    case 2:
      if (orderStatus === "pending_payment") return "pending";
      if (orderStatus === "escrow") return "active";
      return "completed";
    case 3:
      if (["pending_payment", "escrow"].includes(orderStatus)) return "pending";
      if (orderStatus === "in_progress" || orderStatus === "revision") return "active";
      return "completed";
    case 4:
      if (["pending_payment", "escrow", "in_progress", "revision"].includes(orderStatus)) return "pending";
      if (orderStatus === "approved") return "active";
      return "completed";
    case 5:
      if (orderStatus === "completed") return "completed";
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
