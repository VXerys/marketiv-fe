import { cn } from "@/lib/utils";

type StatusType =
  | "campaign"
  | "claim"
  | "submission"
  | "negotiation"
  | "transaction";

interface CreatorStatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

export function CreatorStatusBadge({
  status,
  type,
  className,
}: CreatorStatusBadgeProps) {
  // Common badge style mappings
  const getBadgeStyle = () => {
    const s = status.toLowerCase();

    // Success / Active / Valid states -> Green
    if (
      s === "aktif" ||
      s === "valid" ||
      s === "success" ||
      s === "selesai" ||
      s === "complete" ||
      s === "verified"
    ) {
      return "bg-green-50 text-green-700 border-green-200/60";
    }

    // Pending / In-progress states -> Amber/Yellow
    if (
      s === "pending" ||
      s === "menunggupembayaran" ||
      s === "waiting_payment" ||
      s === "menungguverifikasi" ||
      s === "waiting_verification" ||
      s === "processing" ||
      s === "revisi" ||
      s === "negosiasi" ||
      s === "negotiation"
    ) {
      return "bg-amber-50 text-amber-700 border-amber-200/50";
    }

    // Escrow state -> Blue/Indigo
    if (s === "escrow" || s === "underreview") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200/50";
    }

    // Dispute states -> Purple
    if (s === "dispute" || s === "open") {
      return "bg-purple-50 text-purple-700 border-purple-200/50";
    }

    // Fail / Cancelled / Rejected states -> Red
    if (
      s === "failed" ||
      s === "dibatalkan" ||
      s === "cancelled" ||
      s === "fraud" ||
      s === "rejected" ||
      s === "expired" ||
      s === "suspended"
    ) {
      return "bg-red-50 text-red-700 border-red-200/50";
    }

    // Default -> Gray
    return "bg-neutral-50 text-neutral-600 border-neutral-200/60";
  };

  const formatStatusText = () => {
    switch (status.toLowerCase()) {
      case "menunggupembayaran":
      case "waiting_payment":
        return "Menunggu Pembayaran";
      case "menungguverifikasi":
      case "waiting_verification":
        return "Menunggu Verifikasi";
      case "underreview":
        return "Dalam Review";
      case "escrow_release":
        return "Pelepasan Escrow";
      default:
        return status;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider shadow-sm shrink-0",
        getBadgeStyle(),
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        status.toLowerCase() === "aktif" || status.toLowerCase() === "valid" || status.toLowerCase() === "success" || status.toLowerCase() === "selesai" ? "bg-green-500" :
        status.toLowerCase() === "pending" || status.toLowerCase() === "revisi" || status.toLowerCase() === "negosiasi" ? "bg-amber-500" :
        status.toLowerCase() === "escrow" ? "bg-indigo-500" :
        status.toLowerCase() === "dispute" ? "bg-purple-500" : "bg-red-500"
      )}></span>
      {formatStatusText()}
    </span>
  );
}
