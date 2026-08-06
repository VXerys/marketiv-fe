"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { confirmEmailVerification } from "@/services/auth/auth.service";
import { useAuth } from "@/components/providers/AuthProvider";
import { routes } from "@/lib/constants/routes";
import Link from "next/link";

interface VerifyEmailPageProps {
  userId: string;
  secret: string;
}

/**
 * Halaman konfirmasi verifikasi email.
 * Dipanggil setelah user klik tautan dari email Appwrite.
 * Mount → langsung panggil confirmEmailVerification, lalu redirect ke onboarding.
 */
export function VerifyEmailPage({ userId, secret }: VerifyEmailPageProps) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const res = await confirmEmailVerification({ userId, secret });
      if (cancelled) return;

      if (res.success) {
        setStatus("success");
        await refresh();
        // Beri sedetik buat user lihat pesan sukses, lalu kirim ke onboarding.
        setTimeout(() => {
          if (!cancelled) router.replace(routes.onboarding);
        }, 1800);
      } else {
        setStatus("error");
        setErrorMessage(
          res.error ?? "Tautan verifikasi tidak valid atau sudah kedaluwarsa."
        );
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [userId, secret, router, refresh]);

  if (status === "loading") {
    return (
      <AuthCard
        title="Memverifikasi email…"
        description="Tunggu sebentar, kami sedang mengonfirmasi alamat email kamu."
      >
        <div className="flex justify-center py-4">
          <Loader2 size={32} className="animate-spin text-orange-500" aria-label="Memuat" />
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard
        title="Email terverifikasi!"
        description="Alamat email kamu sudah dikonfirmasi. Kamu akan diarahkan ke onboarding."
      >
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle2 size={40} className="text-emerald-500" aria-hidden="true" />
          <p className="text-[0.82rem] font-semibold text-ink-500">
            Mengarahkan ke halaman setup akun…
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verifikasi gagal"
      description={errorMessage ?? "Tautan tidak valid atau sudah kedaluwarsa."}
      footer={
        <Link
          href={routes.login}
          className="font-[800] text-orange-600 hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-3 py-4">
        <XCircle size={40} className="text-red-500" aria-hidden="true" />
        <p className="text-[0.8rem] font-semibold text-ink-500">
          Minta tautan baru dari halaman profil atau daftar ulang.
        </p>
      </div>
    </AuthCard>
  );
}
