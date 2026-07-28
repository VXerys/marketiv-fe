"use client";

import { isGoogleOAuthEnabled, startGoogleOAuth } from "@/services/auth/auth.service";

/**
 * Tombol "Lanjutkan dengan Google".
 *
 * Mengembalikan null saat flag mati — provider belum dikonfigurasi di konsol
 * Appwrite (§A-3), dan tombol yang pasti error lebih buruk daripada tidak ada
 * tombol sama sekali.
 */
export function GoogleButton({
  next,
  disabled,
  label = "Lanjutkan dengan Google",
}: {
  next?: string;
  disabled?: boolean;
  label?: string;
}) {
  if (!isGoogleOAuthEnabled()) return null;

  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="text-[0.68rem] font-[800] uppercase tracking-[0.12em] text-ink-500">
          atau
        </span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => startGoogleOAuth(next)}
        className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-[800] text-ink-900 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-3xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.17-2 3.44-4.95 3.44-8.56Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.1 0 5.7-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.540-2.02-6.45-4.74H1.7v2.98A11.99 11.99 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.55 14.68a7.2 7.2 0 0 1 0-4.6V7.1H1.7a12 12 0 0 0 0 10.77l3.85-2.98Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.69 0 3.2.58 4.4 1.72l3.3-3.3C17.69 1.2 15.1 0 12 0 7.36 0 3.35 2.67 1.7 6.55l3.85 2.98C6.46 6.8 9 4.75 12 4.75Z"
          />
        </svg>
        {label}
      </button>
    </>
  );
}
