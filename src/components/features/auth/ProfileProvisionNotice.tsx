"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { provisionUserProfile } from "@/services/auth/auth.service";
import { dashboardByRole } from "@/lib/constants/routes";
import type { UserRole } from "@/types/domain";

/**
 * Akun & sesi sudah terbentuk, tapi baris `users` dan profilnya belum.
 *
 * Ini state yang dialami SETIAP registrasi hari ini: `create-user-profile` belum
 * punya `execute` untuk role `users` (handoff-auth-sprint6.md §A-1), jadi
 * langkah terakhir register selalu 401.
 *
 * Sengaja bukan layar error: mengulang register dengan email yang sama akan kena
 * 409 user_already_exists — jalan buntu. Yang benar adalah mengulang langkah yang
 * gagal saja. Begitu tim backend memberi izinnya, tombol di bawah langsung
 * bekerja tanpa perubahan kode.
 */
export function ProfileProvisionNotice({
  role,
  message,
}: {
  role: UserRole;
  message?: string;
}) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [pending, setPending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(message ?? null);

  async function handleRetry() {
    setPending(true);
    setLastError(null);

    const res = await provisionUserProfile();
    if (res.success) {
      await refresh();
      const target = dashboardByRole[role];
      if (target.startsWith("http://") || target.startsWith("https://")) {
        window.location.replace(target);
      } else {
        router.replace(target);
      }
      return;
    }

    setPending(false);
    setLastError(res.error ?? "Profil masih belum bisa dibuat. Coba lagi nanti.");
  }

  return (
    <AuthCard
      title="Akun kamu sudah dibuat"
      description="Kamu sudah masuk, tapi profilnya belum selesai dibentuk di server. Dashboard belum bisa dibuka sampai langkah ini berhasil."
    >
      <div className="space-y-4">
        <div className="flex gap-3 rounded-xl border border-amber-200/70 bg-amber-50 px-4 py-3">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p className="text-[0.76rem] font-semibold leading-relaxed text-amber-800">
            {lastError ??
              "Pembuatan profil otomatis belum aktif di server. Tim Marketiv sedang menyiapkannya."}
          </p>
        </div>

        <p className="text-[0.76rem] font-medium leading-relaxed text-ink-500">
          Akun dan email kamu <strong className="font-[800] text-ink-900">tidak perlu didaftarkan ulang</strong>.
          Cukup ulangi langkah terakhir ini — atau coba lagi nanti lewat halaman
          masuk, kami akan melanjutkannya otomatis.
        </p>

        <button
          onClick={handleRetry}
          disabled={pending}
          className="min-h-[46px] w-full rounded-xl bg-orange-500 px-6 text-sm font-[800] text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
        >
          {pending ? "Mencoba lagi…" : "Coba buat profil lagi"}
        </button>
      </div>
    </AuthCard>
  );
}
