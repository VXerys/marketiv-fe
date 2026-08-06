"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Store, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuthRole = "umkm" | "creator";

interface AuthRoleTabsProps {
  activeRole: AuthRole;
  onRoleChange: (role: AuthRole) => void;
  className?: string;
}

/**
 * Tab switcher role menggunakan Radix UI Tabs primitive.
 * Memberikan feedback visual halus saat berpindah antara UMKM & Kreator.
 */
export function AuthRoleTabs({
  activeRole,
  onRoleChange,
  className,
}: AuthRoleTabsProps) {
  return (
    <Tabs.Root
      value={activeRole}
      onValueChange={(val) => onRoleChange(val as AuthRole)}
      className={cn("w-full mb-6", className)}
    >
      <Tabs.List
        className="grid w-full grid-cols-2 rounded-2xl bg-neutral-100/80 p-1.5 border border-neutral-200/60 shadow-inner"
        aria-label="Pilih Peran Akun"
      >
        <Tabs.Trigger
          value="umkm"
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-[800] transition-all duration-200 outline-none select-none",
            "data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-soft-1 data-[state=active]:border data-[state=active]:border-orange-200/50",
            "data-[state=inactive]:text-ink-500 data-[state=inactive]:hover:text-ink-900"
          )}
        >
          <Store className="h-4 w-4" />
          <span>Sebagai UMKM</span>
        </Tabs.Trigger>

        <Tabs.Trigger
          value="creator"
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-[800] transition-all duration-200 outline-none select-none",
            "data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-soft-1 data-[state=active]:border data-[state=active]:border-violet-200/50",
            "data-[state=inactive]:text-ink-500 data-[state=inactive]:hover:text-ink-900"
          )}
        >
          <Video className="h-4 w-4" />
          <span>Sebagai Kreator</span>
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
