"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarketivDropdownOption {
  value: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface MarketivDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly MarketivDropdownOption[];
  placeholder?: string;
  label?: string;
  prefix?: string;
  theme?: "default" | "kreator" | "umkm";
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  align?: "start" | "end";
}

export function MarketivDropdown({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi",
  label,
  prefix,
  theme = "default",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  align = "start",
}: MarketivDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue);
      setIsOpen(false);
    },
    [onChange]
  );

  // Theme-specific styles
  const isCreator = theme === "kreator";
  const isUmkm = theme === "umkm";

  const triggerOpenStyles = isCreator
    ? "border-violet-400 bg-white text-violet-950 ring-2 ring-violet-500/15 shadow-xs"
    : isUmkm
    ? "border-brand-coral bg-white text-slate-900 ring-2 ring-brand-coral/15 shadow-xs"
    : "border-slate-400 bg-white text-slate-900 ring-2 ring-slate-400/15 shadow-xs";

  const triggerHoverStyles = isCreator
    ? "hover:border-violet-300 hover:bg-violet-50/30 hover:text-violet-900"
    : isUmkm
    ? "hover:border-brand-coral/60 hover:bg-orange-50/30 hover:text-slate-900"
    : "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

  const chevronStyles = isCreator
    ? isOpen ? "text-violet-600 rotate-180" : "text-slate-400"
    : isUmkm
    ? isOpen ? "text-brand-coral rotate-180" : "text-slate-400"
    : isOpen ? "text-slate-700 rotate-180" : "text-slate-400";

  const activeItemStyles = isCreator
    ? "bg-violet-50 text-violet-700 font-extrabold"
    : isUmkm
    ? "bg-orange-50 text-brand-coral font-extrabold"
    : "bg-slate-100 text-slate-900 font-extrabold";

  const hoverItemStyles = isCreator
    ? "hover:bg-violet-50/60 hover:text-violet-900"
    : isUmkm
    ? "hover:bg-orange-50/60 hover:text-slate-900"
    : "hover:bg-slate-50 hover:text-slate-900";

  const checkmarkStyles = isCreator ? "text-violet-600" : isUmkm ? "text-brand-coral" : "text-slate-700";

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      {label && <span className="sr-only">{label}</span>}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-10 w-full min-w-[140px] items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-3xs transition-all cursor-pointer select-none",
          isOpen
            ? triggerOpenStyles
            : cn("border-slate-200 bg-slate-50/70 text-slate-700", triggerHoverStyles),
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          triggerClassName
        )}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption?.icon}
          <span>
            {prefix ? `${prefix}: ` : ""}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span className="text-[10px] text-slate-400 font-semibold">
              ({selectedOption.count})
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200", chevronStyles)} />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 mt-1.5 min-w-[180px] w-full sm:w-max max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_10px_38px_rgba(15,23,42,.14)] animate-in fade-in zoom-in-95 duration-150",
            align === "end" ? "right-0" : "left-0",
            contentClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer select-none text-left",
                  isSelected ? activeItemStyles : cn("text-slate-700", hoverItemStyles)
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {option.icon}
                  <span className="truncate">
                    {prefix ? `${prefix}: ` : ""}
                    {option.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {option.count !== undefined && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                        isSelected
                          ? isCreator
                            ? "bg-violet-200/60 text-violet-800"
                            : isUmkm
                            ? "bg-orange-200/60 text-orange-900"
                            : "bg-slate-200 text-slate-800"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {option.count}
                    </span>
                  )}
                  {isSelected && <Check className={cn("h-3.5 w-3.5", checkmarkStyles)} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
