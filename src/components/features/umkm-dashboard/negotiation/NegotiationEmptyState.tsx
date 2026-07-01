"use client";

import Link from "next/link";

interface NegotiationEmptyStateProps {
  onReset?: () => void;
  isFiltered?: boolean;
}

export function NegotiationEmptyState({ onReset, isFiltered = false }: NegotiationEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="rounded-3xl border border-dashed border-border-strong/60 bg-white/40 p-12 text-center max-w-xl mx-auto my-8 space-y-4 shadow-2xs">
        <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-text-muted">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-text-primary">Negosiasi Tidak Ditemukan</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto font-medium">
            Tidak ada percakapan negosiasi yang cocok dengan kata kunci atau filter status Anda.
          </p>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-colors cursor-pointer select-none border border-primary hover:border-primary-600 shadow-xs"
          >
            Reset Filter & Pencarian
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-border-strong/60 bg-white/40 p-12 text-center max-w-xl mx-auto my-8 space-y-4 shadow-2xs">
      <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-text-muted">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-text-primary">Belum Ada Percakapan Negosiasi</h3>
        <p className="text-xs text-text-secondary max-w-sm mx-auto font-medium">
          Mulai negosiasi kolaborasi Rate Card dengan memilih kreator mikro di direktori.
        </p>
      </div>
      <Link
        href="/dashboard/umkm/kreator"
        className="inline-block px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-colors cursor-pointer select-none border border-primary hover:border-primary-600 shadow-xs"
      >
        Temukan Kreator
      </Link>
    </div>
  );
}
