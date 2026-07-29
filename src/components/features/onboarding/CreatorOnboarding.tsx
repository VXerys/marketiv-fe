"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  AuthField,
  AuthSelectField,
  AuthTextareaField,
  AuthErrorBanner,
} from "@/components/auth/AuthField";
import {
  OnboardingShell,
  OnboardingPrimaryButton,
  OnboardingSecondaryButton,
} from "./OnboardingShell";
import {
  updateCreatorProfile,
  uploadCreatorAvatar,
  upsertCreatorSocialAccount,
} from "@/services/creator/creator-dashboard.service";
import {
  creatorOnboardingSchema,
  extractSocialUsername,
  CREATOR_NICHES,
} from "@/lib/validations/profile.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { markOnboardingSkipped } from "@/lib/onboarding-skip";
import { dashboardByRole } from "@/lib/constants/routes";

const STEPS = ["Identitas", "Tampilan", "Akun Sosial"] as const;

const NICHE_SELECT_OPTIONS = CREATOR_NICHES.map((n) => ({
  value: n,
  label: n.charAt(0).toUpperCase() + n.slice(1),
}));

export function CreatorOnboarding({ initialName }: { initialName?: string }) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(initialName ?? "");
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);

  /**
   * Validasi bertahap: langkah 1 dan 2 hanya memeriksa field miliknya sendiri,
   * jadi pengguna tidak dimarahi soal bio saat masih mengisi nama.
   */
  function validateStep(target: number): boolean {
    const parsed = parseOrErrors(creatorOnboardingSchema, {
      displayName: displayName.trim(),
      niche,
      city: city.trim(),
      bio: bio.trim(),
    });
    const all = parsed.ok ? {} : parsed.errors;
    const scope =
      target === 1 ? ["displayName", "niche", "city"] : target === 2 ? ["bio"] : [];

    const scoped: Record<string, string> = {};
    for (const key of scope) {
      if (all[key]) scoped[key] = all[key];
    }

    if (target === 3 && !extractSocialUsername(tiktok)) {
      scoped.tiktok = tiktok.trim()
        ? "Tautan/username TikTok tidak valid."
        : "Akun TikTok wajib diisi.";
    }
    if (target === 3 && instagram.trim() && !extractSocialUsername(instagram)) {
      scoped.instagram = "Tautan/username Instagram tidak valid.";
    }

    setErrors(scoped);
    return Object.keys(scoped).length === 0;
  }

  function handleNext() {
    setBanner(null);
    if (validateStep(step)) setStep((s) => s + 1);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBanner(null);
    setUploading(true);
    const res = await uploadCreatorAvatar(file);
    setUploading(false);

    if (!res.success || !res.data) {
      setBanner(res.error ?? "Gagal mengunggah foto profil.");
      return;
    }
    setAvatarUrl(res.data);
  }

  /**
   * Urutan penyimpanan disengaja: akun sosial LEBIH DULU, `isProfileCompleted`
   * paling akhir.
   *
   * Flag itulah yang membuka gerbang `get-creator-directory`. Menyetelnya lebih
   * dulu lalu gagal menulis akun sosial akan menerbitkan kartu kreator tanpa
   * username maupun engagement rate ke seluruh UMKM — kondisi rusak yang tidak
   * terlihat dari sisi kreator.
   */
  async function handleSubmit() {
    setBanner(null);
    if (!validateStep(3)) return;

    const parsed = parseOrErrors(creatorOnboardingSchema, {
      displayName: displayName.trim(),
      niche,
      city: city.trim(),
      bio: bio.trim(),
    });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setStep(1);
      return;
    }

    setPending(true);

    const social = await upsertCreatorSocialAccount({
      platform: "tiktok",
      username: extractSocialUsername(tiktok),
    });
    if (!social.success) {
      setPending(false);
      setBanner(social.error ?? "Gagal menyimpan akun TikTok. Coba lagi.");
      return;
    }

    if (instagram.trim()) {
      // Instagram opsional — kegagalannya tidak boleh membatalkan onboarding,
      // tapi tetap harus terlihat.
      const ig = await upsertCreatorSocialAccount({
        platform: "instagram",
        username: extractSocialUsername(instagram),
      });
      if (!ig.success) setBanner("Akun Instagram gagal disimpan, bisa diisi ulang di Pengaturan.");
    }

    const res = await updateCreatorProfile({
      ...parsed.data,
      ...(avatarUrl ? { avatarUrl } : {}),
      isProfileCompleted: true,
    });
    setPending(false);

    if (!res.success) {
      setBanner(
        res.code === "auth"
          ? "Sesi berakhir, silakan login kembali."
          : res.error ?? "Gagal menyimpan profil. Coba lagi."
      );
      return;
    }

    await refresh();
    router.replace(dashboardByRole.creator);
  }

  function handleSkip() {
    markOnboardingSkipped();
    router.replace(dashboardByRole.creator);
  }

  const busy = pending || uploading;

  return (
    <OnboardingShell
      title="Lengkapi Profil Kreator"
      description="Profil yang lengkap adalah syarat kamu tampil di direktori UMKM dan bisa mengambil campaign dari Job Pool."
      steps={STEPS}
      currentStep={step}
      footer={
        <div className="space-y-2.5">
          {step < STEPS.length ? (
            <OnboardingPrimaryButton type="button" onClick={handleNext} disabled={busy}>
              Lanjut
            </OnboardingPrimaryButton>
          ) : (
            <OnboardingPrimaryButton type="button" onClick={handleSubmit} disabled={busy}>
              {pending ? "Menyimpan…" : "Selesaikan Profil"}
            </OnboardingPrimaryButton>
          )}

          {step > 1 ? (
            <OnboardingSecondaryButton
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={busy}
            >
              Kembali
            </OnboardingSecondaryButton>
          ) : (
            <OnboardingSecondaryButton type="button" onClick={handleSkip} disabled={busy}>
              Lewati dulu
            </OnboardingSecondaryButton>
          )}

          <p className="pt-1 text-center text-[0.7rem] font-semibold leading-relaxed text-ink-400">
            Kalau dilewati, kamu tetap bisa masuk dashboard — tapi belum muncul di
            direktori UMKM dan belum bisa klaim campaign.
          </p>
        </div>
      }
    >
      {banner && (
        <div className="mb-4">
          <AuthErrorBanner message={banner} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <AuthField
            label="Nama Display"
            name="displayName"
            autoComplete="name"
            placeholder="Nadia Visuals"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={errors.displayName}
            disabled={busy}
          />
          <AuthSelectField
            label="Niche Konten"
            name="niche"
            placeholder="Pilih niche…"
            options={NICHE_SELECT_OPTIONS}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            error={errors.niche}
            disabled={busy}
          />
          <AuthField
            label="Kota"
            name="city"
            autoComplete="address-level2"
            placeholder="Sukabumi"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
            hint="Dipakai UMKM untuk mencari kreator terdekat."
            disabled={busy}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <AuthTextareaField
            label="Bio Singkat"
            name="bio"
            rows={4}
            placeholder="Ceritakan gaya konten dan pengalamanmu dalam beberapa kalimat."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            error={errors.bio}
            hint="Tampil di kartu profilmu pada direktori UMKM."
            disabled={busy}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.74rem] font-[800] text-ink-600">
              Foto Profil <span className="font-semibold text-ink-400">(opsional)</span>
            </span>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Pratinjau foto profil"
                    width={64}
                    height={64}
                    className="h-16 w-16 object-cover"
                    unoptimized
                  />
                ) : (
                  <UserRound size={22} className="text-ink-400" aria-hidden />
                )}
              </div>
              <label className="min-h-[44px] flex-1 cursor-pointer rounded-xl border border-neutral-200 px-4 py-2.5 text-center text-sm font-[800] text-ink-600 transition-all hover:bg-neutral-50">
                {uploading ? "Mengunggah…" : avatarUrl ? "Ganti foto" : "Pilih foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  disabled={busy}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <AuthField
            label="Akun TikTok"
            name="tiktok"
            placeholder="@nadia.visuals atau tautan profilnya"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            error={errors.tiktok}
            hint="Wajib — TikTok adalah platform yang dipakai UMKM untuk menilai kreator."
            disabled={busy}
          />
          <AuthField
            label="Akun Instagram (opsional)"
            name="instagram"
            placeholder="@nadia.visuals atau tautan profilnya"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            error={errors.instagram}
            disabled={busy}
          />
        </div>
      )}
    </OnboardingShell>
  );
}
