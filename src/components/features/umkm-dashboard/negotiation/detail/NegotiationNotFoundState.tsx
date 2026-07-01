"use client";

import Link from "next/link";

export function NegotiationNotFoundState() {
  return (
    <div className="rounded-3xl border border-border-soft bg-white/40 p-12 text-center max-w-xl mx-auto my-12 space-y-4">
      <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-text-muted">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-text-primary">Negosiasi Tidak Ditemukan</h3>
        <p className="text-xs text-text-secondary max-w-sm mx-auto font-medium">
          Maaf, data negosiasi yang Anda cari tidak dapat ditemukan. Kemungkinan tautan sudah kadaluarsa atau ID tidak valid.
        </p>
      </div>
      <Link
        href="/dashboard/umkm/negosiasi"
        className="inline-block px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer select-none border border-primary hover:border-primary-600 shadow-xs"
      >
        Kembali ke Daftar Negosiasi
      </Link>
    </div>
  );
}
