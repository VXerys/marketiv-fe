"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Konfirmasi logout — satu komponen untuk kedua sidebar.
 *
 * Sebelumnya markup ini diduplikasi persis di DashboardSidebar dan
 * CreatorDashboardSidebar, dan tombol konfirmasinya adalah <Link href="/">:
 * ia hanya bernavigasi, sesi Appwrite tetap hidup. Siapa pun yang membuka
 * /dashboard lagi langsung masuk tanpa login ulang.
 *
 * Dibangun di atas Radix Dialog supaya dapat focus trap, Escape, outside-click,
 * dan role="dialog" — yang semuanya tidak dimiliki versi hand-roll.
 */
const ACCENTS = {
  orange:
    "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/10 hover:shadow-orange-500/15",
  red: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/10 hover:shadow-red-500/15",
} as const;

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  accent = "orange",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accent?: keyof typeof ACCENTS;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await logout();
    // Redirect tinggal di pemanggil, bukan di AuthProvider — provider harus
    // tetap agnostik routing.
    router.replace(routes.login);
  }

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-w-[340px] flex-col gap-0 overflow-hidden rounded-3xl border-white/10 bg-[#0d1527] p-0",
          "[&>button:last-child]:text-white/60 [&>button:last-child]:hover:text-white"
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/5 bg-black/40">
          <Image
            src="/logout_exit_door.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-2 px-6 pt-5 pb-6 text-center">
          <DialogTitle className="text-xl font-extrabold tracking-tight text-white">
            Logout?
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold leading-relaxed text-neutral-400">
            Kamu yakin ingin keluar? Sesi kamu akan diakhiri.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-2.5 px-6 pb-6">
          <button
            onClick={handleLogout}
            disabled={pending}
            className={cn(
              "flex min-h-[44px] items-center justify-center rounded-xl px-4 text-xs font-extrabold text-white shadow-md transition-all duration-150 hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
              ACCENTS[accent]
            )}
          >
            {pending ? "Mengeluarkan…" : "Logout"}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] px-4 text-xs font-extrabold text-white outline-none transition-all duration-150 hover:border-white/10 hover:bg-white/[0.06] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            Kembali
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
