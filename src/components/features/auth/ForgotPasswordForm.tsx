"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField, AuthErrorBanner } from "@/components/auth/AuthField";
import { requestPasswordRecovery } from "@/services/auth/auth.service";
import { forgotPasswordSchema } from "@/lib/validations/auth.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { routes } from "@/lib/constants/routes";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const parsed = parseOrErrors(forgotPasswordSchema, { email });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setPending(true);

    const res = await requestPasswordRecovery(parsed.data);
    setPending(false);

    if (!res.success) {
      setBanner(res.error ?? "Gagal mengirim email pemulihan.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard
        title="Cek email kamu"
        description={`Kami telah mengirimkan kode 6 digit OTP / tautan pemulihan ke ${email}.`}
        footer={
          <Link href={routes.login} className="font-extrabold text-orange-600 hover:underline">
            Kembali ke halaman masuk
          </Link>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3.5">
            <MailCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
            <div>
              <p className="text-[0.8rem] font-[800] text-emerald-800">Kode OTP / Tautan Dikirim!</p>
              <p className="mt-0.5 text-[0.74rem] font-semibold leading-relaxed text-emerald-700">
                Cek kotak masuk dan folder spam. Gunakan kode 6 digit OTP untuk mengatur ulang password.
              </p>
            </div>
          </div>

          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] transition-all hover:-translate-y-px hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] cursor-pointer"
          >
            <span>Masukkan Kode OTP 6-Digit</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Lupa Password"
      description="Masukkan email akun kamu. Kami kirimkan kode OTP 6-digit untuk membuat password baru."
      footer={
        <>
          Ingat passwordnya?{" "}
          <Link href={routes.login} className="font-extrabold text-orange-600 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {banner && <AuthErrorBanner message={banner} />}

        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={pending}
        />

        <button
          type="submit"
          disabled={pending}
          className="min-h-[46px] w-full rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Mengirim Kode OTP…" : "Kirim Kode OTP Reset"}
        </button>
      </form>
    </AuthCard>
  );
}
