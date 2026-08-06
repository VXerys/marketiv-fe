"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { AuthField, PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import { GoogleButton } from "./GoogleButton";
import { ProfileProvisionNotice } from "./ProfileProvisionNotice";
import { EmailVerificationPending } from "./EmailVerificationPending";
import { registerCreator, requestEmailVerification } from "@/services/auth/auth.service";
import { registerCreatorSchema, PASSWORD_MIN } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes } from "@/lib/constants/routes";

const EMPTY = { displayName: "", email: "", password: "" };

export function RegisterCreatorForm() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [provisionFailed, setProvisionFailed] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

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

    await requestEmailVerification();
    await refresh();
    setVerificationSent(true);
    setPending(false);
  }

  if (provisionFailed) {
    return <ProfileProvisionNotice role="creator" message={provisionFailed} />;
  }

  if (verificationSent) {
    return (
      <EmailVerificationPending
        email={form.email}
        onContinue={() => router.replace(routes.onboarding)}
      />
    );
  }

  return (
    <AuthSplit
      role="creator"
      heroTitle="Gabung sebagai Kreator"
      heroTagline="Monetisasi kontenmu dan raih penghasilan dari UMKM yang butuh kreator sepertimu."
      heroBullets={[
        { icon: "🎯", text: "Ambil campaign PPV dari UMKM aktif" },
        { icon: "💼", text: "Buat & jual rate card paket konten" },
        { icon: "💸", text: "Cairkan penghasilan kapan saja" },
      ]}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-[1.25rem] font-[900] leading-tight tracking-tight text-ink-900">
            Daftar sebagai Kreator
          </h1>
          <p className="text-[0.82rem] font-medium text-ink-500">
            Buat akun untuk mengambil campaign dan menjual rate card kamu.
          </p>
        </div>

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
            className="min-h-[46px] w-full rounded-[15px] bg-gradient-to-r from-violet-600 to-blue-600 px-6 text-sm font-[800] text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
          >
            {pending ? "Mendaftarkan…" : "Daftar sebagai Kreator"}
          </button>
        </form>

        <GoogleButton disabled={pending} label="Daftar dengan Google" role="creator" />

        <p className="mt-5 border-t border-neutral-200/60 pt-5 text-center text-[0.78rem] font-semibold text-ink-500">
          Sudah punya akun?{" "}
          <Link href={routes.login} className="font-[800] text-orange-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}
