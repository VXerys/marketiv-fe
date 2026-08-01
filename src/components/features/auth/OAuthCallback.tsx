"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import { provisionUserProfile } from "@/services/auth/auth.service";
import { routes, dashboardByRole } from "@/lib/constants/routes";

/**
 * Pendaratan setelah OAuth Google.
 *
 * Sengaja setipis mungkin (§C-6): ini cabang yang paling mungkin salah saat
 * pertama kali bertemu provider nyata, dan providernya belum bisa kami uji.
 *
 * OAuth tidak melewati account.updatePrefs, jadi akun baru sampai di sini tanpa
 * role. Satu percobaan provisioning dijalankan (idempoten, aman untuk akun lama);
 * kalau tetap tidak ada profil, user diarahkan memilih role lewat /register —
 * bukan ditebak rolenya.
 */
export function OAuthCallback({ next }: { next?: string }) {
  const router = useRouter();
  const { user, loading, errorCode, refresh } = useAuth();
  const [settled, setSettled] = useState(false);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    void (async () => {
      await refresh();
      setSettled(true);
    })();
  }, [refresh]);

  useEffect(() => {
    if (!settled || loading) return;

    if (user) {
      router.replace(next || dashboardByRole[user.role]);
      return;
    }

    if (errorCode === "not_found") {
      void (async () => {
        const res = await provisionUserProfile();
        if (res.success) {
          await refresh();
          return;
        }
        // Belum punya role — biarkan user memilihnya sendiri.
        router.replace(routes.register);
      })();
      return;
    }

    router.replace(`${routes.login}?error=oauth`);
  }, [settled, loading, user, errorCode, next, router, refresh]);

  return (
    <AuthCard title="Menyiapkan akun kamu…" description="Sebentar ya, kami sedang memverifikasi sesi Google kamu.">
      <div className="space-y-3">
        <Skeleton className="h-[44px] w-full rounded-xl" />
        <Skeleton className="h-[44px] w-2/3 rounded-xl" />
      </div>
    </AuthCard>
  );
}
