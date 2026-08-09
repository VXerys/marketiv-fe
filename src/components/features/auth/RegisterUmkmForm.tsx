"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthSplit } from "@/components/auth/AuthSplit";
import { AuthRoleTabs, AuthRole } from "@/components/auth/AuthRoleTabs";
import {
  AuthField,
  AuthSelectField,
  PasswordField,
  AuthErrorBanner,
} from "@/components/auth/AuthField";
import { EmailVerificationPending } from "./EmailVerificationPending";
import { registerUmkm, requestEmailOtp } from "@/services/auth/auth.service";
import { registerUmkmSchema, PASSWORD_MIN } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes } from "@/lib/constants/routes";
import { NICHE_OPTIONS } from "@/components/features/umkm-dashboard/create-campaign/create-campaign.constants";

const CATEGORY_OPTIONS = NICHE_OPTIONS.map((o) => ({
  value: o.id,
  label: `${o.label} — ${o.desc}`,
}));

const EMPTY = {
  businessName: "",
  category: "",
  email: "",
  phone: "",
  password: "",
};

export function RegisterUmkmForm() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifyUserId, setVerifyUserId] = useState("");

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRoleChange = (newRole: AuthRole) => {
    if (newRole === "creator") {
      router.push(routes.registerWithRole("creator"), { scroll: false });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const parsed = parseOrErrors(registerUmkmSchema, form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setPending(true);

    const res = await registerUmkm(parsed.data);

    if (!res.success || !res.data) {
      setPending(false);
      setBanner(res.error ?? "Gagal mendaftar. Coba lagi.");
      return;
    }

    setVerifyUserId(res.data.user.userId);
    const otpRes = await requestEmailOtp({ userId: res.data.user.userId, email: form.email });
    if (!otpRes.success) {
      setPending(false);
      setBanner(otpRes.error ?? "Gagal mengirim kode verifikasi. Coba lagi.");
      return;
    }
    // JANGAN panggil refresh() di sini — AuthProvider.user harus tetap null
    // supaya RedirectIfAuthenticated tidak meng-unmount form sebelum layar OTP
    // sempat ditampilkan. refresh() dipanggil di onContinue setelah OTP sukses.
    setVerificationSent(true);
    setPending(false);
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
    <AuthSplit role="umkm">
      <div className="mx-auto w-full max-w-sm">
        {/* Radix UI Role Tabs Switcher */}
        <AuthRoleTabs activeRole="umkm" onRoleChange={handleRoleChange} />

        {/* Header */}
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-xl font-black leading-tight tracking-tight text-ink-950">
            Daftar sebagai Pemilik UMKM
          </h1>
          <p className="text-xs font-medium text-text-muted">
            Buat akun gratis dan mulai cari kreator untuk promosi bisnis Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {banner && <AuthErrorBanner message={banner} />}

          {/* Section: Info Usaha */}
          <div className="space-y-3.5">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-widest text-text-muted">
              Info Usaha
            </p>
            <AuthField
              label="Nama Usaha"
              name="businessName"
              autoComplete="organization"
              placeholder="Dapur Sehat Sukabumi"
              value={form.businessName}
              onChange={set("businessName")}
              error={errors.businessName}
              disabled={pending}
            />
            <AuthSelectField
              label="Kategori Usaha"
              name="category"
              placeholder="Pilih kategori…"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={set("category")}
              error={errors.category}
              disabled={pending}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-200/60" />

          {/* Section: Akun */}
          <div className="space-y-3.5">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-widest text-text-muted">
              Akun
            </p>
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
            <AuthField
              label="Nomor WhatsApp"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
              hint="Untuk konfirmasi pesanan dan info pembayaran Anda."
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
          </div>

          <button
            type="submit"
            disabled={pending}
            className="min-h-[46px] w-full rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? "Mendaftarkan…" : "Buat Akun UMKM"}
          </button>
        </form>

        <p className="mt-6 border-t border-neutral-200/60 pt-5 text-center text-xs font-semibold text-text-muted">
          Sudah punya akun?{" "}
          <Link
            href={routes.login}
            className="font-extrabold text-orange-600 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}
