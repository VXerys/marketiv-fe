"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";
import {
  AuthField,
  AuthSelectField,
  PasswordField,
  AuthErrorBanner,
} from "@/components/auth/AuthField";
import { GoogleButton } from "./GoogleButton";
import { ProfileProvisionNotice } from "./ProfileProvisionNotice";
import { registerUmkm } from "@/services/auth/auth.service";
import { registerUmkmSchema, PASSWORD_MIN } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes } from "@/lib/constants/routes";
import { NICHE_OPTIONS } from "@/components/features/umkm-dashboard/create-campaign/create-campaign.constants";

/**
 * Field mengikuti 30_Business_Rules.md: Nama Usaha, Kategori, Email,
 * Nomor HP (WAJIB untuk UMKM), Password.
 *
 * Kategori memakai NICHE_OPTIONS — daftar yang sama dengan halaman pengaturan
 * dan wizard campaign, supaya nilainya cocok dengan campaigns.category.
 */
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

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

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

    // Akun sudah ada dan sesi hidup, hanya profilnya yang belum. JANGAN redirect
    // ke dashboard — RoleGuard akan memantulkannya balik ke sini (§A-1).
    if (!res.data.profileProvisioned) {
      setPending(false);
      setProvisionFailed(
        "Pembuatan profil otomatis belum aktif di server. Akun kamu sudah tersimpan."
      );
      return;
    }

    await refresh();
    // Sama seperti sisi kreator: akun baru selalu belum lengkap, jadi langsung
    // ke wizard daripada lewat dashboard yang akan memantulkan balik.
    router.replace(routes.onboarding);
  }

  if (provisionFailed) {
    return <ProfileProvisionNotice role="umkm" message={provisionFailed} />;
  }

  return (
    <AuthCard
      title="Daftar sebagai UMKM"
      description="Buat akun untuk mulai membuat campaign dan bekerja sama dengan kreator."
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

        <button
          type="submit"
          disabled={pending}
          className="min-h-[46px] w-full rounded-xl bg-orange-500 px-6 text-sm font-[800] text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
        >
          {pending ? "Mendaftarkan…" : "Daftar sebagai UMKM"}
        </button>
      </form>

      <GoogleButton disabled={pending} label="Daftar dengan Google" />
    </AuthCard>
  );
}
