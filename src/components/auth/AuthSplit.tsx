"use client";

import { cn } from "@/lib/utils";

interface HeroBullet {
  icon: string;
  text: string;
}

interface AuthSplitProps {
  role: "umkm" | "creator";
  heroTitle: string;
  heroTagline: string;
  heroBullets?: readonly HeroBullet[];
  children: React.ReactNode;
  className?: string;
}

const ROLE_STYLES = {
  umkm: {
    gradient: "from-orange-500 via-orange-500 to-orange-700",
    overlay: "from-orange-600/30 to-transparent",
    accent: "bg-white/15",
    bullet: "bg-white/20",
  },
  creator: {
    gradient: "from-violet-600 via-violet-600 to-blue-700",
    overlay: "from-violet-700/30 to-transparent",
    accent: "bg-white/15",
    bullet: "bg-white/20",
  },
} as const;

/**
 * Split-screen auth layout.
 *
 * Desktop (≥ 860px): hero panel kiri (gradient role) + form panel kanan.
 * Mobile: hanya form, hero disembunyikan — sesuai Studio System v5.8 mobile-first rule.
 *
 * Digunakan oleh LoginForm dan RegisterForm yang role-spesifik, bukan oleh
 * halaman hub atau forgot/reset (yang tetap pakai centered card biasa).
 */
export function AuthSplit({
  role,
  heroTitle,
  heroTagline,
  heroBullets,
  children,
  className,
}: AuthSplitProps) {
  const s = ROLE_STYLES[role];

  return (
    <div
      className={cn(
        "w-full max-w-[900px]",
        "overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-soft-1",
        "flex flex-col md:flex-row",
        className
      )}
    >
      {/* Hero panel — hidden on mobile */}
      <div
        className={cn(
          "hidden md:flex md:w-[42%] md:flex-col md:justify-between",
          `bg-gradient-to-br ${s.gradient}`,
          "relative p-8 lg:p-10"
        )}
        aria-hidden="true"
      >
        {/* Subtle overlay texture */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${s.overlay}`} />

        {/* Logo mark */}
        <div className="relative z-10">
          <div className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg font-[900] text-white shadow-sm">
            M
          </div>
          <h2 className="font-display text-[1.45rem] font-[800] leading-tight tracking-tight text-white">
            {heroTitle}
          </h2>
          <p className="mt-2 text-[0.82rem] font-medium leading-relaxed text-white/80">
            {heroTagline}
          </p>
        </div>

        {/* Benefit bullets */}
        {heroBullets && heroBullets.length > 0 && (
          <ul className="relative z-10 mt-auto space-y-3 pt-8">
            {heroBullets.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm",
                    s.bullet
                  )}
                >
                  {b.icon}
                </span>
                <span className="text-[0.78rem] font-semibold leading-snug text-white/90">
                  {b.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Decorative circle */}
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 lg:p-10">
        {children}
      </div>
    </div>
  );
}
