import { cn } from "@/lib/utils";

interface CampaignProgressProps {
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  className?: string;
}

export function CampaignProgress({ value, label, subLabel, className }: CampaignProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full flex flex-col gap-1", className)}>
      {(label || subLabel) && (
        <div className="flex justify-between items-baseline text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          {label && <span>{label}</span>}
          {subLabel && <span className="text-primary">{subLabel}</span>}
        </div>
      )}
      <div className="w-full h-2 bg-neutral-200/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
