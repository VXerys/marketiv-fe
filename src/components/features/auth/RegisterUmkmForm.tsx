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
import { ProfileProvisionNotice } from "./ProfileProvisionNotice";
import { EmailVerificationPending } from "./EmailVerificationPending";
import { registerUmkm, requestEmailVerification } from "@/services/auth/auth.service";
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
  const [provisionFailed, setProvisionFailed] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

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
    return <ProfileProvisionNotice role="umkm" message={provisionFailed} />;
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
      role="umkm"
      heroTitle="Gabung sebagai Pemilik UMKM"
      heroTagline="Reach yang lebih luas untuk bisnismu lewat kreator konten terpercaya."
      heroBullets={[
        { icon: "📣", text: "Buat campaign dengan budget fleksibel" },
        { icon: "🎯", text: "Temukan kreator yang tepat untuk nicemu" },
        { icon: "🔒", text: "Pembayaran aman via sistem escrow" },
      ]}
    >
      <div className="mx-auto w-full max-w-sm">
        {/* Radix UI Role Tabs Switcher */}
        <AuthRoleTabs activeRole="umkm" onRoleChange={handleRoleChange} />

        {/* Header */}
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-xl font-[900] leading-tight tracking-tight text-ink-900">
            Daftar sebagai Pemilik UMKM
          </h1>
          <p className="text-xs font-medium text-ink-500">
            Buat akun untuk mulai membuat campaign dan bekerja sama dengan kreator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {banner && <AuthErrorBanner message={banner} />}

          {/* Section: Info Usaha */}
          <div className="space-y-3.5">
            <p className="text-[0.68rem] font-[800] uppercase tracking-widest text-ink-400">
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
          <div className="border-t border-neutral-100" />

          {/* Section: Akun */}
          <div className="space-y-3.5">
            <p className="text-[0.68rem] font-[800] uppercase tracking-widest text-ink-400">
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
              hint="Dipakai untuk konfirmasi pesanan dan pencairan dana."
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
            className="min-h-[46px] w-full rounded-2xl bg-orange-500 px-6 text-sm font-[800] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
          >
            {pending ? "Mendaftarkan…" : "Daftar sebagai Pemilik UMKM"}
          </button>
        </form>

        <p className="mt-6 border-t border-neutral-200/60 pt-5 text-center text-xs font-semibold text-ink-500">
          Sudah punya akun?{" "}
          <Link
            href={routes.login}
            className="font-[800] text-orange-600 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}
