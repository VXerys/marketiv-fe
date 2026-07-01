import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SelectableOptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  badge?: ReactNode;
}

export function SelectableOptionCard({
  selected,
  onClick,
  title,
  description,
  icon,
  className,
  disabled = false,
  badge,
}: SelectableOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-4 rounded-2xl transition-all duration-300 relative border flex flex-col justify-between h-full min-h-[105px] group cursor-pointer select-none",
        selected
          ? "bg-primary-50/20 border-primary shadow-[0_8px_24px_-8px_rgba(235,94,40,0.2),_inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-primary"
          : "bg-neutral-50/40 hover:bg-neutral-50/80 border-neutral-200/60 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.01)] hover:border-primary-100",
        disabled && "opacity-50 pointer-events-none",
        "hover:scale-[1.02] hover:-translate-y-0.5 active:scale-98 active:translate-y-0",
        className
      )}
    >
      {/* Top right badges indicators */}
      {selected ? (
        <span className="absolute top-2.5 right-2.5 h-4.5 w-4.5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs border border-white">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : badge ? (
        <div className="absolute top-2 right-2 scale-85 origin-top-right">{badge}</div>
      ) : null}

      {/* Icon Area */}
      {icon && (
        <div
          className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 mb-3",
            selected
              ? "bg-primary text-white shadow-sm shadow-primary/20 scale-105"
              : "bg-white text-text-muted border border-neutral-200/50 group-hover:bg-neutral-100 group-hover:text-text-secondary"
          )}
        >
          {icon}
        </div>
      )}

      {/* Label Info */}
      <div className="space-y-0.5 min-w-0 pr-4 mt-auto">
        <span
          className={cn(
            "block text-xs font-extrabold transition-colors leading-tight truncate",
            selected ? "text-primary-700" : "text-text-primary"
          )}
        >
          {title}
        </span>
        {description && (
          <span className="block text-[9px] text-text-muted leading-tight truncate max-w-full font-semibold">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
