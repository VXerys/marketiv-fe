import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/constants/routes";

const ROLES = [
  {
    role: "umkm" as const,
    emoji: "🏪",
    title: "Pemilik UMKM",
    tagline: "Kelola bisnis & temukan kreator konten",
    bullets: [
      "Buat campaign PPV dengan anggaran fleksibel",
      "Akses direktori ratusan kreator terverifikasi",
      "Pembayaran aman via sistem escrow",
      "Pantau performa konten secara real-time",
    ],
    gradient: "from-orange-400 to-orange-600",
    cardGradient: "from-orange-50/80 to-white",
    border: "border-orange-200/60 hover:border-orange-400/50",
    iconBg: "from-orange-400 to-orange-600",
    ctaClass:
      "bg-orange-500 hover:bg-orange-600 focus-visible:outline-orange-500/40",
    linkClass: "focus-visible:outline-orange-500/40",
    dot: "bg-orange-400",
    badge: "bg-orange-50 text-orange-700 border-orange-200/60",
    badgeLabel: "Untuk Bisnis",
  },
  {
    role: "creator" as const,
    emoji: "🎬",
    title: "Konten Kreator",
    tagline: "Monetisasi konten & terima pembayaran",
    bullets: [
      "Ambil campaign dari ribuan UMKM aktif",
      "Buat & jual rate card paket kontenmu",
      "Terima pembayaran langsung ke saldo",
      "Cairkan penghasilan kapan saja, tanpa minimum tinggi",
    ],
    gradient: "from-violet-500 to-blue-600",
    cardGradient: "from-violet-50/80 to-white",
    border: "border-violet-200/50 hover:border-violet-400/50",
    iconBg: "from-violet-500 to-blue-600",
    ctaClass:
      "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 focus-visible:outline-violet-500/40",
    linkClass: "focus-visible:outline-violet-500/40",
    dot: "bg-violet-400",
    badge: "bg-violet-50 text-violet-700 border-violet-200/50",
    badgeLabel: "Untuk Kreator",
  },
] as const;

/**
 * Halaman pilih peran di /register (tanpa ?role=).
 * Layout mandiri — tidak pakai AuthCard supaya bisa lebih lebar (max-w-2xl).
 */
export function RoleChooser() {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center px-2">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-[1.55rem] font-[900] leading-tight tracking-tight text-ink-900">
          Daftar sebagai apa?
        </h1>
        <p className="mt-2 text-[0.85rem] font-medium leading-relaxed text-ink-500">
          Pilih peranmu di Marketiv. Ini menentukan dashboard dan fitur yang kamu dapat.
        </p>
      </div>

      {/* Role cards grid */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLES.map(
          ({
            role,
            emoji,
            title,
            tagline,
            bullets,
            cardGradient,
            border,
            iconBg,
            ctaClass,
            linkClass,
            dot,
            badge,
            badgeLabel,
          }) => (
            <div
              key={role}
              className={`flex flex-col rounded-3xl border bg-gradient-to-b ${cardGradient} ${border} p-6 shadow-soft-1 transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-2`}
            >
              {/* Card header */}
              <div className="mb-5">
                <div className="mb-4 flex items-start justify-between">
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${iconBg} text-2xl shadow-sm`}
                  >
                    {emoji}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[0.65rem] font-[800] ${badge}`}>
                    {badgeLabel}
                  </span>
                </div>
                <h2 className="font-display text-[1.15rem] font-[900] tracking-tight text-ink-900">
                  {title}
                </h2>
                <p className="mt-1 text-[0.78rem] font-medium leading-snug text-ink-500">
                  {tagline}
                </p>
              </div>

              {/* Benefits */}
              <ul className="mb-6 flex-1 space-y-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                    <span className="text-[0.76rem] font-semibold leading-snug text-ink-700">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={routes.registerWithRole(role)}
                className={`flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[15px] px-5 text-sm font-[800] text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 ${ctaClass} ${linkClass}`}
              >
                Mulai daftar sebagai {title}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[0.78rem] font-semibold text-ink-500">
        Sudah punya akun?{" "}
        <Link href={routes.login} className="font-[800] text-orange-600 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
