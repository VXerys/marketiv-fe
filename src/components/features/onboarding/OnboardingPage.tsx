"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatorOnboarding } from "./CreatorOnboarding";
import { UmkmOnboarding } from "./UmkmOnboarding";
import { routes, dashboardByRole } from "@/lib/constants/routes";

/**
 * Gerbang halaman onboarding — kebalikan persis dari cabang onboarding di
 * RoleGuard, supaya keduanya tidak saling melempar:
 *
 * - tanpa sesi        → /login?next=/onboarding
 * - profil sudah lengkap → dashboard sesuai role
 * - admin             → dashboard (tidak punya koleksi profil untuk dilengkapi)
 *
 * Penanda "lewati dulu" TIDAK diperiksa di sini: pengguna yang membuka
 * /onboarding secara sengaja memang ingin melanjutkannya.
 */
export function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const redirectTo = !loading
    ? user == null
      ? routes.loginWithNext(routes.onboarding)
      : user.isProfileCompleted || user.role === "admin"
        ? dashboardByRole[user.role]
        : null
    : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (loading || redirectTo || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-xl space-y-4 rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-3xs">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    );
  }

  return user.role === "creator" ? (
    <CreatorOnboarding initialName={user.name} />
  ) : (
    <UmkmOnboarding initialName={user.name} initialPhone={user.phone} />
  );
}
