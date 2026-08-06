"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  provisionUserProfile,
  setOAuthAccountPrefs,
} from "@/services/auth/auth.service";
import { routes, dashboardByRole } from "@/lib/constants/routes";

/**
 * Pendaratan setelah OAuth Google.
 *
 * Alur berdasarkan `role` yang diteruskan via success URL:
 *   - Akun lama (user sudah ada):    → next || dashboard sesuai role
 *   - Akun baru + role=creator:      → set prefs → provision → onboarding
 *   - Akun baru + role=umkm:         → redirect ke /auth/oauth-complete untuk
 *                                       mengumpulkan businessName, category, phone
 *   - Akun baru tanpa role:          → /register (pilih role dulu)
 */
export function OAuthCallback({
  next,
  role,
}: {
  next?: string;
  role?: "umkm" | "creator";
}) {
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

    // Akun lama sudah punya profil lengkap.
    if (user) {
      router.replace(next || dashboardByRole[user.role]);
      return;
    }

    if (errorCode === "not_found") {
      void (async () => {
        if (role === "umkm") {
          // UMKM butuh data tambahan (nama usaha, kategori, telepon) sebelum
          // profil bisa di-provision. Arahkan ke form khusus.
          router.replace(`/auth/oauth-complete?role=umkm`);
          return;
        }

        if (role === "creator") {
          // Kreator tidak butuh data tambahan — set role di prefs lalu provision.
          await setOAuthAccountPrefs("creator");
          const provision = await provisionUserProfile();
          if (provision.success) {
            await refresh();
            router.replace(routes.onboarding);
          } else {
            router.replace(routes.register);
          }
          return;
        }

        // Tidak ada role — biarkan user pilih sendiri.
        router.replace(routes.register);
      })();
      return;
    }

    router.replace(`${routes.login}?error=oauth`);
  }, [settled, loading, user, errorCode, next, role, router, refresh]);

  return (
    <AuthCard
      title="Menyiapkan akun kamu…"
      description="Sebentar ya, kami sedang memverifikasi sesi Google kamu."
    >
      <div className="space-y-3">
        <Skeleton className="h-[44px] w-full rounded-xl" />
        <Skeleton className="h-[44px] w-2/3 rounded-xl" />
      </div>
    </AuthCard>
  );
}
