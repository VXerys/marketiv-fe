"use client";

import Link from "next/link";

export function NegotiationHeader() {
  return (
    <div className="space-y-4 mb-6">
      {/* Breadcrumbs */}
      <nav className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
        <Link href="/dashboard/umkm" className="hover:text-primary transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-text-secondary">Negosiasi</span>
      </nav>

      {/* Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
            Negosiasi Rate Card
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl font-medium">
            Kelola percakapan, penawaran, dan pembayaran escrow untuk kerja sama kreator pilihan Anda.
          </p>
        </div>
        
        <Link
          href="/dashboard/umkm/kreator"
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-primary hover:border-primary-600 flex items-center gap-2 select-none"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Cari Kreator Baru</span>
        </Link>
      </div>
    </div>
  );
}
