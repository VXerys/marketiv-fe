"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check, Store, Video, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STORAGE_KEY = "marketiv_beta_dismissed_aug2026";

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
      <DialogContent className="w-[92vw] sm:w-[620px] max-w-[640px] max-h-[90vh] overflow-y-auto sm:overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4.5 sm:p-5.5 shadow-2xl transition-all duration-300">
        {/* Top Header Icon */}
        <div className="mx-auto mb-1 flex flex-col items-center">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-black text-white border-2 border-white">
              β
            </span>
          </div>
        </div>

        {/* Header Title & Subtitle */}
        <DialogHeader className="text-center space-y-1">
          <div className="mx-auto inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-orange-600 border border-orange-200/80 uppercase tracking-wide">
            <span>UJI COBA TERBATAS</span>
            <span>•</span>
            <span>AGUSTUS 2026</span>
          </div>

          <DialogTitle className="font-display text-base sm:text-xl font-black tracking-tight text-ink-950 pt-0.5">
            Selamat Datang di Marketiv
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm font-semibold leading-relaxed text-text-primary max-w-lg mx-auto">
            Marketiv menghubungkan UMKM dengan kreator untuk membantu promosi produk.
          </DialogDescription>
        </DialogHeader>

        {/* Dual Role Grid (2 Columns on Desktop) */}
        <div className="mt-2.5 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {/* For UMKM */}
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 sm:p-3.5 flex items-start gap-2.5">
            <div className="h-6.5 w-6.5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5 border border-orange-200/60">
              <Store className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-extrabold text-ink-950 uppercase tracking-wide">
                Untuk Pemilik Usaha (UMKM)
              </span>
              <span className="block text-xs text-text-muted mt-0.5 leading-snug font-medium">
                Promosikan produk melalui kreator berdasarkan hasil tayangan.
              </span>
            </div>
          </div>

          {/* For Content Creator */}
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 sm:p-3.5 flex items-start gap-2.5">
            <div className="h-6.5 w-6.5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60">
              <Video className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-extrabold text-ink-950 uppercase tracking-wide">
                Untuk Kreator Konten
              </span>
              <span className="block text-xs text-text-muted mt-0.5 leading-snug font-medium">
                Temukan kampanye, buat konten, dan dapatkan bayaran.
              </span>
            </div>
          </div>
        </div>

        {/* Single Consolidated Beta & Sandbox Notice */}
        <div className="mt-2.5 rounded-xl border border-orange-200/80 bg-orange-50/60 p-2.5 sm:p-3 flex items-start gap-2.5 text-text-muted">
          <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-950 leading-relaxed font-medium">
            <strong className="font-extrabold text-orange-950">Versi uji coba:</strong> Beberapa fitur masih dapat berubah. Pembayaran saat ini menggunakan simulasi sandbox. Masukan Anda membantu kami menyempurnakan Marketiv.
          </div>
        </div>

        {/* Checkbox (UNCHECKED BY DEFAULT) & Action Button */}
        <div className="mt-3 sm:mt-3.5 space-y-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-text-muted cursor-pointer select-none">
            <div
              onClick={() => setDontShowAgain(!dontShowAgain)}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all cursor-pointer ${
                dontShowAgain
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-neutral-300 bg-white hover:border-neutral-400"
              }`}
            >
              {dontShowAgain && <Check size={11} strokeWidth={3} />}
            </div>
            <span className="text-xs text-text-secondary font-medium">
              Jangan tampilkan lagi selama masa uji coba
            </span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full min-h-[42px] rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs sm:text-sm font-extrabold shadow-[0_8px_20px_rgba(234,88,12,.25)] hover:shadow-[0_12px_28px_rgba(234,88,12,.32)] active:scale-[.98] transition-all cursor-pointer focus:outline-none focus:ring-0 outline-none"
          >
            Mulai Jelajahi Marketiv
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
