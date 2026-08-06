"use client";

import { useState } from "react";
import { MailCheck, RefreshCcw, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { requestEmailVerification } from "@/services/auth/auth.service";

interface EmailVerificationPendingProps {
  email: string;
  onContinue: () => void;
}

/**
 * Layar konfirmasi setelah register berhasil — user diminta verifikasi email sebelum lanjut.
 * Sesuai best practice: email verification harus dilakukan sebelum akun dianggap aktif penuh.
 */
export function EmailVerificationPending({ email, onContinue }: EmailVerificationPendingProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    setResending(true);
    setResendError(null);
    const res = await requestEmailVerification();
    setResending(false);
    if (res.success) {
      setResent(true);
      // Reset resent badge after 4s
      setTimeout(() => setResent(false), 4000);
    } else {
      setResendError(res.error ?? "Gagal mengirim ulang. Coba lagi.");
    }
  }

  return (
    <AuthCard
      title="Cek email kamu"
      description={`Kami sudah kirimkan tautan verifikasi ke ${email}. Buka dan klik tautannya untuk mengaktifkan akun.`}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-1.5 font-[800] text-orange-600 transition-colors hover:underline"
        >
          Lewati untuk sekarang
          <ArrowRight size={13} aria-hidden="true" />
        </button>
      }
    >
      <div className="space-y-4">
        {/* Success block */}
        <div className="flex gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3.5">
          <MailCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-[0.8rem] font-[800] text-emerald-800">Email terkirim!</p>
            <p className="mt-0.5 text-[0.74rem] font-semibold leading-relaxed text-emerald-700">
              Cek kotak masuk dan folder spam. Tautan berlaku selama 1 jam.
            </p>
          </div>
        </div>

        {/* Info: why verify */}
        <div className="rounded-xl border border-neutral-200/60 bg-neutral-50 px-4 py-3 text-[0.74rem] font-medium leading-relaxed text-ink-600">
          Verifikasi email diperlukan untuk mengaktifkan fitur penuh akun kamu, termasuk
          pencairan dana pertama.
        </div>

        {/* Resend error */}
        {resendError && (
          <p className="text-[0.74rem] font-semibold text-red-600">{resendError}</p>
        )}

        {/* Resend button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[15px] border border-neutral-200 bg-white text-sm font-[800] text-ink-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-soft-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
        >
          <RefreshCcw size={14} aria-hidden="true" className={resending ? "animate-spin" : ""} />
          {resending ? "Mengirim ulang…" : resent ? "Terkirim!" : "Kirim ulang email verifikasi"}
        </button>
      </div>
    </AuthCard>
  );
}
