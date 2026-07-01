"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

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

export function DashboardActionMenu({ items, label = "Aksi lainnya" }: DashboardActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
          <path d="M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
          <path d="M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-2 shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition",
                item.tone === "danger" ? "text-red-600 hover:bg-red-50" : "text-neutral-700 hover:bg-neutral-50",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
