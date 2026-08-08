import Link from "next/link";
import { ArrowRight, Store, Video, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { routes } from "@/lib/constants/routes";

const ROLES = [
  {
    role: "umkm" as const,
    icon: Store,
    title: "Pemilik UMKM",
    tagline: "Buat campaign, cari kreator konten, dan kelola pesanan.",
    bullets: ["Buat campaign PPV & rate card", "Akses direktori kreator", "Kelola escrow & pembayaran"],
    gradient: "from-orange-400 to-orange-600 text-white shadow-orange-500/20",
    ring: "focus-visible:outline-orange-500/40",
    hover: "hover:border-orange-500/40 hover:shadow-soft-2",
    cta: "text-orange-600",
    bg: "from-orange-50/70 via-white to-white",
  },
  {
    role: "creator" as const,
    icon: Video,
    title: "Konten Kreator",
    tagline: "Ambil campaign, jual rate card, dan terima pembayaran.",
    bullets: ["Ambil campaign dari UMKM", "Buat & jual rate card paket", "Cairkan penghasilan kapan saja"],
    gradient: "from-violet-500 to-blue-600 text-white shadow-violet-500/20",
    ring: "focus-visible:outline-violet-500/40",
    hover: "hover:border-violet-500/40 hover:shadow-soft-2",
    cta: "text-violet-600",
    bg: "from-violet-50/70 via-white to-white",
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
      description="Pilih peranmu untuk melanjutkan ke dashboard."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href={routes.register} className="font-[800] text-orange-600 hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
      <div className="space-y-3.5">
        {ROLES.map(({ role, icon: IconComp, title, tagline, bullets, gradient, ring, hover, cta, bg }) => (
          <Link
            key={role}
            href={`${routes.login}?role=${role}`}
            className={`group block rounded-2xl border border-neutral-200/90 bg-gradient-to-br ${bg} p-4 transition-all duration-200 hover:-translate-y-0.5 ${hover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${ring}`}
          >
            <div className="flex items-start gap-3.5">
              {/* Icon */}
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient} shadow-md transition-transform group-hover:scale-105`}>
                <IconComp className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[0.95rem] font-[900] tracking-tight text-ink-900">
                    {title}
                  </span>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 ${cta} transition-transform duration-200 group-hover:translate-x-1`}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-0.5 text-[0.76rem] font-medium leading-snug text-ink-500">
                  {tagline}
                </p>

                {/* Bullets */}
                <ul className="mt-2.5 space-y-1">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink-600">
                      <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${role === "umkm" ? "text-orange-500" : "text-violet-500"}`} />
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
