"use client";

export function CollabPostWarningBanner() {
  return (
    <div className="rounded-2xl border border-warning-soft bg-gradient-to-r from-warning-soft/20 to-orange-50/40 p-4 flex gap-3 items-start select-none shadow-2xs">
      <div className="h-7 w-7 rounded-xl bg-warning/15 border border-warning/20 text-warning flex items-center justify-center shrink-0 shadow-3xs" aria-hidden="true">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="min-w-0 space-y-0.5">
        <h4 className="text-[10px] sm:text-xs font-extrabold text-warning-strong uppercase tracking-wider leading-none">
          Ketentuan Publikasi Kolaborasi
        </h4>
        <p className="text-[10px] sm:text-xs text-text-secondary mt-1 leading-relaxed font-semibold">
          <strong>PENTING:</strong> Kreator wajib menggunakan fitur{" "}
          <strong className="text-warning-strong">Collab Post</strong> Instagram/TikTok saat publikasi agar traffic, views, dan engagement masuk ke akun UMKM Anda secara langsung.
        </p>
      </div>
    </div>
  );
}
