"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField, PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import { GoogleButton } from "./GoogleButton";
import { login } from "@/services/auth/auth.service";
import { loginSchema } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes, dashboardByRole } from "@/lib/constants/routes";

export function LoginForm({ next }: { next?: string }) {
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
      // Bercabang di `code`, tidak pernah mem-parse teks pesan (R3).
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
            className="text-[0.74rem] font-[800] text-ink-500 hover:text-orange-600 hover:underline"
          >
            Lupa password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="min-h-[46px] w-full rounded-xl bg-orange-500 px-6 text-sm font-[800] text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
        >
          {pending ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <GoogleButton next={next} disabled={pending} />
    </AuthCard>
  );
}
