"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  isUserPortalRole,
  resolveSafePostLoginDestination,
  routes,
} from "@/lib/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lempar user yang sudah punya sesi keluar dari halaman auth.
 *
 * Sesi Appwrite hidup di browser (SDK web menyimpannya di sana), jadi ini
 * memang harus client-side — `redirect()` server tidak bisa melihatnya.
 *
 * Precedence guard:
 *   1. loading                    → render skeleton sampai sesi selesai dibaca
 *      belum ada user             → render children (form login/register)
 *   2. preserveUnverifiedSession + email belum terverifikasi
 *                                → render children (layar OTP masih di sini)
 *   3. user ada + profile incomplete → redirect ke /onboarding
 *   4. user ada + profile complete → redirect ke dashboard
 *
 * Ini memastikan layar OTP (EmailVerificationPending) tetap ditampilkan
 * meskipun Appwrite session sudah aktif setelah register, dan setelah OTP verified,
 * navigation owner mengarahkan dengan deterministik ke /onboarding atau dashboard.
 */
export function RedirectIfAuthenticated({
  next,
  preserveUnverifiedSession = false,
  children,
}: {
  next?: string;
  /** Register OTP flow needs to remain mounted for an unverified session. */
  preserveUnverifiedSession?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, errorCode } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    // Hanya register yang boleh menahan sesi unverified untuk layar OTP.
    if (preserveUnverifiedSession && !user.emailVerified) return;

    if (!isUserPortalRole(user.role)) return;

    if (next) {
      router.replace(resolveSafePostLoginDestination(user.role, next));
    } else if (!user.isProfileCompleted) {
      router.replace(routes.onboarding);
    } else {
      router.replace(resolveSafePostLoginDestination(user.role));
    }
  }, [loading, user, next, preserveUnverifiedSession, router]);

  // errorCode "not_found" = akun & sesi ada, tapi baris `users` belum terbentuk
  // (blocker A-1). JANGAN diperlakukan sebagai "sudah login": mengarahkannya ke
  // dashboard membuat RoleGuard memantulkannya balik ke sini — loop tak berujung.
  // Halaman auth tetap dirender supaya user punya jalan keluar.
  //
  // `preserveUnverifiedSession` menjaga layar OTP yang dirender sebagai children
  // dari register form; login tetap masuk ke redirect di bawah.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white" aria-label="Memuat sesi">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (
    !loading &&
    user &&
    isUserPortalRole(user.role) &&
    (!preserveUnverifiedSession || user.emailVerified) &&
    errorCode !== "not_found"
  ) {
    return null;
  }

  return <>{children}</>;
}
