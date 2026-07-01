"use client";

import type { ReactNode } from "react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}

interface DashboardActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
}

/**
 * @deprecated Use DropdownMenu from @/components/ui/dropdown-menu instead.
 */
export function DashboardActionMenu({ items, label = "Aksi lainnya" }: DashboardActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
          aria-label={label}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
            <path d="M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
            <path d="M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-52 rounded-2xl border border-neutral-200 bg-white py-2 shadow-[0_22px_60px_rgba(15,23,42,0.16)]" align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            variant={item.tone === "danger" ? "destructive" : "default"}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition cursor-default",
              item.tone === "danger" ? "text-red-600 focus:bg-red-50 focus:text-red-600" : "text-neutral-700 hover:bg-neutral-50",
              item.disabled && "cursor-not-allowed opacity-50 focus:bg-transparent focus:text-neutral-700",
            )}
            onClick={item.onClick}
          >
            {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
