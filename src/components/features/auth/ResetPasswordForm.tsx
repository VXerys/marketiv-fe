"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField, PasswordField, AuthErrorBanner } from "@/components/auth/AuthField";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  completePasswordRecovery,
  completePasswordRecoveryWithOtp,
} from "@/services/auth/auth.service";
import { resetPasswordSchema, PASSWORD_MIN } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes } from "@/lib/constants/routes";

interface ResetPasswordFormProps {
  userId?: string;
  secret?: string;
}

export function ResetPasswordForm({ userId, secret }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode URL link recovery if userId & secret exist
  const isUrlMode = Boolean(userId && secret);

  const initialEmail = searchParams?.get("email") ?? "";
  const resetUserId = searchParams?.get("userId") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState("");
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

    if (!isUrlMode) {
      if (!email.trim()) {
        setErrors((prev) => ({ ...prev, email: "Email wajib diisi." }));
        return;
      }
      if (otpCode.trim().length !== 6) {
        setBanner("Masukkan kode 6 digit OTP yang dikirim ke email kamu.");
        return;
      }
      if (!resetUserId) {
        setBanner("Permintaan reset tidak lengkap. Minta kode OTP baru dari halaman lupa password.");
        return;
      }
    }

    setPending(true);

    let res;
    if (isUrlMode && userId && secret) {
      res = await completePasswordRecovery({ userId, secret, ...parsed.data });
    } else {
      res = await completePasswordRecoveryWithOtp({
        userId: resetUserId,
        otpCode,
        ...parsed.data,
      });
    }
    setPending(false);

    if (!res.success) {
      setBanner(res.error ?? "Gagal mengatur ulang password. Coba lagi.");
      return;
    }

    toast.success("Password berhasil diperbarui. Sekarang kamu bisa masuk.");
    router.replace(routes.login);
  }

  return (
    <AuthCard
      title="Buat Password Baru"
      description={
        isUrlMode
          ? "Masukkan password baru untuk akun kamu."
          : "Masukkan kode OTP 6 digit dan password baru untuk akun kamu."
      }
      footer={
        <Link href={routes.login} className="font-extrabold text-orange-600 hover:underline">
          Kembali ke halaman masuk
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {banner && <AuthErrorBanner message={banner} />}

        {/* Jika bukan mode URL link, tampilkan input email & OTP slot 6-digit */}
        {!isUrlMode && (
          <>
            <AuthField
              label="Email Akun"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={pending}
            />

            <div className="flex flex-col gap-1.5 py-1">
              <label htmlFor="reset-otp-code" className="text-[0.74rem] font-extrabold text-ink-950">
                Kode OTP 6 Digit
              </label>

              <InputOTP
                id="reset-otp-code"
                maxLength={6}
                value={otpCode}
                onChange={(val) => {
                  setBanner(null);
                  setOtpCode(val.replace(/\D/g, "").slice(0, 6));
                }}
                disabled={pending}
                className="w-full flex justify-center gap-1 sm:gap-2"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </>
        )}

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

/** Tautan tanpa userId/secret — tetap izinkan reset via OTP 6-digit! */
export function InvalidRecoveryLink() {
  return <ResetPasswordForm />;
}
