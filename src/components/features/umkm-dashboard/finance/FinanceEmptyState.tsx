"use client";

import { DashboardButton } from "../shared/DashboardButton";

interface FinanceEmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

export function FinanceEmptyState({ isFiltered = false, onResetFilters }: FinanceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/40 backdrop-blur-xs border border-neutral-200/40 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] max-w-lg mx-auto">
      {/* Icon Wrapper */}
      <div className="w-16 h-16 rounded-2xl bg-brand-coral/5 flex items-center justify-center border border-brand-coral/10 text-brand-coral mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007v.008H3.75V4.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3 13.5h.008v.008H3V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.75 3h.008v.008H3v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      </div>

      <h3 className="text-base font-extrabold text-text-primary tracking-tight">
        {isFiltered ? "Pencarian Tidak Ditemukan" : "Belum Ada Transaksi"}
      </h3>
      <p className="text-xs text-text-muted mt-1.5 max-w-sm leading-relaxed">
        {isFiltered
          ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian atau filter yang Anda gunakan saat ini."
          : "Akun Anda belum memiliki riwayat transaksi finansial, pembayaran escrow, atau platform fee."}
      </p>

      {isFiltered && onResetFilters && (
        <div className="mt-5">
          <DashboardButton variant="primary" size="sm" onClick={onResetFilters}>
            Atur Ulang Filter
          </DashboardButton>
        </div>
      )}
    </div>
  );
}
