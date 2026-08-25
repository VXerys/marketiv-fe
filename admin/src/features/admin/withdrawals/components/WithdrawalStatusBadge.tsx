import { WithdrawalStatus } from "../types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<WithdrawalStatus, {
  label: string;
  className: string;
  dotClassName: string;
}> = {
  requested: {
    label: "Diminta",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  processing: {
    label: "Diproses",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    dotClassName: "bg-blue-500",
  },
  succeeded: {
    label: "Berhasil",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-500",
  },
  failed: {
    label: "Gagal",
    className: "border-red-200 bg-red-50 text-red-800",
    dotClassName: "bg-red-500",
  },
  reversed: {
    label: "Dikembalikan",
    className: "border-stone-300 bg-stone-100 text-stone-700",
    dotClassName: "bg-stone-500",
  },
};

export function WithdrawalStatusBadge({ status }: { status: WithdrawalStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
        config.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  );
}
