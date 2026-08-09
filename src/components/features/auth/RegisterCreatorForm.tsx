"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { AuthRoleTabs, AuthRole } from "@/components/auth/AuthRoleTabs";
import { AuthField, PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import { GoogleButton } from "./GoogleButton";
import { ProfileProvisionNotice } from "./ProfileProvisionNotice";
import { EmailVerificationPending } from "./EmailVerificationPending";
import { registerCreator, requestEmailOtp } from "@/services/auth/auth.service";
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
  const [verifyUserId, setVerifyUserId] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRoleChange = (newRole: AuthRole) => {
    if (newRole === "umkm") {
      router.push(routes.registerWithRole("umkm"), { scroll: false });
    }
  };

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

    setVerifyUserId(res.data.user.userId);
    await requestEmailOtp({ userId: res.data.user.userId, email: form.email });
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
        userId={verifyUserId}
        password={form.password}
        onContinue={async () => {
          await refresh();
          router.replace(routes.onboarding);
        }}
      />
    );
  }

  return (
    <AuthSplit
      role="creator"
    >
      <div className="mx-auto w-full max-w-sm">
        {/* Radix UI Role Tabs Switcher */}
        <AuthRoleTabs activeRole="creator" onRoleChange={handleRoleChange} />

        {/* Header */}
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-xl font-black leading-tight tracking-tight text-ink-950">
            Daftar sebagai Konten Kreator
          </h1>
          <p className="text-xs font-medium text-text-muted">
            Buat akun gratis dan mulai terima campaign dari UMKM hari ini.
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
            className="min-h-[46px] w-full rounded-full border-0 bg-gradient-to-b from-violet-600 to-blue-600 px-6 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(124,58,237,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(124,58,237,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? "Mendaftarkan…" : "Buat Akun Kreator"}
          </button>
        </form>

        <GoogleButton disabled={pending} label="Daftar dengan Google" role="creator" />

        <p className="mt-6 border-t border-neutral-200/60 pt-5 text-center text-xs font-semibold text-text-muted">
          Sudah punya akun?{" "}
          <Link href={routes.login} className="font-extrabold text-orange-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}
