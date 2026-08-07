"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthErrorBanner } from "@/components/auth/AuthField";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  provisionUserProfile,
  setOAuthAccountPrefs,
} from "@/services/auth/auth.service";
import { resolveOAuthCallbackDecision } from "@/services/auth/oauth-callback.service";
import { routes } from "@/lib/constants/routes";

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
  const { refresh, logout } = useAuth();
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const ranRef = useRef(false);

  const resolve = useCallback(async () => {
    setRecoveryError(null);
    const session = await refresh();
    let decision = resolveOAuthCallbackDecision({
      user: session.success ? session.data : null,
      errorCode: session.success ? null : session.code,
      next,
      role,
    });

    if (decision.action === "provision_creator") {
      const prefs = await setOAuthAccountPrefs("creator");
      const provision = prefs.success ? await provisionUserProfile() : prefs;
      if (!provision.success) {
        decision = resolveOAuthCallbackDecision({
          user: null,
          errorCode: "not_found",
          role: "creator",
          provisioningSucceeded: false,
        });
        setRecoveryError(
          provision.error ??
            "Akun Google sudah terhubung, tetapi profil Marketiv belum bisa dibuat. Coba lagi atau hubungi admin."
        );
      } else {
        await refresh();
        decision = resolveOAuthCallbackDecision({
          user: null,
          errorCode: "not_found",
          role: "creator",
          provisioningSucceeded: true,
        });
      }
    }

    if (decision.action === "redirect") {
      router.replace(decision.href);
      return;
    }

    setRecoveryError(
      "Akun Google sudah terhubung, tetapi profil Marketiv belum bisa dibuat. Coba lagi atau hubungi admin."
    );
  }, [next, role, router, refresh]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    void Promise.resolve().then(resolve);
  }, [resolve]);

  async function handleRetry() {
    setRetrying(true);
    await resolve();
    setRetrying(false);
  }

  async function handleLogout() {
    await logout();
    router.replace(routes.login);
  }

  if (recoveryError) {
    return (
      <AuthCard
        title="Profil belum bisa dibuat"
        description="Akun Google sudah masuk, tetapi data profil Marketiv belum tersedia."
      >
        <div className="space-y-4">
          <AuthErrorBanner message={recoveryError} />
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="min-h-[46px] w-full rounded-full bg-orange-500 px-6 text-sm font-extrabold text-white transition-all hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {retrying ? "Mencoba lagi…" : "Coba lagi buat profil"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={retrying}
            className="min-h-[46px] w-full rounded-full border border-neutral-200 px-6 text-sm font-extrabold text-ink-700 transition-all hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-60"
          >
            Keluar dan pakai akun lain
          </button>
        </div>
      </AuthCard>
    );
  }

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
