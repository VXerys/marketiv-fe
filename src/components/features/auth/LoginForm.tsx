"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { AuthField, PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import { GoogleButton } from "./GoogleButton";
import { login } from "@/services/auth/auth.service";
import { loginSchema } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes, dashboardByRole } from "@/lib/constants/routes";

type Role = "umkm" | "creator";

const ROLE_CONFIG = {
  umkm: {
    heroTitle: "Selamat datang kembali",
    heroTagline: "Kelola campaign, cari kreator, dan pantau performa kontenmu.",
    heroBullets: [
      { icon: "📣", text: "Buat & kelola campaign konten" },
      { icon: "🤝", text: "Kolaborasi dengan kreator pilihan" },
      { icon: "💰", text: "Pembayaran aman via escrow" },
    ],
    title: "Masuk sebagai UMKM",
    description: "Lanjutkan ke dashboard bisnis kamu.",
    btnClass: "bg-orange-500 hover:bg-orange-600 focus-visible:outline-orange-500/40",
    registerHref: routes.registerWithRole("umkm"),
  },
  creator: {
    heroTitle: "Selamat datang kembali",
    heroTagline: "Ambil campaign, monetisasi konten, dan terima pembayaran dengan mudah.",
    heroBullets: [
      { icon: "🎬", text: "Ambil campaign PPV dari UMKM" },
      { icon: "💼", text: "Jual rate card paketmu" },
      { icon: "💸", text: "Cairkan penghasilan kapan saja" },
    ],
    title: "Masuk sebagai Kreator",
    description: "Lanjutkan ke dashboard kreatormu.",
    btnClass:
      "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 focus-visible:outline-violet-500/40",
    registerHref: routes.registerWithRole("creator"),
  },
} as const satisfies Record<Role, object>;

interface LoginFormProps {
  next?: string;
  role?: Role;
}

export function LoginForm({ next, role }: LoginFormProps) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [suspended, setSuspended] = useState(false);
  const [pending, setPending] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
            className="font-[800] text-orange-600 hover:underline"
          >
            Coba akun lain
          </button>
        }
      >
        <div className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-3 text-[0.78rem] font-semibold text-red-700">
          Sesi sudah diakhiri otomatis demi keamanan.
        </div>
      </AuthCard>
    );
  }

  const cfg = role ? ROLE_CONFIG[role] : null;

  const btnClass = cfg?.btnClass ?? "bg-orange-500 hover:bg-orange-600 focus-visible:outline-orange-500/40";
  const registerHref = cfg?.registerHref ?? routes.register;

  const fields = (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {banner && <AuthErrorBanner message={banner} />}

      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="nama@usaha.id"
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
          className="text-[0.74rem] font-[800] text-ink-500 transition-colors hover:text-orange-600 hover:underline"
        >
          Lupa password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`min-h-[46px] w-full rounded-[15px] px-6 text-sm font-[800] text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0 ${btnClass}`}
      >
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );

  // Role-specific: split-screen layout
  if (role && cfg) {
    return (
      <AuthSplit
        role={role}
        heroTitle={cfg.heroTitle}
        heroTagline={cfg.heroTagline}
        heroBullets={cfg.heroBullets}
      >
        <div className="w-full max-w-sm">
          <div className="mb-6 space-y-1">
            <h1 className="font-display text-[1.25rem] font-[900] leading-tight tracking-tight text-ink-900">
              {cfg.title}
            </h1>
            <p className="text-[0.82rem] font-medium text-ink-500">{cfg.description}</p>
          </div>

          {fields}

          <GoogleButton next={next} disabled={pending} role={role} />

          <p className="mt-5 border-t border-neutral-200/60 pt-5 text-center text-[0.78rem] font-semibold text-ink-500">
            Belum punya akun?{" "}
            <Link href={registerHref} className="font-[800] text-orange-600 hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </AuthSplit>
    );
  }

  // Fallback centered card (seharusnya tidak terjadi — hub mencegat sebelumnya)
  return (
    <AuthCard
      title="Masuk ke Marketiv"
      description="Lanjutkan ke dashboard UMKM atau Kreator kamu."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href={routes.register} className="font-[800] text-orange-600 hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
      {fields}
      <GoogleButton next={next} disabled={pending} />
    </AuthCard>
  );
}
