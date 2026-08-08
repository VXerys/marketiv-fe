"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import { completePasswordRecovery } from "@/services/auth/auth.service";
import { resetPasswordSchema, PASSWORD_MIN } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes } from "@/lib/constants/routes";

export function ResetPasswordForm({
  userId,
  secret,
}: {
  userId: string;
  secret: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", passwordConfirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const parsed = parseOrErrors(resetPasswordSchema, form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setPending(true);

    const res = await completePasswordRecovery({ userId, secret, ...parsed.data });
    setPending(false);

    if (!res.success) {
      setBanner(res.error ?? "Gagal mengatur ulang password.");
      return;
    }

    toast.success("Password berhasil diperbarui. Silakan masuk.");
    router.replace(routes.login);
  }

  return (
    <AuthCard
      title="Buat Password Baru"
      description="Masukkan password baru untuk akun kamu."
      footer={
        <Link href={routes.login} className="font-extrabold text-orange-600 hover:underline">
          Kembali ke halaman masuk
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {banner && <AuthErrorBanner message={banner} />}

        <PasswordField
          label="Password Baru"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint={`Minimal ${PASSWORD_MIN} karakter.`}
          disabled={pending}
        />

        <PasswordField
          label="Ulangi Password Baru"
          name="passwordConfirm"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.passwordConfirm}
          onChange={set("passwordConfirm")}
          error={errors.passwordConfirm}
          disabled={pending}
        />

        <button
          type="submit"
          disabled={pending}
          className="min-h-[46px] w-full rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Simpan password baru"}
        </button>
      </form>
    </AuthCard>
  );
}

/** Tautan tanpa userId/secret — form tidak dirender sama sekali. */
export function InvalidRecoveryLink() {
  return (
    <AuthCard
      title="Tautan tidak valid"
      description="Tautan pemulihan ini tidak lengkap atau sudah kedaluwarsa. Minta tautan baru untuk melanjutkan."
      footer={
        <Link href={routes.login} className="font-extrabold text-orange-600 hover:underline">
          Kembali ke halaman masuk
        </Link>
      }
    >
      <Link
        href={routes.forgotPassword}
        className="flex min-h-[46px] w-full items-center justify-center rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer"
      >
        Minta tautan baru
      </Link>
    </AuthCard>
  );
}
