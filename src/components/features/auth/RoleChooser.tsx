import Link from "next/link";
import { Store, Video } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { routes } from "@/lib/constants/routes";

const CHOICES = [
  {
    role: "umkm" as const,
    icon: Store,
    title: "Saya Pemilik UMKM",
    desc: "Buat campaign, cari kreator, dan kelola pesanan konten.",
    accent: "from-orange-400 to-orange-600",
  },
  {
    role: "creator" as const,
    icon: Video,
    title: "Saya Konten Kreator",
    desc: "Ambil campaign, jual rate card, dan terima pembayaran.",
    accent: "from-blue-500 to-violet-600",
  },
];

/**
 * Ditampilkan saat /register dibuka tanpa `?role=` yang valid.
 *
 * Role sengaja tidak ditebak: field register dan profil yang dibentuk berbeda
 * per role, dan salah tebak berarti akun dengan profil yang salah.
 */
export function RoleChooser() {
  return (
    <AuthCard
      title="Daftar sebagai apa?"
      description="Pilih peran kamu di Marketiv. Ini menentukan dashboard dan fitur yang kamu dapat."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href={routes.login} className="font-[800] text-orange-600 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        {CHOICES.map(({ role, icon: Icon, title, desc, accent }) => (
          <Link
            key={role}
            href={routes.registerWithRole(role)}
            className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-orange-500/25 hover:shadow-3xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40"
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}
            >
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.9rem] font-[900] tracking-tight text-ink-900">
                {title}
              </span>
              <span className="mt-0.5 block text-[0.76rem] font-medium leading-relaxed text-ink-500">
                {desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </AuthCard>
  );
}
