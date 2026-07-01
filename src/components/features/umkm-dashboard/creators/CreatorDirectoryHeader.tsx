"use client";

import Link from "next/link";

export function CreatorDirectoryHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
          Direktori Kreator
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl font-medium">
          Temukan kreator mikro yang sesuai dengan kebutuhan promosi UMKM Anda.
        </p>
      </div>
      <Link
        href="/dashboard/umkm/negosiasi"
        className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white border border-border-subtle hover:border-primary/30 hover:bg-primary-50/10 text-xs font-bold text-text-primary shadow-xs hover:text-primary transition-all duration-200 flex items-center gap-2 select-none cursor-pointer"
      >
        <svg className="w-4 h-4 text-text-secondary hover:text-primary shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Lihat Negosiasi Aktif</span>
      </Link>
    </div>
  );
}
