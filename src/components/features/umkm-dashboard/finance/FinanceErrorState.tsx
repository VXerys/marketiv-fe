"use client";

import { AlertTriangle } from "lucide-react";

interface FinanceErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function FinanceErrorState({ message = "Gagal memuat data keuangan", onRetry }: FinanceErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center bg-gradient-to-b from-white to-red-50/30 border border-red-200/60 rounded-2xl sm:rounded-[22px] shadow-3xs max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-red-50 grid place-items-center border border-red-200/50 text-red-500 mb-4">
        <AlertTriangle size={26} />
      </div>

      <h3 className="font-display text-base font-black text-ink-950 tracking-tight">
        Terjadi Kesalahan
      </h3>
      <p className="text-[.82rem] text-ink-400 font-medium mt-1.5 max-w-sm leading-relaxed">
        {message}. Silakan periksa koneksi internet Anda atau coba muat ulang halaman.
      </p>

      <div className="mt-5">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-[800] text-[.82rem] shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-200 cursor-pointer border border-red-700/10"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
