"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface DashboardActionMenuProps {
  items: ActionMenuItem[];
  trigger?: ReactNode;
  align?: "right" | "left";
  className?: string;
}

export function DashboardActionMenu({
  items,
  trigger,
  align = "right",
  className,
}: DashboardActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (onClick: () => void, disabled?: boolean) => {
    if (disabled) return;
    onClick();
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block text-left z-50", className)} ref={containerRef}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-400 hover:text-primary transition-all w-8 h-8 rounded-full hover:bg-neutral-50 flex items-center justify-center border border-border-soft bg-white cursor-pointer shadow-xs focus:outline-none"
          aria-label="Menu Aksi"
        >
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            "absolute mt-1 w-48 rounded-xl shadow-md bg-white border border-border-soft focus:outline-none z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-w-[90vw] overflow-hidden",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          )}
        >
          <div className="py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={() => handleItemClick(item.onClick, item.disabled)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:pointer-events-none disabled:opacity-40",
                  item.danger
                    ? "text-danger hover:bg-danger-soft/20 hover:text-danger-strong"
                    : "text-text-primary hover:bg-neutral-50"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
