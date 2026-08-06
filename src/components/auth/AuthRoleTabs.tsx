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
        className="grid w-full grid-cols-2 rounded-full bg-orange-50/60 p-1.5 border border-orange-200/60 shadow-2xs"
        aria-label="Pilih Peran Akun"
      >
        <Tabs.Trigger
          value="umkm"
          className={cn(
            "flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-extrabold transition-all duration-200 outline-none select-none cursor-pointer",
            "data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-2xs data-[state=active]:border data-[state=active]:border-orange-200/80",
            "data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-ink-950"
          )}
        >
          <Store className="h-4 w-4" />
          <span>Sebagai UMKM</span>
        </Tabs.Trigger>

        <Tabs.Trigger
          value="creator"
          className={cn(
            "flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-extrabold transition-all duration-200 outline-none select-none cursor-pointer",
            "data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-2xs data-[state=active]:border data-[state=active]:border-violet-200/80",
            "data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-ink-950"
          )}
        >
          <Video className="h-4 w-4" />
          <span>Sebagai Kreator</span>
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
