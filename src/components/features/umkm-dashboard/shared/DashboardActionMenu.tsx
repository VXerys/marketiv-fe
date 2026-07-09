"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          <div className={cn("cursor-pointer inline-block", className)}>
            {trigger}
          </div>
        ) : (
          <button
            className={cn(
              "text-neutral-400 hover:text-primary transition-all w-8 h-8 rounded-full hover:bg-neutral-50 flex items-center justify-center border border-border-soft bg-white cursor-pointer shadow-xs focus:outline-none",
              className
            )}
            aria-label="Menu Aksi"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align === "right" ? "end" : align === "left" ? "start" : undefined}
        className="w-48 bg-white border border-border-soft rounded-xl shadow-md p-1 focus:outline-none z-50 max-w-[90vw] overflow-hidden"
      >
        <div className="py-1">
          {items.map((item, idx) => (
            <DropdownMenuItem
              key={idx}
              disabled={item.disabled}
              onClick={item.onClick}
              variant={item.danger ? "destructive" : "default"}
              className={cn(
                "w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:pointer-events-none disabled:opacity-40",
                item.danger
                  ? "text-danger hover:bg-danger-soft/20 hover:text-danger-strong"
                  : "text-text-primary hover:bg-neutral-50"
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
