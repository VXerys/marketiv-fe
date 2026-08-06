"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check, ShieldCheck, Zap, MessageSquareHeart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STORAGE_KEY = "marketiv_beta_dont_show_again_aug2026";

export function BetaTesterModal() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        const timer = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  function handleClose() {
    setOpen(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Safe fallback
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] max-w-[420px] rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-2xl transition-all duration-300">
        {/* Top Header Badge Icon */}
        <div className="mx-auto mb-4 flex flex-col items-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-violet-600 text-white shadow-lg shadow-orange-500/20">
            <Sparkles className="h-7 w-7 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-600 text-[9px] font-extrabold text-white border border-white">
              β
            </span>
          </div>
        </div>

        {/* Title & Body */}
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-[0.72rem] font-extrabold text-orange-600 border border-orange-500/20">
            <span>UJI COBA TERBATAS</span>
            <span>•</span>
            <span>s.d 31 AGUSTUS 2026</span>
          </div>

          <DialogTitle className="font-display text-xl font-black tracking-tight text-ink-950 pt-1">
            Platform Versi Beta 🚀
          </DialogTitle>

          <DialogDescription className="text-xs font-semibold leading-relaxed text-text-muted">
            Selamat datang di Marketiv! Uji coba terbatas ini untuk menyempurnakan fitur sebelum peluncuran resmi.
          </DialogDescription>
        </DialogHeader>

        {/* Highlight Bullets */}
        <div className="mt-4 space-y-2.5 rounded-xl border border-neutral-200/60 bg-neutral-50 p-3.5 text-xs text-text-primary">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600">
              <Zap size={13} />
            </div>
            <span className="font-semibold text-xs">
              Fitur Kampanye & Rate Card Aktif
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <ShieldCheck size={13} />
            </div>
            <span className="font-semibold text-xs">
              Sistem Pembayaran Tersimpan Aman
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600">
              <MessageSquareHeart size={13} />
            </div>
            <span className="font-semibold text-xs">
              Masukan Anda sangat berharga bagi kami
            </span>
          </div>
        </div>

        {/* Checkbox & Action */}
        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-text-muted cursor-pointer select-none">
            <div
              onClick={() => setDontShowAgain(!dontShowAgain)}
              className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                dontShowAgain
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-neutral-300 bg-white hover:border-neutral-400"
              }`}
            >
              {dontShowAgain && <Check size={12} strokeWidth={3} />}
            </div>
            <span className="text-xs text-text-secondary font-medium">
              Jangan tampilkan pengumuman ini lagi
            </span>
          </label>

          <button
            onClick={handleClose}
            className="w-full min-h-[44px] rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs sm:text-sm font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer"
          >
            Mengerti & Lanjutkan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
