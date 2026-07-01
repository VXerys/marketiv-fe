"use client";

export function CollabPostWarningBanner() {
  return (
    <div className="rounded-2xl border border-warning-soft bg-warning-soft/15 p-4 flex gap-3 items-start select-none">
      <span className="h-5 w-5 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0 text-xs font-bold shadow-3xs" aria-hidden="true">
        !
      </span>
      <div className="min-w-0">
        <h4 className="text-[10px] sm:text-xs font-extrabold text-warning-strong uppercase tracking-wider leading-none">
          Ketentuan Publikasi Kolaborasi
        </h4>
        <p className="text-[10px] sm:text-xs text-text-secondary mt-1.5 leading-relaxed font-semibold">
          <strong>PENTING:</strong> Kreator wajib menggunakan fitur <strong>Collab Post</strong> Instagram/TikTok saat publikasi agar traffic, views, dan engagement masuk ke akun UMKM Anda secara langsung.
        </p>
      </div>
    </div>
  );
}
