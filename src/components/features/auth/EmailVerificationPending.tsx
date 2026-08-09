"use client";

import { useState } from "react";
import { MailCheck, RefreshCcw, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthErrorBanner } from "@/components/auth/AuthField";
import { requestEmailOtp, confirmEmailOtp } from "@/services/auth/auth.service";

interface EmailVerificationPendingProps {
  email: string;
  /** Akun yang baru dibuat — dibutuhkan untuk menukar OTP jadi sesi. */
  userId: string;
  /** Dipakai memulihkan sesi login bila OTP salah, agar user tak ter-logout. */
  password: string;
  /** Dipanggil setelah verifikasi sukses ATAU saat user memilih lewati. */
  onContinue: () => void;
}

/**
 * Layar setelah register — user memasukkan kode OTP 6 digit dari email untuk
 * mengaktifkan akun. Verifikasi tetap opsional: "Lewati untuk sekarang" tetap
 * bisa masuk dashboard, tapi email belum terverifikasi.
 */
export function EmailVerificationPending({
  email,
  userId,
  password,
  onContinue,
}: EmailVerificationPendingProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const canVerify = code.trim().length === 6 && !verifying;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError(null);
    setVerifying(true);
    const res = await confirmEmailOtp({ userId, email, password, code });
    setVerifying(false);
    if (res.success) {
      onContinue();
    } else {
      setVerifyError(res.error ?? "Kode salah atau kedaluwarsa. Minta kode baru.");
    }
  }

  async function handleResend() {
    setResending(true);
    setResendError(null);
    setVerifyError(null);
    const res = await requestEmailOtp({ userId, email });
    setResending(false);
    if (res.success) {
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } else {
      setResendError(res.error ?? "Gagal mengirim ulang. Coba lagi.");
    }
  }

  return (
    <AuthCard
      title="Cek email kamu"
      description={`Kode 6 digit sudah dikirim ke ${email}. Masukkan di bawah untuk aktifkan akun kamu.`}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-1.5 font-[800] text-orange-600 transition-colors hover:underline"
        >
          Lewati dulu, verifikasi nanti
          <ArrowRight size={13} aria-hidden="true" />
        </button>
      }
    >
      <form onSubmit={handleVerify} className="space-y-4" noValidate>
        {/* Info block */}
        <div className="flex gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3.5">
          <MailCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-[0.8rem] font-[800] text-emerald-800">Kode terkirim!</p>
            <p className="mt-0.5 text-[0.74rem] font-semibold leading-relaxed text-emerald-700">
              Cek kotak masuk dan folder spam. Kode berlaku selama 15 menit.
            </p>
          </div>
        </div>

        {/* OTP input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="otp-code" className="text-[0.74rem] font-extrabold text-ink-950">
            Kode Verifikasi
          </label>
          <input
            id="otp-code"
            name="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="______"
            value={code}
            onChange={(e) => {
              setVerifyError(null);
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            }}
            disabled={verifying}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.5em] text-ink-950 placeholder:tracking-[0.5em] placeholder:text-neutral-300 focus-visible:border-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/30 disabled:opacity-60"
          />
        </div>

        {verifyError && <AuthErrorBanner message={verifyError} />}

        {/* Verify button */}
        <button
          type="submit"
          disabled={!canVerify}
          className="min-h-[46px] w-full rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] transition-all hover:-translate-y-px hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] active:scale-[.98] disabled:pointer-events-none disabled:opacity-60"
        >
          {verifying ? "Memverifikasi…" : "Verifikasi Email"}
        </button>

        {/* Info: why verify */}
        <div className="rounded-xl border border-neutral-200/60 bg-neutral-50 px-4 py-3 text-[0.74rem] font-medium leading-relaxed text-ink-600">
          Verifikasi email diperlukan untuk mengaktifkan fitur penuh akun kamu, termasuk
          pencairan dana pertama.
        </div>

        {/* Resend */}
        {resendError && (
          <p className="text-[0.74rem] font-semibold text-red-600">{resendError}</p>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[15px] border border-neutral-200 bg-white text-sm font-[800] text-ink-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-soft-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
        >
          <RefreshCcw size={14} aria-hidden="true" className={resending ? "animate-spin" : ""} />
          {resending ? "Mengirim ulang…" : resent ? "Kode baru terkirim!" : "Kirim ulang kode"}
        </button>
      </form>
    </AuthCard>
  );
}
