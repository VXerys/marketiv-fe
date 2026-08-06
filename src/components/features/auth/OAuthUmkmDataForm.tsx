"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField, AuthSelectField, AuthErrorBanner } from "@/components/auth/AuthField";
import {
  setOAuthAccountPrefs,
  provisionUserProfile,
} from "@/services/auth/auth.service";
import { routes } from "@/lib/constants/routes";
import { z } from "zod";
import { NICHE_OPTIONS } from "@/components/features/umkm-dashboard/create-campaign/create-campaign.constants";

const CATEGORY_OPTIONS = NICHE_OPTIONS.map((o) => ({
  value: o.id,
  label: `${o.label} — ${o.desc}`,
}));

const schema = z.object({
  businessName: z.string().min(2, "Nama usaha minimal 2 karakter."),
  category: z.string().min(1, "Pilih kategori usaha."),
  phone: z
    .string()
    .min(9, "Nomor WhatsApp tidak valid.")
    .regex(/^[0-9+\-\s]+$/, "Nomor WhatsApp hanya boleh berisi angka."),
});

const EMPTY = { businessName: "", category: "", phone: "" };

/**
 * Form data tambahan untuk UMKM yang mendaftar via Google OAuth.
 * Google menyediakan email+nama, tapi tidak businessName/category/phone.
 */
export function OAuthUmkmDataForm() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPending(true);

    const prefsRes = await setOAuthAccountPrefs("umkm", result.data);
    if (!prefsRes.success) {
      setPending(false);
      setBanner(prefsRes.error ?? "Gagal menyimpan data. Coba lagi.");
      return;
    }

    const provisionRes = await provisionUserProfile();
    if (!provisionRes.success) {
      setPending(false);
      setBanner(
        "Profil otomatis belum aktif. Akun kamu sudah terhubung, tapi profil belum terbentuk. Hubungi admin Marketiv."
      );
      return;
    }

    await refresh();
    router.replace(routes.onboarding);
  }

  return (
    <AuthCard
      title="Satu langkah lagi"
      description="Lengkapi data usahamu untuk menyelesaikan pendaftaran via Google."
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

        <button
          type="submit"
          disabled={pending}
          className="min-h-[46px] w-full rounded-[15px] bg-orange-500 px-6 text-sm font-[800] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
        >
          {pending ? "Menyimpan…" : "Selesaikan Pendaftaran"}
        </button>
      </form>
    </AuthCard>
  );
}
