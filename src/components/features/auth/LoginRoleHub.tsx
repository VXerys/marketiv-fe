import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { routes } from "@/lib/constants/routes";

const ROLES = [
  {
    role: "umkm" as const,
    emoji: "🏪",
    title: "Pemilik UMKM",
    tagline: "Buat campaign, cari kreator konten, dan kelola pesanan.",
    bullets: ["Buat campaign PPV & rate card", "Akses direktori kreator", "Kelola escrow & pembayaran"],
    gradient: "from-orange-400 to-orange-600",
    ring: "focus-visible:outline-orange-500/40",
    hover: "hover:border-orange-500/30 hover:shadow-[0_8px_24px_rgba(249,115,22,.12)]",
    cta: "text-orange-600",
    bg: "from-orange-50/60",
  },
  {
    role: "creator" as const,
    emoji: "🎬",
    title: "Konten Kreator",
    tagline: "Ambil campaign, jual rate card, dan terima pembayaran.",
    bullets: ["Ambil campaign dari UMKM", "Buat & jual rate card paket", "Cairkan penghasilan kapan saja"],
    gradient: "from-violet-500 to-blue-600",
    ring: "focus-visible:outline-violet-500/40",
    hover: "hover:border-violet-500/25 hover:shadow-[0_8px_24px_rgba(124,58,237,.10)]",
    cta: "text-violet-600",
    bg: "from-violet-50/60",
  },
] as const;

/**
 * Halaman hub pilih peran sebelum form login.
 * Ditampilkan saat /login dibuka tanpa ?role= yang valid.
 */
export function LoginRoleHub() {
  return (
    <AuthCard
      title="Masuk ke Marketiv"
      description="Pilih peranmu untuk melanjutkan."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href={routes.register} className="font-[800] text-orange-600 hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        {ROLES.map(({ role, emoji, title, tagline, bullets, gradient, ring, hover, cta, bg }) => (
          <Link
            key={role}
            href={`${routes.login}?role=${role}`}
            className={`group block rounded-2xl border border-neutral-200/80 bg-gradient-to-br ${bg} to-white p-4 transition-all duration-200 hover:-translate-y-0.5 ${hover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${ring}`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-xl shadow-sm`}>
                {emoji}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[0.95rem] font-[800] tracking-tight text-ink-900">
                    {title}
                  </span>
                  <ArrowRight
                    size={15}
                    className={`shrink-0 ${cta} transition-transform duration-200 group-hover:translate-x-0.5`}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-0.5 text-[0.75rem] font-medium leading-snug text-ink-500">
                  {tagline}
                </p>

                {/* Bullets */}
                <ul className="mt-2.5 space-y-1">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink-600">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${role === "umkm" ? "bg-orange-400" : "bg-violet-400"}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AuthCard>
  );
}
