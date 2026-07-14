"use client";

import { ReceiptText, X } from "lucide-react";

interface FinanceEmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

export function FinanceEmptyState({ isFiltered = false, onResetFilters }: FinanceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center bg-gradient-to-b from-white to-neutral-50/40 border border-neutral-200/80 rounded-2xl sm:rounded-[22px] shadow-3xs max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 grid place-items-center border border-orange-200/60 text-orange-500 mb-4">
        <ReceiptText size={26} />
      </div>

      <h3 className="font-display text-base font-black text-ink-950 tracking-tight">
        {isFiltered ? "Pencarian Tidak Ditemukan" : "Belum Ada Transaksi"}
      </h3>
      <p className="text-[.82rem] text-ink-400 font-medium mt-1.5 max-w-sm leading-relaxed">
        {isFiltered
          ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian atau filter yang Anda gunakan saat ini."
          : "Akun Anda belum memiliki riwayat transaksi finansial, pembayaran escrow, atau platform fee."}
      </p>

      {isFiltered && onResetFilters && (
        <div className="mt-5">
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-5 rounded-xl border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white font-[800] text-[.82rem] shadow-[0_10px_24px_rgba(234,88,12,.22)] hover:shadow-[0_14px_30px_rgba(234,88,12,.30)] hover:-translate-y-px transition-all duration-200 cursor-pointer"
          >
            <X size={14} />
            Atur Ulang Filter
          </button>
        </div>
      )}
    </div>
  );
}
