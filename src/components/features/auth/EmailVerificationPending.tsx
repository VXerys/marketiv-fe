"use client";

import { useEffect, useState, useCallback } from "react";
import { MailCheck, RefreshCcw, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthErrorBanner } from "@/components/auth/AuthField";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
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

const COOLDOWN_SECONDS = 60;

/**
 * Layar setelah register — user memasukkan kode OTP 6 digit dari email untuk
 * mengaktifkan akun. Menggunakan visual 6-slot InputOTP dengan countdown cooldown 60s.
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

  // ⏱️ Cooldown timer 60 detik untuk tombol resend OTP
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const canVerify = code.trim().length === 6 && !verifying;

  const submitOtp = useCallback(
    async (otpCode: string) => {
      if (otpCode.length !== 6 || verifying) return;
      setVerifyError(null);
      setVerifying(true);

      const res = await confirmEmailOtp({ userId, email, password, code: otpCode });
      setVerifying(false);

      if (res.success) {
        onContinue();
      } else {
        setVerifyError(res.error ?? "Kode salah atau kedaluwarsa. Minta kode baru.");
      }
    },
    [userId, email, password, verifying, onContinue]
  );

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 6) {
      await submitOtp(code);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setResendError(null);
    setVerifyError(null);
    const res = await requestEmailOtp({ userId, email });
    setResending(false);

    if (res.success) {
      setResent(true);
      setCooldown(COOLDOWN_SECONDS);
      setTimeout(() => setResent(false), 4000);
    } else {
      setResendError(res.error ?? "Gagal mengirim ulang. Coba lagi.");
    }
  }

  return (
    <AuthCard
      title="Cek email kamu"
      description={`Kode OTP 6 digit telah dikirim ke ${email}. Masukkan di bawah untuk mengaktifkan akun kamu.`}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-1.5 font-[800] text-orange-600 transition-colors hover:underline cursor-pointer"
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
            <p className="text-[0.8rem] font-[800] text-emerald-800">Kode OTP terkirim!</p>
            <p className="mt-0.5 text-[0.74rem] font-semibold leading-relaxed text-emerald-700">
              Cek kotak masuk dan folder spam. Kode berlaku selama 15 menit.
            </p>
          </div>
        </div>

        {/* Visual 6-Slot InputOTP Component */}
        <div className="flex flex-col items-center gap-2 py-2">
          <label htmlFor="otp-code" className="self-start text-[0.74rem] font-extrabold text-ink-950">
            Kode Verifikasi 6 Digit
          </label>

          <InputOTP
            id="otp-code"
            maxLength={6}
            value={code}
            onChange={(val) => {
              const nextCode = val.replace(/\D/g, "").slice(0, 6);
              setVerifyError(null);
              setCode(nextCode);
              if (nextCode.length === 6 && !verifying) {
                setTimeout(() => void submitOtp(nextCode), 0);
              }
            }}
            disabled={verifying}
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

        {verifyError && <AuthErrorBanner message={verifyError} />}

        {/* Verify button */}
        <button
          type="submit"
          disabled={!canVerify}
          className="min-h-[46px] w-full rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] transition-all hover:-translate-y-px hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] active:scale-[.98] disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
        >
          {verifying ? "Memverifikasi…" : "Verifikasi Email"}
        </button>

        {/* Info: why verify */}
        <div className="rounded-xl border border-neutral-200/60 bg-neutral-50 px-4 py-3 text-[0.74rem] font-medium leading-relaxed text-ink-600">
          Verifikasi email diperlukan untuk mengaktifkan fitur penuh akun kamu, termasuk
          pencairan dana pertama.
        </div>

        {/* Resend button with 60s cooldown timer */}
        {resendError && (
          <p className="text-[0.74rem] font-semibold text-red-600 text-center">{resendError}</p>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[15px] border border-neutral-200 bg-white text-sm font-[800] text-ink-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-soft-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 cursor-pointer active:translate-y-0"
        >
          <RefreshCcw size={14} aria-hidden="true" className={resending ? "animate-spin" : ""} />
          {resending
            ? "Mengirim ulang…"
            : resent
            ? "Kode baru terkirim!"
            : cooldown > 0
            ? `Kirim ulang kode (${cooldown}s)`
            : "Kirim ulang kode"}
        </button>
      </form>
    </AuthCard>
  );
}
