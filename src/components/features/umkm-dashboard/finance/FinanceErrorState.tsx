"use client";

import { DashboardButton } from "../shared/DashboardButton";

interface FinanceErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function FinanceErrorState({ message = "Gagal memuat data keuangan", onRetry }: FinanceErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-danger-soft/10 border border-danger-soft/20 rounded-2xl max-w-lg mx-auto">
      {/* Icon Wrapper */}
      <div className="w-16 h-16 rounded-2xl bg-danger-soft/10 flex items-center justify-center border border-danger-soft/30 text-danger mb-4 animate-bounce">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h3 className="text-base font-extrabold text-text-primary tracking-tight"> terjadi Kesalahan</h3>
      <p className="text-xs text-text-muted mt-1.5 max-w-sm leading-relaxed">
        {message}. Silakan periksa koneksi internet Anda atau coba muat ulang halaman.
      </p>

      <div className="mt-5">
        <DashboardButton variant="danger" size="sm" onClick={onRetry}>
          Coba Lagi
        </DashboardButton>
      </div>
    </div>
  );
}
