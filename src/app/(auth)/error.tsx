"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Auth page error:", error);
  }, [error]);

  return (
    <div className="w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white p-6 text-center shadow-3xs sm:p-8">
      <h1 className="mb-2 text-[1.15rem] font-[900] tracking-tight text-ink-900">
        Halaman gagal dimuat
      </h1>
      <p className="mb-6 text-[0.82rem] font-medium leading-relaxed text-ink-500">
        Ada gangguan saat menyiapkan halaman ini. Koneksi ke server mungkin
        terputus sesaat. Coba muat ulang — data kamu tidak terpengaruh.
      </p>
      <button
        onClick={reset}
        className="min-h-[44px] w-full rounded-xl bg-orange-500 px-6 text-sm font-[800] text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 active:translate-y-0"
      >
        Coba Lagi
      </button>
    </div>
  );
}
