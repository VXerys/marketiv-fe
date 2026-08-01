import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Bingkai kartu halaman auth. Radius 26px + shadow lembut, sesuai skala kartu
 * Studio System v5.8 — sama dengan kartu pengaturan dashboard.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-3xs sm:p-8",
        className
      )}
    >
      <div className="mb-6 space-y-1.5">
        <h1 className="font-[var(--font-sora)] text-[1.35rem] font-[900] leading-tight tracking-tight text-ink-900">
          {title}
        </h1>
        {description && (
          <p className="text-[0.82rem] font-medium leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>

      {children}

      {footer && (
        <div className="mt-6 border-t border-neutral-200/60 pt-5 text-center text-[0.78rem] font-semibold text-ink-500">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Wordmark di atas kartu — tautan balik ke beranda. */
export function AuthBrand() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-2 rounded-xl px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/40"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-[900] text-white shadow-sm">
        M
      </span>
      <span className="text-[1.05rem] font-[900] tracking-tight text-ink-900">
        Marketiv
      </span>
    </Link>
  );
}
