"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField, PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import { GoogleButton } from "./GoogleButton";
import { ProfileProvisionNotice } from "./ProfileProvisionNotice";
import { registerCreator } from "@/services/auth/auth.service";
import { registerCreatorSchema, PASSWORD_MIN } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes } from "@/lib/constants/routes";

/**
 * Kreator TIDAK diminta nomor HP saat register — itu aturan bisnis
 * (30_Business_Rules.md), bukan penyederhanaan form.
 */
const EMPTY = { displayName: "", email: "", password: "" };

export function RegisterCreatorForm() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [provisionFailed, setProvisionFailed] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const parsed = parseOrErrors(registerCreatorSchema, form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setPending(true);

    const res = await registerCreator(parsed.data);

    if (!res.success || !res.data) {
      setPending(false);
      setBanner(res.error ?? "Gagal mendaftar. Coba lagi.");
      return;
    }

    if (!res.data.profileProvisioned) {
      setPending(false);
      setProvisionFailed(
        "Pembuatan profil otomatis belum aktif di server. Akun kamu sudah tersimpan."
      );
      return;
    }

    await refresh();
    // Langsung ke wizard, bukan ke dashboard: akun baru selalu punya
    // isProfileCompleted=false, jadi RoleGuard akan memantulkannya ke sini juga —
    // lewat dashboard dulu cuma menampilkan skeleton yang langsung hilang.
    router.replace(routes.onboarding);
  }

  if (provisionFailed) {
    return <ProfileProvisionNotice role="creator" message={provisionFailed} />;
  }

  return (
    <AuthCard
      title="Daftar sebagai Kreator"
      description="Buat akun untuk mengambil campaign dan menjual rate card kamu."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href={routes.login} className="font-[800] text-orange-600 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {banner && <AuthErrorBanner message={banner} />}

        <AuthField
          label="Nama Lengkap"
          name="displayName"
          autoComplete="name"
          placeholder="Nadia Visuals"
          value={form.displayName}
          onChange={set("displayName")}
          error={errors.displayName}
          disabled={pending}
        />

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
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint={`Minimal ${PASSWORD_MIN} karakter.`}
          disabled={pending}
        />

        <button
          type="submit"
          disabled={pending}
          className="min-h-[46px] w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-sm font-[800] text-white transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
        >
          {pending ? "Mendaftarkan…" : "Daftar sebagai Kreator"}
        </button>
      </form>

      <GoogleButton disabled={pending} label="Daftar dengan Google" />
    </AuthCard>
  );
}
