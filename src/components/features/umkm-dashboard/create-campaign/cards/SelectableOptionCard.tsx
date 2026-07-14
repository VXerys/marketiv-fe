import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  const hasIcon = Boolean(icon);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full text-left rounded-2xl cursor-pointer select-none",
        "transition-all duration-200 hover:-translate-y-0.5 active:scale-[.98] active:translate-y-0",
        hasIcon ? "p-3.5 flex flex-col min-h-[88px]" : "p-3 flex items-center gap-2.5 min-h-[52px]",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      style={selected ? {
        background: "linear-gradient(135deg, rgba(255,247,237,.95) 0%, rgba(255,237,213,.6) 100%)",
        border: "1.5px solid rgba(249,115,22,.35)",
        boxShadow: "0 4px 14px rgba(234,88,12,.12), inset 0 1px 0 rgba(255,255,255,.8)",
      } : {
        background: "rgba(255,255,255,.85)",
        border: "1.5px solid rgba(17,24,39,.09)",
        boxShadow: "0 1px 3px rgba(15,23,42,.04)",
      }}
    >
      {/* Selected check badge */}
      {selected ? (
        <span
          className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #fb7a18, #ea580c)",
            boxShadow: "0 2px 6px rgba(234,88,12,.28)",
          }}
        >
          <Check size={10} strokeWidth={3} className="text-white" />
        </span>
      ) : badge ? (
        <div className="absolute top-2 right-2">{badge}</div>
      ) : null}

      {/* With-icon layout: icon top, label bottom */}
      {hasIcon ? (
        <>
          <div
            className="w-8 h-8 rounded-[11px] flex items-center justify-center shrink-0 mb-auto transition-all duration-200"
            style={selected ? {
              background: "linear-gradient(135deg, #fb7a18, #ea580c)",
              color: "white",
              boxShadow: "0 3px 8px rgba(234,88,12,.22)",
            } : {
              background: "rgba(243,244,246,.9)",
              color: "#9ca3af",
              border: "1px solid rgba(17,24,39,.07)",
            }}
          >
            {icon}
          </div>
          <div className="mt-2 min-w-0 pr-5 space-y-0.5">
            <span className={cn(
              "block text-[.78rem] font-[760] leading-tight transition-colors",
              selected ? "text-orange-700" : "text-ink-800"
            )}>
              {title}
            </span>
            {description && (
              <span className={cn(
                "block text-[.68rem] font-[580] leading-tight transition-colors",
                selected ? "text-orange-500" : "text-ink-400"
              )}>
                {description}
              </span>
            )}
          </div>
        </>
      ) : (
        /* No-icon layout: compact horizontal pill */
        <>
          {/* Color dot */}
          <span
            className="w-2 h-2 rounded-full shrink-0 transition-all duration-200"
            style={selected ? {
              background: "linear-gradient(135deg, #fb7a18, #ea580c)",
              boxShadow: "0 0 0 3px rgba(249,115,22,.15)",
            } : {
              background: "rgba(209,213,219,1)",
            }}
          />
          <div className="min-w-0 flex-1 pr-4">
            <span className={cn(
              "block text-[.8rem] font-[720] leading-tight transition-colors",
              selected ? "text-orange-700" : "text-ink-800"
            )}>
              {title}
            </span>
            {description && (
              <span className={cn(
                "block text-[.68rem] font-[560] leading-tight mt-0.5 transition-colors",
                selected ? "text-orange-500" : "text-ink-400"
              )}>
                {description}
              </span>
            )}
          </div>
        </>
      )}
    </button>
  );
}
