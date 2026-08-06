"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { AuthRoleTabs, AuthRole } from "@/components/auth/AuthRoleTabs";
import { AuthField, PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import { GoogleButton } from "./GoogleButton";
import { login } from "@/services/auth/auth.service";
import { loginSchema } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes, dashboardByRole } from "@/lib/constants/routes";

const ROLE_CONFIG = {
  umkm: {
    heroTitle: "Selamat Datang di Marketiv",
    heroTagline: "Kelola promosi usaha, temukan kreator handal, dan pantau hasil penayangan produkmu.",
    heroBullets: [
      { icon: "📣", text: "Promosi produk via video kreator pilihan" },
      { icon: "🤝", text: "Pencocokan sesuai kategori usahamu" },
      { icon: "💰", text: "Sistem garansi pembayaran aman & terukur" },
    ],
    title: "Masuk sebagai Pemilik UMKM",
    description: "Lanjutkan ke dashboard bisnis kamu.",
    btnClass: "bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)]",
    registerHref: routes.registerWithRole("umkm"),
  },
  creator: {
    heroTitle: "Selamat Datang di Marketiv",
    heroTagline: "Temukan kampanye UMKM, buat konten kreatif, dan dapatkan bayaran resmi.",
    heroBullets: [
      { icon: "🎬", text: "Terima pekerjaan promosi video dari UMKM" },
      { icon: "💼", text: "Tawarkan paket rate card kreator kamu" },
      { icon: "💸", text: "Pencairan penghasilan cepat & transparan" },
    ],
    title: "Masuk sebagai Konten Kreator",
    description: "Lanjutkan ke dashboard kreatormu.",
    btnClass: "bg-gradient-to-b from-violet-600 to-blue-600 text-white shadow-[0_10px_28px_rgba(124,58,237,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(124,58,237,.36)]",
    registerHref: routes.registerWithRole("creator"),
  },
} as const satisfies Record<AuthRole, object>;

interface LoginFormProps {
  next?: string;
  role?: AuthRole;
}

export function LoginForm({ next, role: initialRole = "umkm" }: LoginFormProps) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [activeRole, setActiveRole] = useState<AuthRole>(initialRole);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [suspended, setSuspended] = useState(false);
  const [pending, setPending] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRoleChange = (newRole: AuthRole) => {
    setActiveRole(newRole);
    const query = new URLSearchParams();
    if (next) query.set("next", next);
    query.set("role", newRole);
    router.push(`${routes.login}?${query.toString()}`, { scroll: false });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    setSuspended(false);

    const parsed = parseOrErrors(loginSchema, form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setPending(true);

    const res = await login(parsed.data);

    if (!res.success || !res.data) {
      setPending(false);
      if (res.code === "forbidden") setSuspended(true);
      else setBanner(res.error ?? "Gagal masuk. Coba lagi.");
      return;
    }

    await refresh();
    router.replace(next || dashboardByRole[res.data.role]);
  }

  if (suspended) {
    return (
      <AuthCard
        title="Akun Ditangguhkan"
        description="Akun ini sedang ditangguhkan sehingga tidak bisa masuk. Hubungi admin Marketiv untuk proses peninjauan."
        footer={
          <button
            onClick={() => setSuspended(false)}
            className="font-extrabold text-orange-600 hover:underline"
          >
            Coba akun lain
          </button>
        }
      >
        <div className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          Sesi sudah diakhiri otomatis demi keamanan.
        </div>
      </AuthCard>
    );
  }

  const cfg = ROLE_CONFIG[activeRole];

  return (
    <AuthSplit
      role={activeRole}
      heroTitle={cfg.heroTitle}
      heroTagline={cfg.heroTagline}
      heroBullets={cfg.heroBullets}
    >
      <div className="mx-auto w-full max-w-sm">
        {/* Radix UI Role Tabs Switcher */}
        <AuthRoleTabs activeRole={activeRole} onRoleChange={handleRoleChange} />

        <div className="mb-6 space-y-1">
          <h1 className="font-display text-xl font-black leading-tight tracking-tight text-ink-950">
            {cfg.title}
          </h1>
          <p className="text-xs font-medium text-text-muted">{cfg.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {banner && <AuthErrorBanner message={banner} />}

          <AuthField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            disabled={pending}
          />

          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            disabled={pending}
          />

          <div className="flex justify-end">
            <Link
              href={routes.forgotPassword}
              className="text-xs font-extrabold text-text-muted transition-colors hover:text-orange-600 hover:underline"
            >
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`min-h-[46px] w-full rounded-full border-0 px-6 text-xs sm:text-sm font-extrabold hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-60 ${cfg.btnClass}`}
          >
            {pending ? "Memproses…" : `Masuk ${activeRole === "umkm" ? "UMKM" : "Kreator"}`}
          </button>
        </form>

        <GoogleButton next={next} disabled={pending} role={activeRole} />

        <p className="mt-6 border-t border-neutral-200/60 pt-5 text-center text-xs font-semibold text-text-muted">
          Belum punya akun?{" "}
          <Link href={cfg.registerHref} className="font-extrabold text-orange-600 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}
